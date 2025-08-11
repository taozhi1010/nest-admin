import { Body, Controller, Delete, Get, Param, Post, Put, Query, Res } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { Response } from 'express'
import { ResultData } from 'src/common/utils/result'

import { User, UserDto } from 'src/module/system/user/user.decorator'
import {
  GenDbTableList,
  GenTableList,
  GenTableUpdate,
  TableIds,
  TableNames,
} from './dto/create-genTable-dto'
import { ToolService } from './tool.service'

@ApiTags('系统工具')
@Controller('tool')
export class ToolController {
  constructor(private readonly toolService: ToolService) {}

  @ApiOperation({ summary: '数据表列表' })
  @Get('/gen/list')
  findAll(@Query() query: GenTableList) {
    return this.toolService.findAll(query)
  }

  @ApiOperation({ summary: '查询数据库列表' })
  @Get('/gen/db/list')
  genDbList(@Query() query: GenDbTableList) {
    return this.toolService.genDbList(query)
  }

  @ApiOperation({ summary: '导入表' })
  @Post('/gen/importTable')
  genImportTable(@Body() table: TableNames, @User() user: UserDto) {
    return this.toolService.importTable(table, user)
  }

  @ApiOperation({ summary: '同步表' })
  @Get('/gen/synchDb/:tableId')
  synchDb(@Param('tableId') tableId: string) {
    return this.toolService.synchDb(tableId)
  }

  @ApiOperation({ summary: '生成代码' })
  @Get('/gen/batchGenCode')
  batchGenCode(@Query() tables: TableIds, @Res() res: Response) {
    return this.toolService.batchGenCode(tables, res)
  }

  @ApiOperation({ summary: '数据源' })
  @Get('/gen/getDataNames')
  getDataNames() {
    return ResultData.ok([])
  }

  @ApiOperation({ summary: '查询表详细信息' })
  @Get('/gen/:id')
  gen(@Param('id') id: string) {
    return this.toolService.findOne(+id)
  }

  @ApiOperation({ summary: '修改代码生成信息' })
  @Put('/gen')
  genUpdate(@Body() genTableUpdate: GenTableUpdate) {
    return this.toolService.genUpdate(genTableUpdate)
  }

  @ApiOperation({ summary: '删除表数据' })
  @Delete('/gen/:id')
  remove(@Param('id') id: string) {
    return this.toolService.remove(+id)
  }

  @ApiOperation({ summary: '查看代码' })
  @Get('/gen/preview/:id')
  preview(@Param('id') id: string) {
    return this.toolService.preview(+id)
  }
}
