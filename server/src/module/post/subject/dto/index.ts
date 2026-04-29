import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PagingDto } from 'src/common/dto/index';
import { Transform } from 'class-transformer';

export enum PublishStatusEnum {
  DRAFT = '0',
  PENDING = '1',
  PUBLISHED = '2',
  OFFLINE = '3',
}

export enum AuditStatusEnum {
  NOT_SUBMITTED = '0',
  AUDITING = '1',
  APPROVED = '2',
  REJECTED = '3',
}

export class CreatePostSubjectDto {
  @ApiProperty({ required: true, description: '专栏标题' })
  @IsString()
  title: string;

  @ApiProperty({ required: false, description: '专栏简介' })
  @IsOptional()
  @IsString()
  desc?: string;

  @ApiProperty({ required: false, description: '专栏封面' })
  @IsOptional()
  @IsString()
  cover?: string;

  @ApiProperty({ required: false, description: '作者昵称' })
  @IsOptional()
  @IsString()
  author?: string;

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

export class UpdatePostSubjectDto extends CreatePostSubjectDto {
  @ApiProperty({ required: true, description: '专栏ID' })
  @IsNumber()
  id: number;
}

export class ListPostSubjectDto extends PagingDto {
  @ApiProperty({ required: false, description: '专栏标题' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ required: false, description: '创建者用户ID' })
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
