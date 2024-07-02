import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { TableName, CreateGenTableDto, GenDbTableList, GenTableList, GenTableUpdate, TableId } from './dto/create-genTable-dto';
import { CreateGenTableCloumnDto } from './dto/create-genTableCloumn-dto';
import { ResultData } from 'src/common/utils/result';
import { GenTableEntity } from './entities/gen-table.entity';
import { GenTableColumnEntity } from './entities/gen-table-cloumn.entity';
import toolConfig from './config';
import { GenConstants } from 'src/common/constant/GenConstants';
import { arraysContains, getColumnLength, StringUtils, convertToCamelCase, capitalize } from './utils/index';
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
  async importTable(table: TableName, req: any) {
    const tableList = table.tableNames.split(',').filter((name) => this.dataSource.hasMetadata(name));
    const list = tableList.map((name) => this.dataSource.getMetadata(name));

    for (const userMetadata of list) {
      const tableData: CreateGenTableDto = {
        tableName: userMetadata.tableName,
        tableComment: userMetadata.comment,
        className: userMetadata.targetName,
        packageName: toolConfig.packageName,
        moduleName: toolConfig.packageName,
        businessName: convertToCamelCase(userMetadata.tableName),
        functionName: userMetadata.comment,
        functionAuthor: toolConfig.author,
        createBy: req.user.username,
      };
      const res = await this.genTableEntityRep.save(tableData);
      const isPrimary = userMetadata.primaryColumns[0]?.propertyName || '';

      for (const column of userMetadata.columns) {
        const columnsData = getColumnData(column, res, isPrimary);
        await this.genTableColumnEntityRep.save(columnsData);
      }
    }
    return ResultData.ok('添加成功');
  }
  async findOne(id: number) {
    const data = await this.genTableEntityRep.findOne({ where: { tableId: id, delFlag: '0' } });
    const columns = await this.genTableColumnEntityRep.find({ where: { tableId: id, delFlag: '0' } });
    return ResultData.ok({ info: { ...data, columns } });
  }

  async genUpdate(genTableUpdate: GenTableUpdate) {
    for (const item of genTableUpdate.columns) {
      if (item.columnId) await this.genTableColumnEntityRep.update({ columnId: item.columnId }, item);
    }
    delete genTableUpdate.columns;
    await this.genTableEntityRep.update({ tableId: +genTableUpdate.tableId }, genTableUpdate);
    return ResultData.ok({ genTableUpdate });
  }

  async remove(id: number) {
    await this.genTableEntityRep.update({ tableId: id }, { delFlag: '1' });
    return ResultData.ok();
  }
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
        return { primaryKey, BusinessName: capitalize(data.businessName), ...data, columns };
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
  async preview(id: number) {
    const data = await this.genTableEntityRep.findOne({ where: { tableId: id, delFlag: '0' } });
    const columns = await this.genTableColumnEntityRep.find({ where: { tableId: id, delFlag: '0' } });
    const metadata = this.dataSource.getMetadata(data.tableName);
    const primaryKey = metadata.primaryColumns[0]?.propertyName || '';
    const info = { primaryKey, BusinessName: capitalize(data.businessName), ...data, columns };
    return ResultData.ok(templateIndex(info));
  }
  /**
   * 数据表列表详情
   * @returns
   */
  async genDbList(query: GenDbTableList) {
    const { pageNum = 1, pageSize = 10, tableName, tableComment } = query;
    const data = await this.genTableEntityRep.find({ where: { delFlag: '0' } });
    const addedTableNames = data.map((item) => item.tableName);
    const filteredTableMetas = this.dataSource.entityMetadatas.filter((meta) => !addedTableNames.includes(meta.tableName));

    let list = filteredTableMetas.map((tableMeta, index) => ({
      id: index + 1,
      comment: tableMeta.comment,
      tableName: tableMeta.tableName,
      targetName: tableMeta.targetName,
    }));
    if (tableName) {
      list = list.filter((item) => item.tableName.includes(tableName));
    }
    if (tableComment) {
      list = list.filter((item) => item.comment && item.comment.includes(tableComment));
    }
    const total = list.length;
    list = list.slice((pageNum - 1) * pageSize, pageNum * pageSize);
    return ResultData.ok({ list, total });
  }
}

function getColumnData(column, res: any, isPrimary) {
  const { type: dataType, propertyName: columnName, comment } = column;
  const columnLength = getColumnLength(dataType);
  const htmlType =
    arraysContains(GenConstants.COLUMNTYPE_STR, dataType) || arraysContains(GenConstants.COLUMNTYPE_TEXT, dataType)
      ? columnLength >= 500 || arraysContains(GenConstants.COLUMNTYPE_TEXT, dataType)
        ? GenConstants.HTML_TEXTAREA
        : GenConstants.HTML_INPUT
      : arraysContains(GenConstants.COLUMNTYPE_TIME, dataType)
        ? GenConstants.HTML_DATETIME
        : arraysContains(GenConstants.COLUMNTYPE_NUMBER, dataType)
          ? GenConstants.HTML_INPUT
          : '';

  const javaType = arraysContains(GenConstants.COLUMNTYPE_NUMBER, dataType)
    ? GenConstants.TYPE_NUMBER
    : arraysContains(GenConstants.COLUMNTYPE_TIME, dataType)
      ? GenConstants.TYPE_DATE
      : GenConstants.TYPE_STRING;

  const columnsData = {
    tableId: res.tableId,
    createBy: res.createBy,
    columnType: dataType,
    columnComment: comment,
    columnName,
    javaField: StringUtils.toCamelCase(columnName),
    javaType,
    queryType: GenConstants.QUERY_EQ,
    isInsert: GenConstants.REQUIRE,
    htmlType,
    isEdit: '',
    isList: '',
    isQuery: '',
    isPk: columnName === isPrimary ? '1' : '0',
    isIncrement: '',
    isRequired: '',
  };

  if (!GenConstants.COLUMNNAME_NOT_EDIT.includes(columnName) && columnName !== isPrimary) columnsData.isEdit = GenConstants.REQUIRE;
  if (!GenConstants.COLUMNNAME_NOT_LIST.includes(columnName) && columnName !== isPrimary) columnsData.isList = GenConstants.REQUIRE;
  if (!GenConstants.COLUMNNAME_NOT_QUERY.includes(columnName) && columnName !== isPrimary) columnsData.isQuery = GenConstants.REQUIRE;

  if (columnName.endsWith('name')) columnsData.queryType = GenConstants.QUERY_LIKE;
  else if (columnName.endsWith('status')) columnsData.htmlType = GenConstants.HTML_RADIO;
  else if (columnName.endsWith('type') || columnName.endsWith('sex')) columnsData.htmlType = GenConstants.HTML_SELECT;
  else if (columnName.endsWith('image')) columnsData.htmlType = GenConstants.HTML_IMAGE_UPLOAD;
  else if (columnName.endsWith('file')) columnsData.htmlType = GenConstants.HTML_FILE_UPLOAD;
  else if (columnName.endsWith('content')) columnsData.htmlType = GenConstants.HTML_EDITOR;

  return columnsData;
}
