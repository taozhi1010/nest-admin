import { Controller, Get, Param, Delete, Query, Post, Res, Body } from '@nestjs/common';
import { OperlogService } from './operlog.service';
import { ApiOperation, ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequirePermission } from 'src/common/decorators/require-premission.decorator';
import { Operlog } from 'src/common/decorators/operlog.decorator';
import { BusinessType } from 'src/common/constant/business.constant';
import { BaseOperLogDto, QueryOperLogDto } from './dto/operLog.dto';
import { ApiDataResponse } from 'src/common/decorators/apiDataResponse.decorator';
import { Response } from 'express';

@ApiTags('操作日志')
@Controller('monitor/operlog')
@ApiBearerAuth('Authorization')
export class OperlogController {
  constructor(private readonly operlogService: OperlogService) {}

  @ApiOperation({
    summary: '操作日志-清除全部日志',
  })
  @RequirePermission('monitor:operlog:remove')
  @Delete('/clean')
  @Operlog({ businessType: BusinessType.CLEAN })
  removeAll() {
    return this.operlogService.removeAll();
  }

  @ApiOperation({
    summary: '操作日志-列表',
  })
  @ApiDataResponse(QueryOperLogDto, true, true)
  @RequirePermission('monitor:operlog:list')
  @Get('/list')
  findAll(@Query() query: QueryOperLogDto) {
    return this.operlogService.findAll(query);
  }

  @ApiOperation({
    summary: '操作日志记录-详情',
  })
  @ApiDataResponse(BaseOperLogDto)
  @RequirePermission('monitor:operlog:query')
  @Get(':operId')
  findOne(@Param('operId') operId: string) {
    return this.operlogService.findOne(+operId);
  }

  @ApiOperation({
    summary: '操作日志-删除',
  })
  @RequirePermission('monitor:operlog:remove')
  @Delete(':operId')
  remove(@Param('operId') operId: string) {
    return this.operlogService.remove(+operId);
  }

  @ApiOperation({ summary: '导出操作日志数据为xlsx' })
  @RequirePermission('monitor:operlog:export')
  @Post('/export')
  async exportData(@Res() res: Response, @Body() body: QueryOperLogDto): Promise<void> {
    return this.operlogService.export(res, body);
  }
}
