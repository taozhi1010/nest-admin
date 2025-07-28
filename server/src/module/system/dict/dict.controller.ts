import { Controller, Get, Post, Body, Query, Request, Put, Res, HttpCode, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiConsumes, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { DictService } from './dict.service';
import { CreateDictTypeDto, UpdateDictTypeDto, ListDictType, CreateDictDataDto, UpdateDictDataDto, ListDictData } from './dto/index';
import { RequirePermission } from 'src/common/decorators/require-premission.decorator';
import { Response } from 'express';

@ApiTags('字典管理')
@Controller('system/dict')
@ApiBearerAuth('Authorization')
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
    summary: '字典数据-详情',
  })
  @Get('/data/:id')
  findOneDictData(@Param('id') dictCode: string) {
    return this.dictService.findOneDictData(+dictCode);
  }

  @ApiOperation({
    summary: '字典数据-类型-详情【走缓存】',
  })
  @Get('/data/type/:id')
  findOneDataType(@Param('id') dictType: string) {
    return this.dictService.findOneDataType(dictType);
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
