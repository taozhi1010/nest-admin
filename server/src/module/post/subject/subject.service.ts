import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ResultData } from 'src/common/utils/result';
import { PostSubjectEntity } from './entities/subject.entity';
import { CreatePostSubjectDto, UpdatePostSubjectDto, ListPostSubjectDto } from './dto/index';
import { UserDto } from 'src/module/system/user/user.decorator';

@Injectable()
export class PostSubjectService {
  constructor(
    @InjectRepository(PostSubjectEntity)
    private readonly postSubjectRepository: Repository<PostSubjectEntity>,
  ) {}

  async create(createDto: CreatePostSubjectDto, user: UserDto) {
    // 从当前登录用户信息中获取 userId
    const userId = user.user.userId;

    // 创建专栏实体，并设置 userId
    const subject = this.postSubjectRepository.create({
      ...createDto,
      userId: userId,
    });

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

  async findOne(id: number) {
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

  async remove(ids: number | number[]) {
    // 统一转换为数组
    const idList = Array.isArray(ids) ? ids : [ids];

    if (!idList || idList.length === 0) {
      return ResultData.fail(400, '请选择要删除的专栏');
    }

    // 获取所有要删除的专栏
    const subjects = await this.postSubjectRepository.find({
      where: {
        id: In(idList),
        delFlag: '0',
      },
    });

    if (subjects.length === 0) {
      return ResultData.fail(500, '未找到可删除的专栏');
    }

    // 批量软删除
    await this.postSubjectRepository.update({ id: In(idList) }, { delFlag: '1' });

    return ResultData.ok();
  }
}
