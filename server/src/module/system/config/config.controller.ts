import { Controller, Get, Post, Body, Put, Param, Delete, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { ConfigService } from './config.service';
import { CreateConfigDto, UpdateConfigDto, ListConfigDto } from './dto/index';
import { RequirePermission } from 'src/common/decorators/require-premission.decorator';

@ApiTags('参数设置')
@Controller('system/config')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @ApiOperation({
    summary: '参数设置-创建',
  })
  @ApiBody({
    type: CreateConfigDto,
  })
  @RequirePermission('system:config:add')
  @Post()
  create(@Body() createConfigDto: CreateConfigDto) {
    return this.configService.create(createConfigDto);
  }

  @ApiOperation({
    summary: '参数设置-列表',
  })
  @ApiBody({
    type: ListConfigDto,
    required: true,
  })
  @RequirePermission('system:config:query')
  @Get('/list')
  findAll(@Query() query: ListConfigDto) {
    return this.configService.findAll(query);
  }

  @ApiOperation({
    summary: '参数设置-详情(id)',
  })
  @RequirePermission('system:config:query')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.configService.findOne(+id);
  }

  @ApiOperation({
    summary: '参数设置-详情(configKey)【走缓存】',
  })
  @RequirePermission('system:config:query')
  @Get('/configKey/:id')
  findOneByconfigKey(@Param('id') configKey: string) {
    return this.configService.findOneByConfigKey(configKey);
  }

  @ApiOperation({
    summary: '参数设置-更新',
  })
  @RequirePermission('system:config:edit')
  @Put()
  update(@Body() updateConfigDto: UpdateConfigDto) {
    return this.configService.update(updateConfigDto);
  }

  @ApiOperation({
    summary: '参数设置-刷新缓存',
  })
  @RequirePermission('system:config:remove')
  @Delete('/refreshCache')
  refreshCache() {
    return this.configService.refreshCache();
  }

  @ApiOperation({
    summary: '参数设置-删除',
  })
  @RequirePermission('system:config:remove')
  @Delete(':id')
  remove(@Param('id') ids: string) {
    const configIds = ids.split(',').map((id) => +id);
    return this.configService.remove(configIds);
  }

  @ApiOperation({ summary: '导出参数管理为xlsx文件' })
  @RequirePermission('system:config:export')
  @Post('/export')
  async export(@Res() res: Response, @Body() body: ListConfigDto): Promise<void> {
    return this.configService.export(res, body);
  }
}
