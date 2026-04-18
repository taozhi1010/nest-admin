import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResultData } from 'src/common/utils/result';
import { PostSubjectEntity } from './entities/subject.entity';
import { CreatePostSubjectDto, UpdatePostSubjectDto, ListPostSubjectDto } from './dto/index';

@Injectable()
export class PostSubjectService {
  constructor(
    @InjectRepository(PostSubjectEntity)
    private readonly postSubjectRepository: Repository<PostSubjectEntity>,
  ) {}

  async create(createDto: CreatePostSubjectDto) {
    const subject = this.postSubjectRepository.create(createDto);
    await this.postSubjectRepository.save(subject);
    return ResultData.ok();
  }

  async findAll(query: ListPostSubjectDto) {
    const entity = this.postSubjectRepository.createQueryBuilder('subject');
    entity.where('subject.delFlag = :delFlag', { delFlag: '0' });

    if (query.title) {
      entity.andWhere('subject.title LIKE :title', { title: `%${query.title}%` });
    }

    if (query.userId) {
      entity.andWhere('subject.userId = :userId', { userId: query.userId });
    }

    if (query.publishStatus) {
      entity.andWhere('subject.publishStatus = :publishStatus', { publishStatus: query.publishStatus });
    }

    if (query.auditStatus) {
      entity.andWhere('subject.auditStatus = :auditStatus', { auditStatus: query.auditStatus });
    }

    if (query.orderByColumn && query.isAsc) {
      const key = query.isAsc === 'ascending' ? 'ASC' : 'DESC';
      entity.orderBy(`subject.${query.orderByColumn}`, key);
    }

    if (query.pageSize && query.pageNum) {
      entity.skip(query.pageSize * (query.pageNum - 1)).take(query.pageSize);
    }

    const [list, total] = await entity.getManyAndCount();

    return ResultData.ok({ list, total });
  }

  async findOne(id: string) {
    const subject = await this.postSubjectRepository.findOne({
      where: { id, delFlag: '0' },
    });

    if (!subject) {
      return ResultData.fail(500, '专栏不存在');
    }

    return ResultData.ok(subject);
  }

  async update(updateDto: UpdatePostSubjectDto) {
    const { id, ...updateData } = updateDto;
    const subject = await this.postSubjectRepository.findOne({ where: { id, delFlag: '0' } });

    if (!subject) {
      return ResultData.fail(500, '专栏不存在');
    }

    await this.postSubjectRepository.update({ id }, updateData);
    return ResultData.ok();
  }

  async remove(id: string) {
    const subject = await this.postSubjectRepository.findOne({ where: { id, delFlag: '0' } });

    if (!subject) {
      return ResultData.fail(500, '专栏不存在');
    }

    await this.postSubjectRepository.update({ id }, { delFlag: '1' });
    return ResultData.ok();
  }
}
