import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Job } from './entities/job.entity';
import { CreateJobDto, ListJobDto } from './dto/create-job.dto';
import { ResultData } from 'src/common/utils/result';
import { TaskService } from './task.service';
import { ExportTable } from 'src/common/utils/export';
import { Response } from 'express';

@Injectable()
export class JobService {
  private readonly logger = new Logger(JobService.name);

  constructor(
    private schedulerRegistry: SchedulerRegistry,
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
    private taskService: TaskService,
  ) {
    this.initializeJobs();
  }

  // 初始化任务
  private async initializeJobs() {
    const jobs = await this.jobRepository.find({ where: { status: '0' } }); // 只获取状态为正常的任务
    jobs.forEach((job) => {
      this.addCronJob(job.jobName, job.cronExpression, job.invokeTarget);
    });
  }

  // 查询任务列表
  async list(query: { pageNum?: number; pageSize?: number; jobName?: string; jobGroup?: string; status?: string }) {
    const { pageNum = 1, pageSize = 10, jobName, jobGroup, status } = query;
    const where: any = {};

    if (jobName) {
      where.jobName = Like(`%${jobName}%`);
    }
    if (jobGroup) {
      where.jobGroup = jobGroup;
    }
    if (status) {
      where.status = status;
    }

    const [list, total] = await this.jobRepository.findAndCount({
      where,
      skip: (pageNum - 1) * pageSize,
      take: pageSize,
      order: {
        createTime: 'DESC',
      },
    });

    return ResultData.ok({ list, total });
  }

  // 获取单个任务
  async getJob(jobId: number) {
    const job = await this.jobRepository.findOne({ where: { jobId } });
    if (!job) {
      throw new Error('任务不存在');
    }
    return ResultData.ok(job);
  }

  // 创建任务
  async create(createJobDto: CreateJobDto, userName: string) {
    const job = this.jobRepository.create({
      ...createJobDto,
      createBy: userName,
      updateBy: userName,
    });

    await this.jobRepository.save(job);

    // 如果状态为正常，则添加到调度器
    if (job.status === '0') {
      this.addCronJob(job.jobName, job.cronExpression, createJobDto.invokeTarget);
    }

    return ResultData.ok();
  }

  // 更新任务
  async update(jobId: number, updateJobDto: Partial<Job>, userName: string) {
    const job = await this.jobRepository.findOne({ where: { jobId } });
    if (!job) {
      throw new Error('任务不存在');
    }

    // 如果更新了cron表达式或状态，需要重新调度
    if (updateJobDto.cronExpression !== job.cronExpression || updateJobDto.status !== job.status || updateJobDto.invokeTarget !== job.invokeTarget) {
      const cronJob = this.getCronJob(job.jobName);
      if (cronJob) {
        this.deleteCronJob(job.jobName);
      }

      if (updateJobDto.status === '0') {
        this.addCronJob(job.jobName, updateJobDto.cronExpression || job.cronExpression, updateJobDto.invokeTarget);
      }
    }

    await this.jobRepository.update(jobId, {
      ...updateJobDto,
      updateBy: userName,
      updateTime: new Date(),
    });

    return ResultData.ok();
  }

  // 删除任务
  async remove(jobIds: number | number[]) {
    const ids = Array.isArray(jobIds) ? jobIds : [jobIds];
    const jobs = await this.jobRepository.findByIds(ids);

    // 从调度器中删除
    for (const job of jobs) {
      try {
        this.deleteCronJob(job.jobName);
      } catch (error) {
        // 忽略未找到的错误
      }
    }

    await this.jobRepository.remove(jobs);
    return ResultData.ok();
  }

  // 改变任务状态
  async changeStatus(jobId: number, status: string, userName: string) {
    const job = await this.jobRepository.findOne({ where: { jobId } });
    if (!job) {
      throw new Error('任务不存在');
    }

    const cronJob = this.getCronJob(job.jobName);

    if (status === '0') {
      // 启用
      if (!cronJob) {
        this.addCronJob(job.jobName, job.cronExpression, job.invokeTarget);
      } else {
        cronJob.start();
      }
    } else {
      // 停用
      if (cronJob) {
        cronJob.stop();
      }
    }

    await this.jobRepository.update(jobId, {
      status,
      updateBy: userName,
      updateTime: new Date(),
    });

    return ResultData.ok();
  }

  // 立即执行一次
  async run(jobId: number) {
    const job = await this.jobRepository.findOne({ where: { jobId } });
    if (!job) {
      throw new Error('任务不存在');
    }

    // 执行任务
    await this.taskService.executeTask(job.invokeTarget, job.jobName, job.jobGroup);
    return ResultData.ok();
  }

  // 添加定时任务到调度器
  private addCronJob(name: string, cronTime: string, invokeTarget: string) {
    cronTime = cronTime.replace('?', '*'); // 不支持问号，则将cron的问号转成*
    const job = new CronJob(cronTime, async () => {
      this.logger.warn(`定时任务 ${name} 正在执行，调用方法: ${invokeTarget}`);
      await this.taskService.executeTask(invokeTarget, name);
    });

    this.schedulerRegistry.addCronJob(name, job as any);
    job.start();
  }

  // 从调度器中删除定时任务
  private deleteCronJob(name: string) {
    this.schedulerRegistry.deleteCronJob(name);
  }

  // 获取 cron 任务
  private getCronJob(name: string): CronJob | null {
    try {
      return this.schedulerRegistry.getCronJob(name) as any;
    } catch (error) {
      return null;
    }
  }

  /**
   * 导出定时任务为xlsx文件
   * @param res
   */
  async export(res: Response, body: ListJobDto) {
    const list = await this.list(body);
    const options = {
      sheetName: '定时任务',
      data: list.data.list,
      header: [
        { title: '任务编号', dataIndex: 'jobId' },
        { title: '任务名称', dataIndex: 'jobName' },
        { title: '任务组名', dataIndex: 'jobGroup' },
        { title: '调用目标字符串', dataIndex: 'invokeTarget' },
        { title: 'cron执行表达式', dataIndex: 'cronExpression' },
      ],
      dictMap: {
        status: {
          '0': '成功',
          '1': '失败',
        },
        jobGroup: {
          SYSTEM: '系统',
          DEFAULT: '默认',
        },
      },
    };
    ExportTable(options, res);
  }
}
