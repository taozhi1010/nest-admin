import { Controller, Get, Post, Body, Param, Delete, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { OperlogService } from './operlog.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermission } from 'src/common/decorators/require-premission.decorator';
import { Operlog } from 'src/common/decorators/operlog.decorator';
import { BusinessType } from 'src/common/constant/business.constant';

@Controller('monitor/operlog')
@ApiTags('操作日志管理')
export class OperlogController {
  constructor(private readonly operlogService: OperlogService) {}

  // ==================== 基础 CRUD 接口 ====================

  /**
   * 查询操作日志列表（支持分页、排序）
   */
  @Get('/list')
  @ApiOperation({ summary: '查询操作日志列表' })
  findAll(@Query() query: any) {
    return this.operlogService.findAll(query);
  }

  /**
   * 获取单个操作日志详情
   */
  @Get(':id')
  @ApiOperation({ summary: '获取单个操作日志详情' })
  findOne(@Param('id') id: string) {
    return this.operlogService.findOne(+id);
  }

  /**
   * 删除单个操作日志
   */
  @Delete(':id')
  @ApiOperation({ summary: '删除单个操作日志' })
  remove(@Param('id') id: string) {
    return this.operlogService.remove(+id);
  }

  // ==================== 业务功能接口 ====================

  /**
   * 清除全部操作日志
   * @permission monitor:logininfor:remove
   */
  @ApiOperation({
    summary: '清除全部操作日志',
  })
  @RequirePermission('monitor:logininfor:remove')
  @Delete('/clean')
  @Operlog({ businessType: BusinessType.CLEAN })
  removeAll() {
    return this.operlogService.removeAll();
  }

  /**
   * 导出操作日志
   * @permission monitor:operlog:export
   */
  @ApiOperation({ summary: '导出操作日志为xlsx文件' })
  @RequirePermission('monitor:operlog:export')
  @Post('/export')
  async export(@Res() res: Response, @Body() body: any): Promise<void> {
    return this.operlogService.export(res, body);
  }
}
