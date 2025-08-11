import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Response } from 'express'
import { ResultData } from 'src/common/utils/result'
import { Repository } from 'typeorm'
import { ExportTable } from '@/common/utils/export'
import { ListJobLogDto } from './dto/create-job.dto'
import { JobLog } from './entities/job-log.entity'

@Injectable()
export class JobLogService {
  constructor(
    @InjectRepository(JobLog)
    private jobLogRepository: Repository<JobLog>,
  ) {}

  /**
   * 查询任务日志列表
   */
  async list(query: ListJobLogDto) {
    const entity = this.jobLogRepository.createQueryBuilder('entity')

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

    if (query.createTime && query.createTime.length === 2) {
      entity.andWhere('entity.createTime between :createTime0 and :createTime1', {
        createTime0: query.createTime[0],
        createTime1: query.createTime[1],
      })
    }

    const [rows, total] = await entity.getManyAndCount()

    return ResultData.rows({ rows, total })
  }

  /**
   * 添加任务日志
   */
  async addJobLog(jobLog: Partial<JobLog>) {
    const log = this.jobLogRepository.create(jobLog)
    await this.jobLogRepository.save(log)
    return ResultData.ok()
  }

  /**
   * 清空日志
   */
  async clean() {
    await this.jobLogRepository.clear()
    return ResultData.ok()
  }

  /**
   * 导出调度日志为xlsx文件
   */
  async export(res: Response, body: ListJobLogDto) {
    delete body.pageNum
    delete body.pageSize
    const list = await this.list(body)
    const options = {
      sheetName: '调度日志',
      data: list.data.rows,
      header: [
        { title: '日志编号', dataIndex: 'jobLogId' },
        { title: '任务名称', dataIndex: 'jobName' },
        { title: '任务组名', dataIndex: 'jobGroup' },
        { title: '调用目标字符串', dataIndex: 'invokeTarget' },
        { title: '日志信息', dataIndex: 'jobMessage' },
        { title: '执行时间', dataIndex: 'createTime' },
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
