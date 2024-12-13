import { Controller, Get, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JobLogService } from './job-log.service';
import { RequirePermission } from 'src/common/decorators/require-premission.decorator';

@ApiTags('定时任务日志管理')
@Controller('monitor/jobLog')
export class JobLogController {
  constructor(private readonly jobLogService: JobLogService) {}

  @Get('list')
  @ApiOperation({ summary: '获取定时任务日志列表' })
  @RequirePermission('monitor:job:list')
  list(@Query() query: { pageNum?: number; pageSize?: number; jobName?: string; jobGroup?: string; status?: string }) {
    return this.jobLogService.list(query);
  }

  @Delete('clean')
  @ApiOperation({ summary: '清空定时任务日志' })
  @RequirePermission('monitor:job:remove')
  clean() {
    return this.jobLogService.clean();
  }
}
