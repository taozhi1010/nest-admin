import { Controller, Get, Post, Body, Query, Request, Put, Res, HttpCode, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiConsumes, ApiQuery, ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { DictService } from './dict.service';
import { CreateDictTypeDto, UpdateDictTypeDto, ListDictType, CreateDictDataDto, UpdateDictDataDto, ListDictData } from './dto/index';
import { RequirePermission } from 'src/common/decorators/require-premission.decorator';
import { Response } from 'express';
import { GetNowDate } from 'src/common/utils';

@ApiTags('字典管理')
@Controller('system/dict')
export class DictController {
  constructor(private readonly dictService: DictService) {}

  //字典类型
  @ApiOperation({
    summary: '字典类型-创建',
  })
  @ApiBody({
    type: CreateDictTypeDto,
    required: true,
  })
  @RequirePermission('system:dict:add')
  @HttpCode(200)
  @Post('/type')
  createType(@Body() createDictTypeDto: CreateDictTypeDto, @Request() req) {
    createDictTypeDto['createBy'] = req.user.userName;
    return this.dictService.createType(createDictTypeDto);
  }

  @ApiOperation({
    summary: '字典数据-刷新缓存',
  })
  @RequirePermission('system:dict:remove')
  @Delete('/type/refreshCache')
  refreshCache() {
    return this.dictService.resetDictCache();
  }

  @ApiOperation({
    summary: '字典类型-删除',
  })
  @RequirePermission('system:dict:remove')
  @Delete('/type/:id')
  deleteType(@Param('id') ids: string) {
    const dictIds = ids.split(',').map((id) => +id);
    return this.dictService.deleteType(dictIds);
  }

  @ApiOperation({
    summary: '字典类型-修改',
  })
  @RequirePermission('system:dict:edit')
  @Put('/type')
  updateType(@Body() updateDictTypeDto: UpdateDictTypeDto) {
    return this.dictService.updateType(updateDictTypeDto);
  }

  @ApiOperation({
    summary: '字典类型-列表',
  })
  @RequirePermission('system:dict:list')
  @Get('/type/list')
  findAllType(@Query() query: ListDictType) {
    return this.dictService.findAllType(query);
  }

  @ApiOperation({
    summary: '全部字典类型-下拉数据',
  })
  @RequirePermission('system:dict:query')
  @Get('/type/optionselect')
  findOptionselect() {
    return this.dictService.findOptionselect();
  }

  @ApiOperation({
    summary: '字典类型-详情',
  })
  @RequirePermission('system:dict:query')
  @Get('/type/:id')
  findOneType(@Param('id') id: string) {
    return this.dictService.findOneType(+id);
  }

  // 字典数据
  @ApiOperation({
    summary: '字典数据-创建',
  })
  @RequirePermission('system:dict:add')
  @HttpCode(200)
  @Post('/data')
  createDictData(@Body() createDictDataDto: CreateDictDataDto, @Request() req) {
    createDictDataDto['createBy'] = req.user.userName;
    return this.dictService.createDictData(createDictDataDto);
  }

  @ApiOperation({
    summary: '字典数据-删除',
  })
  @RequirePermission('system:dict:remove')
  @Delete('/data/:id')
  deleteDictData(@Param('id') ids: string) {
    const dictIds = ids.split(',').map((id) => +id);
    return this.dictService.deleteDictData(dictIds);
  }

  @ApiOperation({
    summary: '字典数据-修改',
  })
  @RequirePermission('system:dict:edit')
  @Put('/data')
  updateDictData(@Body() updateDictDataDto: UpdateDictDataDto) {
    return this.dictService.updateDictData(updateDictDataDto);
  }

  @ApiOperation({
    summary: '字典数据-列表',
  })
  @RequirePermission('system:dict:list')
  @Get('/data/list')
  findAllData(@Query() query: ListDictData) {
    return this.dictService.findAllData(query);
  }

  @ApiOperation({
    summary: '字典数据-类型-详情【走缓存】',
    description: '传 fresh=true 时跳过 Redis 缓存，直接查询数据库',
  })
  @Get('/data/type/:id')
  findOneDataType(@Param('id') dictType: string, @Query('fresh') fresh?: string) {
    return this.dictService.findOneDataType(dictType, fresh === 'true');
  }

  @ApiOperation({
    summary: '字典数据-版本号',
    description: [
      '返回字典最后一次修改的时间，前端用它判断本地缓存是否过期。',
      '',
      '**版本号怎么来的：**',
      '1. 分别取 `sys_dict_type`、`sys_dict_data` 中最大的 `update_time`（为空时取 `create_time`）；',
      '2. 两个时间再取较新的一个，格式化为 `YYYY-MM-DD HH:mm:ss`。',
      '',
      '新增、修改、删除任意字典类型或字典数据，都会让版本号变化；两个表都为空时返回 `1970-01-01 00:00:00`。',
      '',
      '**前端如何使用：** 只做字符串比较。与本地保存的版本一致就使用缓存；不一致则调用 `/system/dict/data/all` 重新拉取。',
    ].join('\n'),
  })
  @ApiOkResponse({
    description: '字典最后修改时间',
    schema: {
      example: {
        code: 200,
        msg: '操作成功',
        data: {
          version: '2026-10-22 04:03:43',
        },
      },
    },
  })
  @Get('/data/version')
  findDictVersion() {
    return this.dictService.getDictVersion();
  }

  @ApiOperation({
    summary: '字典数据-全部【走缓存】',
    description: '一次性获取所有字典类型及其对应的字典数据，传 fresh=true 时跳过缓存直接重建',
  })
  @Get('/data/all')
  findAllDictData(@Query('fresh') fresh?: string) {
    return this.dictService.findAllDictData(fresh === 'true');
  }

  @ApiOperation({
    summary: '字典数据-详情',
  })
  @Get('/data/:id')
  findOneDictData(@Param('id') dictCode: string) {
    return this.dictService.findOneDictData(+dictCode);
  }

  @ApiOperation({ summary: '导出字典组为xlsx文件' })
  @RequirePermission('system:dict:export')
  @Post('/type/export')
  async export(@Res() res: Response, @Body() body: ListDictType): Promise<void> {
    return this.dictService.export(res, body);
  }

  @ApiOperation({ summary: '导出字典内容为xlsx文件' })
  @RequirePermission('system:dict:export')
  @Post('/data/export')
  async exportData(@Res() res: Response, @Body() body: ListDictType): Promise<void> {
    return this.dictService.exportData(res, body);
  }
}
