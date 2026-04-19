import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { PagingDto } from 'src/common/dto/index';
import { Transform } from 'class-transformer';

/**
 * 发布状态枚举
 */
export enum PublishStatusEnum {
  DRAFT = '0',      // 草稿
  PENDING = '1',    // 待发布
  PUBLISHED = '2',  // 已发布
  OFFLINE = '3',    // 已下架
}

/**
 * 审核状态枚举
 */
export enum AuditStatusEnum {
  NOT_SUBMITTED = '0',  // 未提交
  AUDITING = '1',       // 审核中
  APPROVED = '2',       // 审核通过
  REJECTED = '3',       // 审核拒绝
}

/**
 * 创建文章 DTO
 */
export class CreatePostArticleDto {
  @ApiProperty({ required: true, description: '文章标题' })
  @IsString()
  title: string;

  @ApiProperty({ required: false, description: '文章简介' })
  @IsOptional()
  @IsString()
  desc?: string;

  @ApiProperty({ required: true, description: '专栏ID' })
  @IsNumber()
  subjectId: number;

  @ApiProperty({ required: false, description: '文章内容' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({ required: false, description: '封面图片' })
  @IsOptional()
  @IsString()
  cover?: string;

  @ApiProperty({ required: false, description: '作者昵称' })
  @IsOptional()
  @IsString()
  author?: string;

  @ApiProperty({ required: false, description: '发布时间' })
  @IsOptional()
  publishTime?: Date;

  @ApiProperty({ required: false, description: '点赞数' })
  @IsOptional()
  @IsNumber()
  likeNum?: number;

  @ApiProperty({ required: false, description: '阅读数' })
  @IsOptional()
  @IsNumber()
  readNum?: number;

  @ApiProperty({ required: false, description: '评论数' })
  @IsOptional()
  @IsNumber()
  commentNum?: number;

  @ApiProperty({ required: false, description: '发布状态', enum: PublishStatusEnum })
  @IsOptional()
  @IsEnum(PublishStatusEnum)
  publishStatus?: string;

  @ApiProperty({ required: false, description: '审核状态', enum: AuditStatusEnum })
  @IsOptional()
  @IsEnum(AuditStatusEnum)
  auditStatus?: string;

  @ApiProperty({ required: false, description: '定时发布时间' })
  @IsOptional()
  scheduledPublishTime?: Date;

  @ApiProperty({ required: false, description: '排序' })
  @IsOptional()
  @IsNumber()
  sort?: number;
}

/**
 * 更新文章 DTO
 */
export class UpdatePostArticleDto extends CreatePostArticleDto {
  @ApiProperty({ required: true, description: '文章ID' })
  @IsNumber()
  id: number;
}

/**
 * 文章列表查询 DTO
 */
export class ListPostArticleDto extends PagingDto {
  @ApiProperty({ required: false, description: '文章标题（模糊搜索）' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ required: false, description: '专栏ID' })
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value, 10) : undefined))
  @IsNumber()
  subjectId?: number;

  @ApiProperty({ required: false, description: '作者用户ID' })
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value, 10) : undefined))
  @IsNumber()
  userId?: number;

  @ApiProperty({ required: false, description: '发布状态', enum: PublishStatusEnum })
  @IsOptional()
  @IsEnum(PublishStatusEnum)
  publishStatus?: string;

  @ApiProperty({ required: false, description: '审核状态', enum: AuditStatusEnum })
  @IsOptional()
  @IsEnum(AuditStatusEnum)
  auditStatus?: string;
}

/**
 * 文章详情 DTO
 */
export class DetailPostArticleDto {
  @ApiProperty({ required: true, description: '文章ID' })
  @IsNumber()
  id: number;
}

/**
 * 审核文章 DTO
 */
export class AuditPostArticleDto {
  @ApiProperty({ required: true, description: '文章ID' })
  @IsNumber()
  id: number;

  @ApiProperty({ required: true, description: '审核状态', enum: AuditStatusEnum })
  @IsEnum(AuditStatusEnum)
  auditStatus: string;

  @ApiProperty({ required: false, description: '审核备注' })
  @IsOptional()
  @IsString()
  auditRemark?: string;
}
