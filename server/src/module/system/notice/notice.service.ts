import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { ResultData } from 'src/common/utils/result'
import { In, Repository } from 'typeorm'

import { CreateNoticeDto, ListNoticeDto, UpdateNoticeDto } from './dto/index'
import { SysNoticeEntity } from './entities/notice.entity'

@Injectable()
export class NoticeService {
  constructor(
    @InjectRepository(SysNoticeEntity)
    private readonly sysNoticeEntityRep: Repository<SysNoticeEntity>,
  ) {}

  async create(createNoticeDto: CreateNoticeDto) {
    await this.sysNoticeEntityRep.save(createNoticeDto)
    return ResultData.ok()
  }

  async findAll(query: ListNoticeDto) {
    const entity = this.sysNoticeEntityRep.createQueryBuilder('entity')
    entity.where('entity.delFlag = :delFlag', { delFlag: '0' })

    if (query.noticeTitle) {
      entity.andWhere(`entity.noticeTitle LIKE "%${query.noticeTitle}%"`)
    }

    if (query.createBy) {
      entity.andWhere(`entity.createBy LIKE "%${query.createBy}%"`)
    }

    if (query.noticeType) {
      entity.andWhere('entity.noticeType = :noticeType', { noticeType: query.noticeType })
    }

    if (query.params?.beginTime && query.params?.endTime) {
      entity.andWhere('entity.createTime BETWEEN :start AND :end', {
        start: query.params.beginTime,
        end: query.params.endTime,
      })
    }

    entity.skip(query.pageSize * (query.pageNum - 1)).take(query.pageSize)
    const [rows, total] = await entity.getManyAndCount()

    return ResultData.rows({ rows, total })
  }

  async findOne(noticeId: number) {
    const data = await this.sysNoticeEntityRep.findOne({
      where: {
        noticeId,
      },
    })
    return ResultData.ok(data)
  }

  async update(updateNoticeDto: UpdateNoticeDto) {
    await this.sysNoticeEntityRep.update(
      {
        noticeId: updateNoticeDto.noticeId,
      },
      updateNoticeDto,
    )
    return ResultData.ok()
  }

  async remove(noticeIds: number[]) {
    const data = await this.sysNoticeEntityRep.update(
      { noticeId: In(noticeIds) },
      {
        delFlag: '1',
      },
    )
    return ResultData.ok(data)
  }
}
