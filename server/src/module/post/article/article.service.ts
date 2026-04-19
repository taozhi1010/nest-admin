import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ResultData } from 'src/common/utils/result';
import { PostArticleEntity } from './entities/article.entity';
import { CreatePostArticleDto, UpdatePostArticleDto, ListPostArticleDto, AuditPostArticleDto } from './dto/index';
import { UserDto } from 'src/module/system/user/user.decorator';
import { UserEntity } from 'src/module/system/user/entities/sys-user.entity';

/**
 * 文章服务类
 * 提供文章的增删改查、审核等功能
 */
@Injectable()
export class PostArticleService {
  constructor(
    @InjectRepository(PostArticleEntity)
    private readonly postArticleRepository: Repository<PostArticleEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  /**
   * 创建文章
   * @param createDto 创建文章的数据
   * @param user 当前登录用户信息
   * @returns 操作结果
   */
  async create(createDto: CreatePostArticleDto, user: UserDto) {
    // 从当前登录用户信息中获取 userId
    const userId = user.user.userId;

    console.log('📝 [创建文章] 当前登录用户ID:', userId);
    console.log('📝 [创建文章] 前端提交的DTO:', JSON.stringify(createDto));

    // 创建文章实体，并设置 userId（强制覆盖前端传来的任何userId）
    const article = this.postArticleRepository.create({
      ...createDto,
      userId: userId, // 这里会覆盖 createDto 中可能存在的 userId
    });

    console.log('📝 [创建文章] 最终保存的文章数据 userId:', article.userId);

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

    // 关联查询用户信息（用于前端展示作者详情）
    entity.leftJoin('sys_user', 'u', 'article.userId = u.user_id');
    entity.addSelect(['u.user_id', 'u.nick_name', 'u.avatar']);

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
  async findOne(id: number) {
    // 先查询文章基本信息
    const article = await this.postArticleRepository.findOne({
      where: { id, delFlag: '0' },
    });

    if (!article) {
      return ResultData.fail(500, '文章不存在');
    }

    // 根据文章中的 userId 查询用户详细信息
    const user = await this.userRepository.findOne({
      where: { userId: article.userId },
      select: ['userId', 'userName', 'nickName', 'avatar'],
    });

    // 将用户信息附加到文章数据中返回
    return ResultData.ok({
      ...article,
      userInfo: user || null,
    });
  }

  /**
   * 更新文章
   * @param updateDto 更新数据
   * @param user 当前登录用户信息
   * @returns 操作结果
   */
  async update(updateDto: UpdatePostArticleDto, user: UserDto) {
    const { id, ...updateData } = updateDto;

    const article = await this.postArticleRepository.findOne({
      where: { id, delFlag: '0' },
    });

    if (!article) {
      return ResultData.fail(500, '文章不存在');
    }

    // 权限验证：只能更新自己的文章（管理员除外）
    const currentUserId = user.user.userId;
    const isAdmin = user.roles?.includes('admin');

    if (!isAdmin && article.userId !== currentUserId) {
      return ResultData.fail(403, '无权修改此文章');
    }

    // 确保不会更新 userId 字段
    const { userId, ...safeUpdateData } = updateData as any;

    await this.postArticleRepository.update({ id }, safeUpdateData);
    return ResultData.ok();
  }

  /**
   * 删除文章（软删除，支持单个或多个）
   * @param ids 文章ID或ID数组
   * @param user 当前登录用户信息
   * @returns 操作结果
   */
  async remove(ids: number | number[], user: UserDto) {
    // 统一转换为数组
    const idList = Array.isArray(ids) ? ids : [ids];

    if (!idList || idList.length === 0) {
      return ResultData.fail(400, '请选择要删除的文章');
    }

    // 获取所有要删除的文章
    const articles = await this.postArticleRepository.find({
      where: {
        id: In(idList),
        delFlag: '0',
      },
    });

    if (articles.length === 0) {
      return ResultData.fail(500, '未找到可删除的文章');
    }

    // 权限验证：只能删除自己的文章（管理员除外）
    const currentUserId = user.user.userId;
    const isAdmin = user.roles?.includes('admin');

    if (!isAdmin) {
      // 检查是否有不属于当前用户的文章
      const unauthorizedArticles = articles.filter((article) => article.userId !== currentUserId);
      if (unauthorizedArticles.length > 0) {
        return ResultData.fail(403, '无权删除部分文章');
      }
    }

    // 批量软删除
    await this.postArticleRepository.update({ id: In(idList) }, { delFlag: '1' });

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
   * @param user 当前登录用户信息
   * @returns 操作结果
   */
  async submitForAudit(id: number, user: UserDto) {
    const article = await this.postArticleRepository.findOne({
      where: { id, delFlag: '0' },
    });

    if (!article) {
      return ResultData.fail(500, '文章不存在');
    }

    // 权限验证：只能提交自己的文章进行审核
    const currentUserId = user.user.userId;
    const isAdmin = user.roles?.includes('admin');

    if (!isAdmin && article.userId !== currentUserId) {
      return ResultData.fail(403, '无权操作此文章');
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
   * @param user 当前登录用户信息
   * @returns 操作结果
   */
  async publish(id: number, user: UserDto) {
    const article = await this.postArticleRepository.findOne({
      where: { id, delFlag: '0' },
    });

    if (!article) {
      return ResultData.fail(500, '文章不存在');
    }

    // 权限验证：只能发布自己的文章（管理员除外）
    const currentUserId = user.user.userId;
    const isAdmin = user.roles?.includes('admin');

    if (!isAdmin && article.userId !== currentUserId) {
      return ResultData.fail(403, '无权发布此文章');
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
