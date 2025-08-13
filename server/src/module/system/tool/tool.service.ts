import * as path from 'node:path'
import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import archiver from 'archiver'
import { isNotEmpty } from 'class-validator'
import * as fs from 'fs-extra'
import { camelCase, toLower } from 'lodash'
import { GenConstants } from 'src/common/constant/gen.constant'
import { FormatDate, GetNowDate } from 'src/common/utils/index'
import { ResultData } from 'src/common/utils/result'
import { UserDto } from 'src/module/system/user/user.decorator'
import { DataSource, In, Repository } from 'typeorm'
import toolConfig from './config'
import {
  CreateGenTableDto,
  GenDbTableList,
  GenTableList,
  GenTableUpdate,
  TableIds,
  TableNames,
} from './dto/create-genTable-dto'
import { GenTableColumnEntity } from './entities/gen-table-cloumn.entity'
import { GenTableEntity } from './entities/gen-table.entity'
import { SqlQueryManager } from './sql'
import { gen, previewGen } from './template/index'
import {
  arraysContains,
  capitalize,
  convertToCamelCase,
  getColumnLength,
  StringUtils,
} from './utils/index'

@Injectable()
export class ToolService {
  private sqlQueryManager: SqlQueryManager

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(GenTableEntity)
    private readonly genTableEntityRep: Repository<GenTableEntity>,
    @InjectRepository(GenTableColumnEntity)
    private readonly genTableColumnEntityRep: Repository<GenTableColumnEntity>,
  ) {
    this.sqlQueryManager = new SqlQueryManager(dataSource)
  }

  /**
   * 查询生成表数据
   * @param query
   * @returns
   */
  async findAll(query: GenTableList) {
    const { pageNum = 1, pageSize = 10, tableNames, tableComment } = query
    const entity = this.genTableEntityRep.createQueryBuilder('entity')
    entity.where('entity.delFlag = :delFlag', { delFlag: '0' })
    if (tableNames) {
      entity.andWhere('entity.tableName LIKE :tableNames', { tableNames: `%${tableNames}%` })
    }

    if (tableComment) {
      entity.andWhere('entity.comment LIKE :tableComment', { tableComment: `%${tableComment}%` })
    }
    const [rows, total] = await entity
      .skip((pageNum - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount()

    return ResultData.rows({ rows, total })
  }

  /**
   * 导入表
   * @param table
   * @param req
   * @returns
   */
  async importTable(table: TableNames, user: UserDto) {
    const tableNames = table.tables.split(',')
    const tableList = await this.selectDbTableListByNames(tableNames)

    for (const table of tableList) {
      const tableName = table.tableName
      const tableData: CreateGenTableDto = {
        tableName,
        tableComment: table.tableComment?.trim() || table.tableName,
        className: toolConfig.autoRemovePre
          ? StringUtils.toPascalCase(
              tableName.replace(new RegExp(toolConfig.tablePrefix.join('|')), ''),
            )
          : StringUtils.toPascalCase(tableName),
        packageName: toolConfig.packageName,
        moduleName: toolConfig.moduleName,
        businessName: tableName.slice(tableName.lastIndexOf('_') + 1), // 生成业务名
        functionName: table.tableComment?.trim() || table.tableName, // 生成功能名
        functionAuthor: toolConfig.author,
        createBy: user.username,
      }
      const tableInfo = await this.genTableEntityRep.save(tableData)

      const tableColumn: any = await this.getTableColumnInfo(tableName)

      for (const column of tableColumn) {
        this.initTableColumn(column, tableInfo)
        column.sort = Number(column.sort)
        await this.genTableColumnEntityRep.save(column)
      }
    }
    return ResultData.ok('添加成功')
  }

  /**
   * 同步数据库,  我们导入了需要生成代码的数据表，但是我们更改了数据库的结构（比如删除了一些字段，和添加了一些字段），同步更新表数据
   * @param table
   */
  async synchDb(tableId: string) {
    const table = (await this.findOne(+tableId))?.data?.info
    if (!table)
      throw new BadRequestException('同步数据失败，原表结构不存在！')
    const tableName = table.tableName
    // 已在数据库中的表列信息
    const tableColumns = table.columns
    // 更改后的数据库表的列信息
    const columns: any = await this.getTableColumnInfo(tableName)

    if (!columns || !columns?.length)
      throw new BadRequestException('同步数据失败，原表结构不存在！')
    // 存储之前就存在已生成的列信息
    const tableColumnMap = {}
    for (const v of tableColumns) {
      tableColumnMap[v.columnName] = v
    }

    // 更新或插入列
    for (const column of columns) {
      // 初始化column的值
      this.initTableColumn(column, table)
      // 如果之前存储过，更新
      if (tableColumnMap[column.columnName]) {
        // 之前存储的列
        const prevColumn = tableColumnMap[column.columnName]
        column.columnId = prevColumn.columnId
        column.sort = Number(column.sort)
        if (column.isList === '1') {
          // 如果是列表，继续保留查询方式/字典类型选项
          column.dictType = prevColumn.dictType
          column.queryType = prevColumn.queryType
        }
        await this.genTableColumnEntityRep.update({ columnId: column.columnId }, column)
      }
      // 插入
      else {
        column.sort = Number(column)
        await this.genTableEntityRep.save(column)
      }
    }
    // 删除已经不存在表中数据
    if (tableColumns.length > 0) {
      const delColumns = tableColumns
        .filter(v => !columns.some(z => z.columnName === v.columnName))
        .map(v => v.columnId)
      if (delColumns.length > 0) {
        await this.genTableColumnEntityRep.delete(delColumns)
      }
    }
    return ResultData.ok()
  }

  /**
   * 根据表名批量获取表的基本信息（包含注释）
   * @param tableNames
   * @returns
   */
  async selectDbTableListByNames(tableNames: string[]) {
    if (!tableNames.length)
      return null
    return this.sqlQueryManager.getTablesByNames(tableNames)
  }

  /**
   * 根据表名获取表的字段信息以及注释
   * @param tableName
   * @returns
   */
  async getTableColumnInfo(tableName: string) {
    if (!tableName)
      return null
    return this.sqlQueryManager.getTableColumns(tableName)
  }

  /**
   * 根据id查询表详细信息
   * @param id
   * @returns
   */
  async findOne(id: number) {
    const data = await this.genTableEntityRep.findOne({ where: { tableId: id, delFlag: '0' } })
    const columns = await this.genTableColumnEntityRep.find({
      where: { tableId: id, delFlag: '0' },
    })
    return ResultData.ok({ info: { ...data, columns } })
  }

  /**
   * 根据表名查询表详细信息
   * @param tableName
   * @returns
   */
  async findOneByTableName(tableName: string) {
    const data = await this.genTableEntityRep.findOne({ where: { tableName, delFlag: '0' } })
    const columns = await this.genTableColumnEntityRep.find({
      where: { tableId: data.tableId, delFlag: '0' },
    })
    return { ...data, columns }
  }

  /**
   * 修改代码生成信息
   * @param genTableUpdate
   * @returns
   */
  async genUpdate(genTableUpdate: GenTableUpdate) {
    for (const item of genTableUpdate.columns) {
      delete (item as any).id
      delete (item as any).query
      delete (item as any).insert
      delete (item as any).edit
      delete (item as any).list
      delete (item as any).required

      if (item.columnId)
        await this.genTableColumnEntityRep.update({ columnId: item.columnId }, item)
    }
    delete genTableUpdate.columns
    await this.genTableEntityRep.update({ tableId: +genTableUpdate.tableId }, genTableUpdate)
    return ResultData.ok({ genTableUpdate })
  }

  /**
   * 删除表
   * @param id
   * @returns
   */
  async remove(ids: number[]) {
    await this.genTableEntityRep.delete({ tableId: In(ids) })
    await this.genTableColumnEntityRep.delete({ tableId: In(ids) })
    return ResultData.ok()
  }

  /**
   * 生成代码压缩包
   * @param table
   * @param res
   */
  async batchGenCode(table: TableIds, res) {
    const zipFilePath = path.posix.join(__dirname, 'temp.zip')
    const output = fs.createWriteStream(zipFilePath)
    const archive = archiver('zip', {
      zlib: { level: 9 },
    })
    output.on('close', async () => {
      res.download(zipFilePath, 'download.zip', async (err) => {
        if (!err)
          await fs.remove(zipFilePath)
        else res.status(500).send('Error downloading file')
      })
    })

    archive.on('error', (err) => {
      throw err
    })

    const tableIdList = table.tableIdStr.split(',')
    const tableList = await Promise.all(
      tableIdList.map(async (item) => {
        const data = await this.genTableEntityRep.findOne({
          where: { tableId: Number(item), delFlag: '0' },
        })
        const columns = await this.genTableColumnEntityRep.find({
          where: { tableId: data.tableId, delFlag: '0' },
        })
        const primaryKey = await this.getPrimaryKey(columns)
        const primaryColumn = columns.find(v => v.isPk === '1')
        return {
          primaryKey,
          primaryColumn,
          permissionPrefix: `${data.moduleName}:${data.businessName}`,
          ...data,
          columns,
          _businessName: data.businessName,
          businessName: convertToCamelCase(data.businessName),
          BusinessName: capitalize(convertToCamelCase(data.businessName)),
        }
      }),
    )

    archive.pipe(output)
    for (const item of tableList) {
      const list = gen(item)

      Object.keys(list).forEach((key) => {
        archive.append(Buffer.from(list[key]), { name: key })
      })
    }

    await archive.finalize()
  }

  /**
   * 查询主键id
   */
  async getPrimaryKey(columns: GenTableColumnEntity[]) {
    for (const column of columns) {
      if (column.isPk === '1') {
        return column.javaField
      }
    }
    return null
  }

  /**
   * 预览生成代码
   * @param id
   * @returns
   */
  async preview(id: number) {
    const data = await this.genTableEntityRep.findOne({ where: { tableId: id, delFlag: '0' } })
    const columns = await this.genTableColumnEntityRep.find({
      where: { tableId: id, delFlag: '0' },
    })
    const primaryKey = await this.getPrimaryKey(columns)
    const primaryColumn = columns.find(v => v.isPk === '1')
    const info = {
      primaryColumn,
      primaryKey,
      permissionPrefix: `${data.moduleName}:${data.businessName}`,
      ...data,
      columns,
      _businessName: data.businessName,
      businessName: convertToCamelCase(data.businessName),
      BusinessName: capitalize(convertToCamelCase(data.businessName)),
    }
    return ResultData.ok(previewGen(info))
  }

  /**
   * 查询db数据库列表
   * @returns
   */
  async genDbList(q: GenDbTableList) {
    const filters = {
      tableName: isNotEmpty(q.tableName) ? q.tableName : undefined,
      tableComment: isNotEmpty(q.tableComment) ? q.tableComment : undefined,
    }

    const pagination = {
      pageNum: q.pageNum,
      pageSize: q.pageSize,
    }

    const { rows, total } = await this.sqlQueryManager.getTables(filters, pagination)

    const data = {
      rows: rows.map(v => ({
        ...v,
        createTime: FormatDate(v.createTime),
        updateTime: FormatDate(v.updateTime),
      })),
      total,
    }
    return ResultData.rows(data)
  }

  /**
   * 初始化表列的字段信息
   * @param column
   * @param table
   */
  initTableColumn(column: any, table: any) {
    const columnName = column.columnName
    const dataType = column.columnType
    column.tableId = table.tableId
    column.javaField = camelCase(columnName)
    column.javaType = GenConstants.TYPE_STRING
    column.queryType = GenConstants.QUERY_EQ
    column.createBy = column.createBy || 'admin'
    column.columnComment = column.columnComment || column.columnName
    column.createTime = column.createTime || GetNowDate()
    column.updateBy = 'admin'
    column.updateTime = GetNowDate()
    if (arraysContains(GenConstants.COLUMNTYPE_TEXT, dataType)) {
      column.htmlType = GenConstants.HTML_TEXTAREA
    }
    else if (arraysContains(GenConstants.COLUMNTYPE_STR, dataType)) {
      const len = getColumnLength(dataType)
      column.htmlType = len >= 500 ? GenConstants.HTML_TEXTAREA : GenConstants.HTML_INPUT
    }
    else if (arraysContains(GenConstants.COLUMNTYPE_TIME, dataType)) {
      column.javaType = GenConstants.TYPE_DATE
      column.htmlType = GenConstants.HTML_DATETIME
    }
    else if (arraysContains(GenConstants.COLUMNTYPE_NUMBER, dataType)) {
      column.htmlType = GenConstants.HTML_INPUT
      column.javaType = GenConstants.TYPE_NUMBER
    }

    // 插入字段（默认所有字段都需要插入）
    column.isInsert = GenConstants.REQUIRE

    // 编辑字段
    if (!arraysContains(GenConstants.COLUMNNAME_NOT_EDIT, columnName) && column.isPk != 1) {
      column.isEdit = GenConstants.REQUIRE
    }
    // 列表字段
    if (!arraysContains(GenConstants.COLUMNNAME_NOT_LIST, columnName) && column.isPk != 1) {
      column.isList = GenConstants.REQUIRE
    }
    // 查询字段
    if (
      !arraysContains(GenConstants.COLUMNNAME_NOT_QUERY, columnName)
      && column.isPk != 1
      && column.htmlType != GenConstants.HTML_TEXTAREA
    ) {
      column.isQuery = GenConstants.REQUIRE
    }
    const lowerColumnName = toLower(columnName)
    // 查询字段类型
    if (lowerColumnName.includes('name')) {
      column.queryType = GenConstants.QUERY_LIKE
    }
    // 状态字段设置单选框
    if (lowerColumnName.includes('status')) {
      column.htmlType = GenConstants.HTML_RADIO
    }
    // 类型&性别字段设置下拉框
    else if (lowerColumnName.includes('type') || lowerColumnName.includes('sex')) {
      column.htmlType = GenConstants.HTML_SELECT
    }
    // 日期字段设置日期控件
    else if (
      lowerColumnName.includes('time')
      || lowerColumnName.includes('_date')
      || lowerColumnName.includes('Date')
    ) {
      column.htmlType = GenConstants.HTML_DATETIME
      column.queryType = GenConstants.QUERY_BETWEEN
    }
    // 图片字段设置图片上传控件
    else if (lowerColumnName.includes('image')) {
      column.htmlType = GenConstants.HTML_IMAGE_UPLOAD
    }
    // 文件字段设置文件上传控件
    else if (lowerColumnName.includes('file')) {
      column.htmlType = GenConstants.HTML_FILE_UPLOAD
    }
    // 内容字段设置富文本控件
    else if (lowerColumnName.includes('content')) {
      column.htmlType = GenConstants.HTML_EDITOR
    }
  }
}
