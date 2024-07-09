import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { isNotEmpty } from 'class-validator';
import { TableName, CreateGenTableDto, GenDbTableList, GenTableList, GenTableUpdate } from './dto/create-genTable-dto';
import { ResultData } from 'src/common/utils/result';
import { FormatDate, GetNowDate } from 'src/common/utils/index';
import { GenTableEntity } from './entities/gen-table.entity';
import { GenTableColumnEntity } from './entities/gen-table-cloumn.entity';
import toolConfig from './config';
import { GenConstants } from 'src/common/constant/GenConstants';
import { camelCase, toLower } from 'lodash';
import { arraysContains, getColumnLength, StringUtils, capitalize } from './utils/index';
import { index as templateIndex } from './template/index';
import archiver from 'archiver';
import * as fs from 'fs-extra';
import * as path from 'path';
@Injectable()
export class ToolService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(GenTableEntity)
    private readonly genTableEntityRep: Repository<GenTableEntity>,
    @InjectRepository(GenTableColumnEntity)
    private readonly genTableColumnEntityRep: Repository<GenTableColumnEntity>,
  ) {}
  /**
   * 查询生成表数据
   * @param query
   * @returns
   */
  async findAll(query: GenTableList) {
    const { pageNum = 1, pageSize = 10, tableNames, tableComment } = query;
    const entity = this.genTableEntityRep.createQueryBuilder('entity');
    entity.where('entity.delFlag = :delFlag', { delFlag: '0' });
    if (tableNames) {
      entity.andWhere('entity.tableName LIKE :tableNames', { tableNames: `%${tableNames}%` });
    }

    if (tableComment) {
      entity.andWhere('entity.comment LIKE :tableComment', { tableComment: `%${tableComment}%` });
    }
    const [list, total] = await entity
      .skip((pageNum - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();
    return ResultData.ok({
      list,
      total: total,
    });
  }

  /**
   * 导入表
   * @param table
   * @param req
   * @returns
   */
  async importTable(table: TableName, req: any) {
    const tableNames = table.tableNames.split(',');
    const tableList = await this.selectDbTableListByNames(tableNames);

    for (const table of tableList) {
      const tableName = table.tableName;
      const tableData: CreateGenTableDto = {
        tableName: tableName,
        tableComment: table.tableComment?.trim() || table.tableName,
        className: toolConfig.autoRemovePre ? StringUtils.toPascalCase(tableName.replace(new RegExp(toolConfig.tablePrefix.join('|')), '')) : StringUtils.toPascalCase(tableName),
        packageName: toolConfig.packageName,
        moduleName: toolConfig.moduleName,
        businessName: tableName.slice(tableName.lastIndexOf('_') + 1), //生成业务名
        functionName: table.tableComment?.trim() || table.tableName, //生成功能名
        functionAuthor: toolConfig.author,
        createBy: req.user.username,
      };
      const tableInfo = await this.genTableEntityRep.save(tableData);

      const tableColumn: any = await this.getTableColumnInfo(tableName);

      for (const column of tableColumn) {
        this.initTableColumn(column, tableInfo);
        column.sort = Number(column.sort);
        await this.genTableColumnEntityRep.save(column);
      }
    }
    return ResultData.ok('添加成功');
  }

  /**
   * 同步数据库,  我们导入了需要生成代码的数据表，但是我们更改了数据库的结构（比如删除了一些字段，和添加了一些字段），同步更新表数据
   * @param table
   * @param req
   */
  async synchDb(tableName: string) {
    const table = await this.findOneByTableName(tableName);
    if (!table) throw new BadRequestException('同步数据失败，原表结构不存在！');
    //已在数据库中的表列信息
    const tableColumns = table.columns;
    //更改后的数据库表的列信息
    const columns: any = await this.getTableColumnInfo(tableName);

    if (!columns || !columns?.length) throw new BadRequestException('同步数据失败，原表结构不存在！');
    //存储之前就存在已生成的列信息
    const tableColumnMap = {};
    for (const v of tableColumns) {
      tableColumnMap[v.columnName] = v;
    }

    //更新或插入列
    for (const column of columns) {
      //初始化column的值
      this.initTableColumn(column, table);
      //如果之前存储过，更新
      if (tableColumnMap[column.columnName]) {
        //之前存储的列
        const prevColumn = tableColumnMap[column.columnName];
        column.columnId = prevColumn.columnId;
        column.sort = Number(column.sort);
        if (column.isList === '1') {
          // 如果是列表，继续保留查询方式/字典类型选项
          column.dictType = prevColumn.dictType;
          column.queryType = prevColumn.queryType;
        }
        await this.genTableColumnEntityRep.update({ columnId: column.columnId }, column);
      }
      //插入
      else {
        column.sort = Number(column);
        await this.genTableEntityRep.save(column);
      }
    }
    //删除已经不存在表中数据
    if (tableColumns.length > 0) {
      const delColumns = tableColumns.filter((v) => !columns.some((z) => z.columnName === v.columnName)).map((v) => v.columnId);
      if (delColumns.length > 0) {
        await this.genTableColumnEntityRep.delete(delColumns);
      }
    }
    return ResultData.ok();
  }

  /**
   * 根据表名批量获取表的基本信息（包含注释）
   * @param tableNames
   * @returns
   */
  selectDbTableListByNames(tableNames: string[]) {
    if (!tableNames.length) return null;
    return this.dataSource.query(
      `select table_name as tableName, table_comment as tableComment, create_time as createTime, update_time as updateTime from information_schema.tables
      where table_schema = (select database())
      and table_name NOT LIKE 'qrtz_%' and table_name NOT LIKE 'gen_%'
      and table_name NOT IN (select table_name from gen_table)
      and table_name IN (${'?,'.repeat(tableNames.length).slice(0, -1)})`,
      tableNames,
    );
  }

  /**
   * 根据表名获取表的字段信息以及注释
   * @param tableName
   * @returns
   */
  async getTableColumnInfo(tableName: string) {
    if (!tableName) return null;
    return this.dataSource.query(
      `select column_name as columnName,
      (case when (is_nullable = 'no' && column_key != 'PRI')  then '1' else '0' end) as isRequired,
      (case when column_key = 'PRI' then '1' else '0' end) as isPk,
      ordinal_position as sort, column_comment as columnComment, 
      (case when extra = 'auto_increment' then '1' else '0' end) as isIncrement, 
      column_type as columnType from information_schema.columns
      where table_schema = (select database()) and table_name = '${tableName}' order by ordinal_position`,
    );
  }

  /**
   * 根据id查询表详细信息
   * @param id
   * @returns
   */
  async findOne(id: number) {
    const data = await this.genTableEntityRep.findOne({ where: { tableId: id, delFlag: '0' } });
    const columns = await this.genTableColumnEntityRep.find({ where: { tableId: id, delFlag: '0' } });
    return ResultData.ok({ info: { ...data, columns } });
  }

  /**
   * 根据表名查询表详细信息
   * @param tableName
   * @returns
   */
  async findOneByTableName(tableName: string) {
    const data = await this.genTableEntityRep.findOne({ where: { tableName: tableName, delFlag: '0' } });
    const columns = await this.genTableColumnEntityRep.find({ where: { tableId: data.tableId, delFlag: '0' } });
    return { ...data, columns };
  }

  /**
   * 修改代码生成信息
   * @param genTableUpdate
   * @returns
   */
  async genUpdate(genTableUpdate: GenTableUpdate) {
    for (const item of genTableUpdate.columns) {
      if (item.columnId) await this.genTableColumnEntityRep.update({ columnId: item.columnId }, item);
    }
    delete genTableUpdate.columns;
    await this.genTableEntityRep.update({ tableId: +genTableUpdate.tableId }, genTableUpdate);
    return ResultData.ok({ genTableUpdate });
  }

  /**
   * 删除表
   * @param id
   * @returns
   */
  async remove(id: number) {
    await this.genTableEntityRep.update({ tableId: id }, { delFlag: '1' });
    return ResultData.ok();
  }

  /**
   * 生成代码压缩包
   * @param table
   * @param res
   */
  async batchGenCode(table: TableName, res) {
    const zipFilePath = path.join(__dirname, 'temp.zip');
    const output = fs.createWriteStream(zipFilePath);
    const archive = archiver('zip', {
      zlib: { level: 9 },
    });
    output.on('close', async () => {
      res.download(zipFilePath, 'download.zip', async (err) => {
        if (!err) await fs.remove(zipFilePath);
        else res.status(500).send('Error downloading file');
      });
    });

    archive.on('error', (err) => {
      throw err;
    });
    const tableNamesList = table.tableNames.split(',');
    const tableList = await Promise.all(
      tableNamesList.map(async (item) => {
        const data = await this.genTableEntityRep.findOne({ where: { tableName: item, delFlag: '0' } });
        const columns = await this.genTableColumnEntityRep.find({ where: { tableId: data.tableId, delFlag: '0' } });
        const metadata = this.dataSource.getMetadata(data.tableName);
        const primaryKey = metadata.primaryColumns[0]?.propertyName || '';
        return { primaryKey, BusinessName: data.businessName, ...data, columns };
      }),
    );

    archive.pipe(output);
    for (const item of tableList) {
      const list = templateIndex(item);
      const templates = [
        { content: list['tool/template/nestjs/entity.ts.vm'], path: `nestjs/${item.BusinessName}/entities/${item.businessName}.entity.ts` },
        { content: list['tool/template/nestjs/dto.ts.vm'], path: `nestjs/${item.BusinessName}/dto/${item.businessName}.dto.ts` },
        { content: list['tool/template/nestjs/controller.ts.vm'], path: `nestjs/${item.BusinessName}/${item.businessName}.controller.ts` },
        { content: list['tool/template/nestjs/service.ts.vm'], path: `nestjs/${item.BusinessName}/${item.businessName}.service.ts` },
        { content: list['tool/template/nestjs/module.ts.vm'], path: `nestjs/${item.BusinessName}/${item.businessName}.module.ts` },
        { content: list['tool/template/vue/api.js.vm'], path: `vue/${item.BusinessName}/${item.businessName}.js` },
        { content: list['tool/template/vue/indexVue.vue.vm'], path: `vue/${item.BusinessName}/${item.businessName}/index.vue` },
        { content: list['tool/template/vue/dialogVue.vue.vm'], path: `vue/${item.BusinessName}/${item.businessName}/components/indexDialog.vue` },
      ];

      for (const template of templates) {
        if (!template.content) throw new Error('One or more templates are undefined');
        archive.append(Buffer.from(template.content), { name: template.path });
      }
    }

    await archive.finalize();
  }

  /**
   * 预览生成代码
   * @param id
   * @returns
   */
  async preview(id: number) {
    const data = await this.genTableEntityRep.findOne({ where: { tableId: id, delFlag: '0' } });
    const columns = await this.genTableColumnEntityRep.find({ where: { tableId: id, delFlag: '0' } });
    const metadata = this.dataSource.getMetadata(data.tableName);
    const primaryKey = metadata.primaryColumns[0]?.propertyName || '';
    const info = { primaryKey, BusinessName: capitalize(data.businessName), ...data, columns };
    return ResultData.ok(templateIndex(info));
  }
  /**
   * 查询db数据库列表
   * @returns
   */
  async genDbList(q: GenDbTableList) {
    const params = [];
    let sql = `
    select table_name as tableName, table_comment as tableComment, create_time as createTime, update_time as updateTime from information_schema.tables
    where table_schema = (select database())
    and table_name NOT LIKE 'qrtz_%' and table_name NOT LIKE 'gen_%'
    and table_name NOT IN (select table_name from gen_table)`;
    let sqlCount = `
    select count(*) as total from information_schema.tables
    where table_schema = (select database())
    and table_name NOT LIKE 'qrtz_%' and table_name NOT LIKE 'gen_%'
    and table_name NOT IN (select table_name from gen_table)
    `;
    if (isNotEmpty(q.tableName)) {
      sql += ` and table_name like concat("%", ?,"%") `;
      sqlCount += ` and table_name like concat("%", ?,"%") `;
      params.push(q.tableName);
    }
    if (isNotEmpty(q.tableComment)) {
      sql += ` and table_comment like concat("%", ?,"%") `;
      sqlCount += ` and table_comment like concat("%", ?,"%") `;
      params.push(q.tableComment);
    }
    sql += `
      ORDER BY create_time desc, update_time desc
      limit ${(q.pageNum - 1) * q.pageSize},${q.pageSize}
      	`;
    const data = {
      list: await this.dataSource.query(sql, params).then((res) =>
        res.map((v) => ({
          ...v,
          createTime: FormatDate(v.createTime),
          updateTime: FormatDate(v.updateTime),
        })),
      ),
      total: Number((await this.dataSource.query(sqlCount, params))[0]?.total),
    };
    return ResultData.ok(data);
  }

  /**
   * 初始化表列的字段信息
   * @param column
   * @param table
   */
  initTableColumn(column: any, table: any) {
    const columnName = column.columnName;
    const dataType = column.columnType;
    column.tableId = table.tableId;
    column.javaField = camelCase(columnName);
    column.javaType = GenConstants.TYPE_STRING;
    column.queryType = GenConstants.QUERY_EQ;
    column.createBy = column.createBy || 'admin';
    column.columnComment = column.columnComment || column.columnName;
    column.createTime = column.createTime || GetNowDate();
    column.updateBy = 'admin';
    column.updateTime = GetNowDate();
    if (arraysContains(GenConstants.COLUMNTYPE_TEXT, dataType)) {
      column.htmlType = GenConstants.HTML_TEXTAREA;
    } else if (arraysContains(GenConstants.COLUMNTYPE_STR, dataType)) {
      const len = getColumnLength(dataType);
      column.htmlType = len >= 500 ? GenConstants.HTML_TEXTAREA : GenConstants.HTML_INPUT;
    } else if (arraysContains(GenConstants.COLUMNTYPE_TIME, dataType)) {
      column.javaType = GenConstants.TYPE_DATE;
      column.htmlType = GenConstants.HTML_DATETIME;
    } else if (arraysContains(GenConstants.COLUMNTYPE_NUMBER, dataType)) {
      column.htmlType = GenConstants.HTML_INPUT;
      column.javaType = GenConstants.TYPE_NUMBER;
    }

    // 插入字段（默认所有字段都需要插入）
    column.isInsert = GenConstants.REQUIRE;

    // 编辑字段
    if (!arraysContains(GenConstants.COLUMNNAME_NOT_EDIT, columnName) && column.isPk != 1) {
      column.isEdit = GenConstants.REQUIRE;
    }
    // 列表字段
    if (!arraysContains(GenConstants.COLUMNNAME_NOT_LIST, columnName) && column.isPk != 1) {
      column.isList = GenConstants.REQUIRE;
    }
    // 查询字段
    if (!arraysContains(GenConstants.COLUMNNAME_NOT_QUERY, columnName) && column.isPk != 1 && column.htmlType != GenConstants.HTML_TEXTAREA) {
      column.isQuery = GenConstants.REQUIRE;
    }
    const lowerColumnName = toLower(columnName);
    // 查询字段类型
    if (lowerColumnName.includes('name')) {
      column.queryType = GenConstants.QUERY_LIKE;
    }
    // 状态字段设置单选框
    if (lowerColumnName.includes('status')) {
      column.htmlType = GenConstants.HTML_RADIO;
    }
    // 类型&性别字段设置下拉框
    else if (lowerColumnName.includes('type') || lowerColumnName.includes('sex')) {
      column.htmlType = GenConstants.HTML_SELECT;
    }
    //日期字段设置日期控件
    else if (lowerColumnName.includes('time') || lowerColumnName.includes('_date') || lowerColumnName.includes('Date')) {
      column.htmlType = GenConstants.HTML_DATETIME;
      column.queryType = GenConstants.QUERY_BETWEEN;
    }
    // 图片字段设置图片上传控件
    else if (lowerColumnName.includes('image')) {
      column.htmlType = GenConstants.HTML_IMAGE_UPLOAD;
    }
    // 文件字段设置文件上传控件
    else if (lowerColumnName.includes('file')) {
      column.htmlType = GenConstants.HTML_FILE_UPLOAD;
    }
    // 内容字段设置富文本控件
    else if (lowerColumnName.includes('content')) {
      column.htmlType = GenConstants.HTML_EDITOR;
    }
  }
}
