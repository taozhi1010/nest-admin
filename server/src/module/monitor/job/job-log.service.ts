import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { JobLog } from './entities/job-log.entity';
import { ListJobLogDto } from './dto/create-job.dto';
import { ResultData } from 'src/common/utils/result';
import { ExportTable } from 'src/common/utils/export';
import { Response } from 'express';

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

    if (query.params?.beginTime && query.params?.endTime) {
      entity.andWhere('entity.createTime BETWEEN :start AND :end', { start: query.params.beginTime, end: query.params.endTime });
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

  /**
   * 导出调度日志为xlsx文件
   * @param res
   */
  async export(res: Response, body: ListJobLogDto) {
    delete body.pageNum;
    delete body.pageSize;
    const list = await this.list(body);
    const options = {
      sheetName: '调度日志',
      data: list.data.list,
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
