import { Controller, Get, Post, Body, Res, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiConsumes, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { LoginlogService } from './loginlog.service';
import { ListLoginlogDto } from './dto/index';
import { RequirePermission } from 'src/common/decorators/require-premission.decorator';

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
  @RequirePermission('monitor:logininfor:query')
  @Get('/list')
  findAll(@Query() query: ListLoginlogDto) {
    return this.loginlogService.findAll(query);
  }

  @ApiOperation({
    summary: '登录日志-清除全部日志',
  })
  @RequirePermission('monitor:logininfor:remove')
  @Delete('/clean')
  removeAll() {
    return this.loginlogService.removeAll();
  }

  @ApiOperation({
    summary: '登录日志-删除日志',
  })
  @RequirePermission('monitor:logininfor:remove')
  @Delete(':id')
  remove(@Param('id') ids: string) {
    const infoIds = ids.split(',').map((id) => id);
    return this.loginlogService.remove(infoIds);
  }

  @ApiOperation({ summary: '导出登录日志为xlsx文件' })
  @RequirePermission('system:config:export')
  @Post('/export')
  async export(@Res() res: Response, @Body() body: ListLoginlogDto): Promise<void> {
    return this.loginlogService.export(res, body);
  }
}
