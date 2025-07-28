import { Controller, Get, Delete, Query, Post, Res, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JobLogService } from './job-log.service';
import { RequirePermission } from 'src/common/decorators/require-premission.decorator';
import { ListJobLogDto } from './dto/create-job.dto';
import { Response } from 'express';

@ApiTags('定时任务日志管理')
@Controller('monitor/jobLog')
@ApiBearerAuth('Authorization')
export class JobLogController {
  constructor(private readonly jobLogService: JobLogService) {}

  @Get('list')
  @ApiOperation({ summary: '获取定时任务日志列表' })
  @RequirePermission('monitor:job:list')
  list(@Query() query: ListJobLogDto) {
    return this.jobLogService.list(query);
  }

  @Delete('clean')
  @ApiOperation({ summary: '清空定时任务日志' })
  @RequirePermission('monitor:job:remove')
  clean() {
    return this.jobLogService.clean();
  }

  @ApiOperation({ summary: '导出调度日志为xlsx文件' })
  @RequirePermission('monitor:job:export')
  @Post('/export')
  async export(@Res() res: Response, @Body() body: ListJobLogDto): Promise<void> {
    return this.jobLogService.export(res, body);
  }
}
