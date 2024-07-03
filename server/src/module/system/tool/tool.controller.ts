import { Controller, Get, Post, Body, Param, Delete, Request, Query, Put, Res } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ToolService } from './tool.service';
import { TableName, GenDbTableList, GenTableList, GenTableUpdate } from './dto/create-genTable-dto';
import { Response } from 'express';

@ApiTags('系统工具')
@Controller('tool')
export class ToolController {
  constructor(private readonly toolService: ToolService) {}

  @ApiOperation({ summary: '数据表列表' })
  @Get('/gen/list')
  findAll(@Query() query: GenTableList) {
    return this.toolService.findAll(query);
  }
  @ApiOperation({ summary: '查询数据库列表' })
  @Get('/gen/db/list')
  genDbList(@Query() query: GenDbTableList) {
    return this.toolService.genDbList(query);
  }

  @ApiOperation({ summary: '导入表' })
  @Post('/gen/importTable')
  genImportTable(@Body() table: TableName, @Request() req) {
    return this.toolService.importTable(table, req);
  }

  @ApiOperation({ summary: '同步表' })
  @Get('/gen/synchDb/:tableName')
  synchDb(@Param('tableName') tableName: string) {
    return this.toolService.synchDb(tableName);
  }

  @ApiOperation({ summary: '查询表详细信息' })
  @Get('/gen/:id')
  gen(@Param('id') id: string) {
    return this.toolService.findOne(+id);
  }

  @ApiOperation({ summary: '修改代码生成信息' })
  @Put('/gen')
  genUpdate(@Body() genTableUpdate: GenTableUpdate) {
    return this.toolService.genUpdate(genTableUpdate);
  }

  @ApiOperation({ summary: '删除表数据' })
  @Delete('/gen/:id')
  remove(@Param('id') id: string) {
    return this.toolService.remove(+id);
  }

  @ApiOperation({ summary: '生成代码' })
  @Get('/gen/batchGenCode/zip')
  batchGenCode(@Query() tables: TableName, @Res() res: Response) {
    return this.toolService.batchGenCode(tables, res);
  }

  @ApiOperation({ summary: '查看代码' })
  @Get('/gen/preview/:id')
  preview(@Param('id') id: string) {
    return this.toolService.preview(+id);
  }
}
