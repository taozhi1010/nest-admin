import { Injectable, Logger } from '@nestjs/common'
import { SchedulerRegistry } from '@nestjs/schedule'
import { InjectRepository } from '@nestjs/typeorm'
import { CronJob } from 'cron'
import { Response } from 'express'
import { ResultData } from 'src/common/utils/result'
import { Repository } from 'typeorm'
import { ExportTable } from '@/common/utils/export'
import { CreateJobDto, ListJobDto } from './dto/create-job.dto'
import { Job } from './entities/job.entity'
import { TaskService } from './task.service'

@Injectable()
export class JobService {
  private readonly logger = new Logger(JobService.name)

  constructor(
    private schedulerRegistry: SchedulerRegistry,
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
    private taskService: TaskService,
  ) {
    this.initializeJobs()
  }

  // 初始化任务
  private async initializeJobs() {
    const jobs = await this.jobRepository.find({ where: { status: '0' } }) // 只获取状态为正常的任务
    jobs.forEach((job) => {
      this.addCronJob(job.jobName, job.cronExpression, job.invokeTarget)
    })
  }

  // 查询任务列表
  async list(query: {
    pageNum?: number
    pageSize?: number
    jobName?: string
    jobGroup?: string
    status?: string
  }) {
    const entity = this.jobRepository.createQueryBuilder('entity')

    if (query.pageSize && query.pageNum) {
      entity.skip(query.pageSize * (query.pageNum - 1)).take(query.pageSize)
    }

    if (query.jobName) {
      entity.andWhere('entity.jobName LIKE :jobName', { jobName: `%${query.jobName}%` })
    }

    if (query.jobGroup) {
      entity.andWhere('entity.jobGroup = :jobGroup', { jobGroup: query.jobGroup })
    }

    if (query.status) {
      entity.andWhere('entity.status = :status', { status: query.status })
    }

    entity.orderBy('entity.createTime', 'DESC')

    const [rows, total] = await entity.getManyAndCount()

    return ResultData.rows({ rows, total })
  }

  // 获取单个任务
  async getJob(jobId: number) {
    const job = await this.jobRepository.findOne({ where: { jobId } })
    if (!job) {
      throw new Error('任务不存在')
    }
    return ResultData.ok(job)
  }

  // 创建任务
  async create(createJobDto: CreateJobDto, username: string) {
    const job = this.jobRepository.create({
      ...createJobDto,
      createBy: username,
      updateBy: username,
    })

    await this.jobRepository.save(job)

    // 如果状态为正常，则添加到调度器
    if (job.status === '0') {
      this.addCronJob(job.jobName, job.cronExpression, createJobDto.invokeTarget)
    }

    return ResultData.ok()
  }

  // 更新任务
  async update(jobId: number, updateJobDto: Partial<Job>, username: string) {
    const job = await this.jobRepository.findOne({ where: { jobId } })
    if (!job) {
      throw new Error('任务不存在')
    }

    // 如果更新了cron表达式或状态，需要重新调度
    if (
      updateJobDto.cronExpression !== job.cronExpression
      || updateJobDto.status !== job.status
      || updateJobDto.invokeTarget !== job.invokeTarget
    ) {
      const cronJob = this.getCronJob(job.jobName)
      if (cronJob) {
        this.deleteCronJob(job.jobName)
      }

      if (updateJobDto.status === '0') {
        this.addCronJob(
          job.jobName,
          updateJobDto.cronExpression || job.cronExpression,
          updateJobDto.invokeTarget,
        )
      }
    }

    await this.jobRepository.update(jobId, {
      ...updateJobDto,
      updateBy: username,
      updateTime: new Date().toISOString(),
    })

    return ResultData.ok()
  }

  // 删除任务
  async remove(jobIds: number | number[]) {
    const ids = Array.isArray(jobIds) ? jobIds : [jobIds]
    const jobs = await this.jobRepository.findByIds(ids)

    // 从调度器中删除
    for (const job of jobs) {
      try {
        this.deleteCronJob(job.jobName)
      }
      catch (error) {
        // 忽略未找到的错误
      }
    }

    await this.jobRepository.remove(jobs)
    return ResultData.ok()
  }

  // 改变任务状态
  async changeStatus(jobId: number, status: string, username: string) {
    const job = await this.jobRepository.findOne({ where: { jobId } })
    if (!job) {
      throw new Error('任务不存在')
    }

    const cronJob = this.getCronJob(job.jobName)

    if (status === '0') {
      // 启用
      if (!cronJob) {
        this.addCronJob(job.jobName, job.cronExpression, job.invokeTarget)
      }
      else {
        cronJob.start()
      }
    }
    else {
      // 停用
      if (cronJob) {
        cronJob.stop()
      }
    }

    await this.jobRepository.update(jobId, {
      status,
      updateBy: username,
      updateTime: new Date().toISOString(),
    })

    return ResultData.ok()
  }

  // 立即执行一次
  async run(jobId: number) {
    const job = await this.jobRepository.findOne({ where: { jobId } })
    if (!job) {
      throw new Error('任务不存在')
    }

    // 执行任务
    await this.taskService.executeTask(job.invokeTarget, job.jobName, job.jobGroup)
    return ResultData.ok()
  }

  // 添加定时任务到调度器
  private addCronJob(name: string, cronTime: string, invokeTarget: string) {
    const job = new CronJob(cronTime.replace(/\?/g, '*'), async () => {
      this.logger.warn(`定时任务 ${name} 正在执行，调用方法: ${invokeTarget}`)
      await this.taskService.executeTask(invokeTarget, name)
    })

    this.schedulerRegistry.addCronJob(name, job as any)
    job.start()
  }

  // 从调度器中删除定时任务
  private deleteCronJob(name: string) {
    this.schedulerRegistry.deleteCronJob(name)
  }

  // 获取 cron 任务
  private getCronJob(name: string): CronJob | null {
    try {
      return this.schedulerRegistry.getCronJob(name) as any
    }
    catch (error) {
      return null
    }
  }

  /**
   * 导出定时任务为xlsx文件
   * @param res
   */
  async export(res: Response, body: ListJobDto) {
    const list = await this.list(body)
    const options = {
      sheetName: '定时任务',
      data: list.data.rows,
      header: [
        { title: '任务编号', dataIndex: 'jobId' },
        { title: '任务名称', dataIndex: 'jobName' },
        { title: '任务组名', dataIndex: 'jobGroup' },
        { title: '调用目标字符串', dataIndex: 'invokeTarget' },
        { title: 'cron执行表达式', dataIndex: 'cronExpression' },
      ],
      dictMap: {
        status: {
          0: '成功',
          1: '失败',
        },
        jobGroup: {
          SYSTEM: '系统',
          DEFAULT: '默认',
        },
      },
    }
    ExportTable(options, res)
  }
}
