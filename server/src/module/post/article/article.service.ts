import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResultData } from 'src/common/utils/result';
import { PostArticleEntity } from './entities/article.entity';
import { CreatePostArticleDto, UpdatePostArticleDto, ListPostArticleDto, AuditPostArticleDto } from './dto/index';

/**
 * 文章服务类
 * 提供文章的增删改查、审核等功能
 */
@Injectable()
export class PostArticleService {
  constructor(
    @InjectRepository(PostArticleEntity)
    private readonly postArticleRepository: Repository<PostArticleEntity>,
  ) {}

  /**
   * 创建文章
   * @param createDto 创建文章的数据
   * @returns 操作结果
   */
  async create(createDto: CreatePostArticleDto) {
    const article = this.postArticleRepository.create(createDto);
    await this.postArticleRepository.save(article);
    return ResultData.ok();
  }

  /**
   * 查询文章列表（支持分页和条件筛选）
   * @param query 查询参数
   * @returns 文章列表和总数
   */
  async findAll(query: ListPostArticleDto) {
    const entity = this.postArticleRepository.createQueryBuilder('article');
    entity.where('article.delFlag = :delFlag', { delFlag: '0' });

    // 按标题模糊搜索
    if (query.title) {
      entity.andWhere('article.title LIKE :title', { title: `%${query.title}%` });
    }

    // 按专栏ID筛选
    if (query.subjectId) {
      entity.andWhere('article.subjectId = :subjectId', { subjectId: query.subjectId });
    }

    // 按作者ID筛选
    if (query.userId) {
      entity.andWhere('article.userId = :userId', { userId: query.userId });
    }

    // 按发布状态筛选
    if (query.publishStatus) {
      entity.andWhere('article.publishStatus = :publishStatus', { publishStatus: query.publishStatus });
    }

    // 按审核状态筛选
    if (query.auditStatus) {
      entity.andWhere('article.auditStatus = :auditStatus', { auditStatus: query.auditStatus });
    }

    // 排序
    if (query.orderByColumn && query.isAsc) {
      const key = query.isAsc === 'ascending' ? 'ASC' : 'DESC';
      entity.orderBy(`article.${query.orderByColumn}`, key);
    }

    // 分页
    if (query.pageSize && query.pageNum) {
      entity.skip(query.pageSize * (query.pageNum - 1)).take(query.pageSize);
    }

    const [list, total] = await entity.getManyAndCount();

    return ResultData.ok({
      list,
      total,
    });
  }

  /**
   * 查询文章详情
   * @param id 文章ID
   * @returns 文章详情
   */
  async findOne(id: string) {
    const article = await this.postArticleRepository.findOne({
      where: {
        id,
        delFlag: '0',
      },
    });

    if (!article) {
      return ResultData.fail(500, '文章不存在');
    }

    return ResultData.ok(article);
  }

  /**
   * 更新文章
   * @param updateDto 更新数据
   * @returns 操作结果
   */
  async update(updateDto: UpdatePostArticleDto) {
    const { id, ...updateData } = updateDto;
    
    const article = await this.postArticleRepository.findOne({
      where: { id, delFlag: '0' },
    });

    if (!article) {
      return ResultData.fail(500, '文章不存在');
    }

    await this.postArticleRepository.update({ id }, updateData);
    return ResultData.ok();
  }

  /**
   * 删除文章（软删除）
   * @param id 文章ID
   * @returns 操作结果
   */
  async remove(id: string) {
    const article = await this.postArticleRepository.findOne({
      where: { id, delFlag: '0' },
    });

    if (!article) {
      return ResultData.fail(500, '文章不存在');
    }

    await this.postArticleRepository.update({ id }, { delFlag: '1' });
    return ResultData.ok();
  }

  /**
   * 审核文章
   * @param auditDto 审核数据
   * @param auditUserId 审核人ID
   * @returns 操作结果
   */
  async audit(auditDto: AuditPostArticleDto, auditUserId: number) {
    const article = await this.postArticleRepository.findOne({
      where: { id: auditDto.id, delFlag: '0' },
    });

    if (!article) {
      return ResultData.fail(500, '文章不存在');
    }

    // 更新审核状态、审核人、审核时间和备注
    await this.postArticleRepository.update(
      { id: auditDto.id },
      {
        auditStatus: auditDto.auditStatus,
        auditUserId,
        auditTime: new Date(),
        auditRemark: auditDto.auditRemark || null,
      },
    );

    return ResultData.ok();
  }

  /**
   * 提交审核（将文章状态改为审核中）
   * @param id 文章ID
   * @returns 操作结果
   */
  async submitForAudit(id: string) {
    const article = await this.postArticleRepository.findOne({
      where: { id, delFlag: '0' },
    });

    if (!article) {
      return ResultData.fail(500, '文章不存在');
    }

    await this.postArticleRepository.update(
      { id },
      {
        auditStatus: '1', // 审核中
      },
    );

    return ResultData.ok();
  }

  /**
   * 发布文章（将待发布的文章改为已发布）
   * @param id 文章ID
   * @returns 操作结果
   */
  async publish(id: string) {
    const article = await this.postArticleRepository.findOne({
      where: { id, delFlag: '0' },
    });

    if (!article) {
      return ResultData.fail(500, '文章不存在');
    }

    await this.postArticleRepository.update(
      { id },
      {
        publishStatus: '2', // 已发布
        publishTime: new Date(),
      },
    );

    return ResultData.ok();
  }
}
