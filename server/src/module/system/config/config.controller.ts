import { Controller, Get, Post, Body, Put, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiConsumes, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { ConfigService } from './config.service';
import { CreateConfigDto, UpdateConfigDto, ListConfigDto } from './dto/index';

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
  @Get('/list')
  findAll(@Query() query: ListConfigDto) {
    return this.configService.findAll(query);
  }

  @ApiOperation({
    summary: '参数设置-详情(id)',
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.configService.findOne(+id);
  }

  @ApiOperation({
    summary: '参数设置-详情(configKey)【走缓存】',
  })
  @Get('/configKey/:id')
  findOneByconfigKey(@Param('id') configKey: string) {
    return this.configService.findOneByconfigKey(configKey);
  }

  @ApiOperation({
    summary: '参数设置-更新',
  })
  @Put()
  update(@Body() updateConfigDto: UpdateConfigDto) {
    return this.configService.update(updateConfigDto);
  }

  @ApiOperation({
    summary: '参数设置-刷新缓存',
  })
  @Delete('/refreshCache')
  refreshCache() {
    return this.configService.refreshCache();
  }

  @ApiOperation({
    summary: '参数设置-删除',
  })
  @Delete(':id')
  remove(@Param('id') ids: string) {
    const configIds = ids.split(',').map((id) => +id);
    return this.configService.remove(configIds);
  }
}
