import { Controller, Get, Post, Body, Delete, Param, Put, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JobService } from './job.service';
import { CreateJobDto } from './dto/create-job.dto';
import { RequirePermission } from 'src/common/decorators/require-premission.decorator';

@ApiTags('定时任务管理')
@Controller('monitor/job')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @Get('list')
  @ApiOperation({ summary: '获取定时任务列表' })
  @RequirePermission('monitor:job:list')
  list(@Query() query: { pageNum?: number; pageSize?: number; jobName?: string; jobGroup?: string; status?: string }) {
    return this.jobService.list(query);
  }

  @Get(':jobId')
  @ApiOperation({ summary: '获取定时任务详细信息' })
  @RequirePermission('monitor:job:query')
  getInfo(@Param('jobId') jobId: number) {
    return this.jobService.getJob(jobId);
  }

  @Post()
  @ApiOperation({ summary: '创建定时任务' })
  @RequirePermission('monitor:job:add')
  add(@Body() createJobDto: CreateJobDto, @Req() req: any) {
    return this.jobService.create(createJobDto, req.user?.username);
  }

  @Put('changeStatus')
  @ApiOperation({ summary: '修改任务状态' })
  @RequirePermission('monitor:job:changeStatus')
  changeStatus(@Body('jobId') jobId: number, @Body('status') status: string, @Req() req: any) {
    console.log(jobId, status, req.user?.username);
    return this.jobService.changeStatus(jobId, status, req.user?.username);
  }

  @Put('')
  @ApiOperation({ summary: '修改定时任务' })
  @RequirePermission('monitor:job:edit')
  update(@Body('jobId') jobId: number, @Body() updateJobDto: Partial<CreateJobDto>, @Req() req: any) {
    return this.jobService.update(jobId, updateJobDto, req.user?.username);
  }

  @Delete(':jobIds')
  @ApiOperation({ summary: '删除定时任务' })
  @RequirePermission('monitor:job:remove')
  remove(@Param('jobIds') jobIds: string) {
    return this.jobService.remove(jobIds.split(',').map((id) => +id));
  }

  @Put(':jobId/run')
  @ApiOperation({ summary: '立即执行一次' })
  @RequirePermission('monitor:job:changeStatus')
  run(@Param('jobId') jobId: number) {
    return this.jobService.run(jobId);
  }
}
