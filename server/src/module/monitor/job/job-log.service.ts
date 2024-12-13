import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { JobLog } from './entities/job-log.entity';
import { ResultData } from 'src/common/utils/result';

@Injectable()
export class JobLogService {
  constructor(
    @InjectRepository(JobLog)
    private jobLogRepository: Repository<JobLog>,
  ) {}

  /**
   * 查询任务日志列表
   */
  async list(query: { pageNum?: number; pageSize?: number; jobName?: string; jobGroup?: string; status?: string }) {
    const entity = this.jobLogRepository.createQueryBuilder('entity');

    if (query.pageSize && query.pageNum) {
      entity.skip(query.pageSize * (query.pageNum - 1)).take(query.pageSize);
    }

    if (query.jobName) {
      entity.andWhere('entity.jobName LIKE :jobName', { jobName: `%${query.jobName}%` });
    }

    if (query.jobGroup) {
      entity.andWhere('entity.jobGroup = :jobGroup', { jobGroup: query.jobGroup });
    }

    if (query.status) {
      entity.andWhere('entity.status = :status', { status: query.status });
    }

    entity.orderBy('entity.createTime', 'DESC');

    const [list, total] = await entity.getManyAndCount();

    return ResultData.ok({
      list,
      total,
    });
  }

  /**
   * 添加任务日志
   */
  async addJobLog(jobLog: Partial<JobLog>) {
    const log = this.jobLogRepository.create(jobLog);
    await this.jobLogRepository.save(log);
    return ResultData.ok();
  }

  /**
   * 清空日志
   */
  async clean() {
    await this.jobLogRepository.clear();
    return ResultData.ok();
  }
}
