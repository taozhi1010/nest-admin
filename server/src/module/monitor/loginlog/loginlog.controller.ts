import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiConsumes, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { LoginlogService } from './loginlog.service';
import { ListLoginlogDto } from './dto/index';

@ApiTags('登录日志')
@Controller('monitor/logininfor')
export class LoginlogController {
  constructor(private readonly loginlogService: LoginlogService) {}
  @ApiOperation({
    summary: '登录日志-列表',
  })
  @ApiBody({
    type: ListLoginlogDto,
    required: true,
  })
  @Get('/list')
  findAll(@Query() query: ListLoginlogDto) {
    return this.loginlogService.findAll(query);
  }

  @ApiOperation({
    summary: '登录日志-清除全部日志',
  })
  @Delete('/clean')
  removeAll() {
    return this.loginlogService.removeAll();
  }

  @ApiOperation({
    summary: '登录日志-删除日志',
  })
  @Delete(':id')
  remove(@Param('id') ids: string) {
    const infoIds = ids.split(',').map((id) => id);
    return this.loginlogService.remove(infoIds);
  }
}
