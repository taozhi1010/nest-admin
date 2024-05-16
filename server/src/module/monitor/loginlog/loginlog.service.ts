import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not, IsNull } from 'typeorm';
import { ResultData } from 'src/common/utils/result';
import { MonitorLoginlogEntity } from './entities/loginlog.entity';
import { CreateLoginlogDto, ListLoginlogDto } from './dto/index';

@Injectable()
export class LoginlogService {
  constructor(
    @InjectRepository(MonitorLoginlogEntity)
    private readonly monitorLoginlogEntityRep: Repository<MonitorLoginlogEntity>,
  ) {}

  /**
   * 创建用户登录日志
   * @param createLoginlogDto
   * @returns
   */
  async create(createLoginlogDto: CreateLoginlogDto) {
    return await this.monitorLoginlogEntityRep.save(createLoginlogDto);
  }

  /**
   * 日志列表-分页
   * @param query
   * @returns
   */
  async findAll(query: ListLoginlogDto) {
    const entity = this.monitorLoginlogEntityRep.createQueryBuilder('entity');
    entity.where('entity.delFlag = :delFlag', { delFlag: '0' });

    if (query.ipaddr) {
      entity.andWhere(`entity.ipaddr LIKE "%${query.ipaddr}%"`);
    }

    if (query.userName) {
      entity.andWhere(`entity.userName LIKE "%${query.userName}%"`);
    }

    if (query.status) {
      entity.andWhere('entity.status = :status', { status: query.status });
    }

    if (query.params?.beginTime && query.params?.endTime) {
      entity.andWhere('entity.loginTime BETWEEN :start AND :end', { start: query.params.beginTime, end: query.params.endTime });
    }

    if (query.orderByColumn && query.isAsc) {
      const key = query.isAsc === 'ascending' ? 'ASC' : 'DESC';
      entity.orderBy(`entity.${query.orderByColumn}`, key);
    }

    entity.skip(query.pageSize * (query.pageNum - 1)).take(query.pageSize);
    const [list, total] = await entity.getManyAndCount();

    return ResultData.ok({
      list,
      total,
    });
  }

  /**
   * 删除日志
   * @returns
   */
  async remove(ids: string[]) {
    const data = await this.monitorLoginlogEntityRep.update(
      { infoId: In(ids) },
      {
        delFlag: '1',
      },
    );
    return ResultData.ok(data);
  }

  /**
   * 删除全部日志
   * @returns
   */
  async removeAll() {
    await this.monitorLoginlogEntityRep.update(
      { infoId: Not(IsNull()) },
      {
        delFlag: '1',
      },
    );
    return ResultData.ok();
  }
}
