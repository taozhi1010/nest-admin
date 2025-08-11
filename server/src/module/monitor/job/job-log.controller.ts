import { Body, Controller, Delete, Get, Post, Query, Res } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger'
import { Response } from 'express'
import { RequirePermission } from 'src/common/decorators/require-premission.decorator'
import { ListJobLogDto } from './dto/create-job.dto'
import { JobLogService } from './job-log.service'

@ApiTags('定时任务日志管理')
@Controller('monitor/jobLog')
export class JobLogController {
  constructor(private readonly jobLogService: JobLogService) {}
  @ApiOperation({
    summary: '定时任务日志-列表',
  })
  @ApiBody({
    type: ListJobLogDto,
    required: true,
  })
  @RequirePermission('monitor:job:list')
  @Get('list')
  findAll(@Query() query: ListJobLogDto) {
    return this.jobLogService.list(query)
  }

  @Delete('clean')
  @ApiOperation({ summary: '清空定时任务日志' })
  @RequirePermission('monitor:job:remove')
  clean() {
    return this.jobLogService.clean()
  }

  @ApiOperation({ summary: '导出调度日志为xlsx文件' })
  @RequirePermission('monitor:job:export')
  @Post('/export')
  async export(@Res() res: Response, @Body() body: ListJobLogDto): Promise<void> {
    return this.jobLogService.export(res, body)
  }
}
