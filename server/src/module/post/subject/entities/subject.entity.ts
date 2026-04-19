import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from 'src/common/entities/base';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 专栏实体类
 * 对应数据库表：post_subject
 */
@Entity('post_subject', {
  comment: '专栏库',
})
export class PostSubjectEntity extends BaseEntity {
  @ApiProperty({ type: Number, description: '专栏ID' })
  @PrimaryGeneratedColumn({ name: 'id', comment: '专栏ID' })
  public id: number;

  @ApiProperty({ type: String, description: '专栏标题' })
  @Column({ type: 'varchar', name: 'title', length: 64, comment: '专栏标题' })
  public title: string;

  @ApiProperty({ type: String, description: '专栏简介', required: false })
  @Column({ type: 'varchar', name: 'desc', length: 255, nullable: true, comment: '专栏简介' })
  public desc: string;

  @ApiProperty({ type: Number, description: '创建者用户ID' })
  @Column({ type: 'int', name: 'user_id', comment: '创建者用户ID' })
  public userId: number;

  @ApiProperty({ type: String, description: '专栏封面', required: false })
  @Column({ type: 'varchar', name: 'cover', length: 255, nullable: true, comment: '专栏封面' })
  public cover: string;

  @ApiProperty({ type: String, description: '作者昵称', required: false })
  @Column({ type: 'varchar', name: 'author', length: 64, nullable: true, comment: '作者昵称' })
  public author: string;

  @ApiProperty({ type: Number, description: '文章数量' })
  @Column({ type: 'int', name: 'article_count', default: 0, comment: '文章数量' })
  public articleCount: number;

  @ApiProperty({ type: String, description: '发布状态（0 草稿 1 待发布 2 已发布 3 已下架）' })
  @Column({ type: 'char', name: 'publish_status', length: 1, default: '0', comment: '发布状态（0 草稿 1 待发布 2 已发布 3 已下架）' })
  public publishStatus: string;

  @ApiProperty({ type: String, description: '审核状态（0 未提交 1 审核中 2 审核通过 3 审核拒绝）' })
  @Column({ type: 'char', name: 'audit_status', length: 1, default: '0', comment: '审核状态（0 未提交 1 审核中 2 审核通过 3 审核拒绝）' })
  public auditStatus: string;

  @ApiProperty({ type: Date, description: '定时发布时间', required: false })
  @Column({ type: 'datetime', name: 'scheduled_publish_time', nullable: true, comment: '定时发布时间' })
  public scheduledPublishTime: Date;

  @ApiProperty({ type: Number, description: '审核人ID', required: false })
  @Column({ type: 'int', name: 'audit_user_id', nullable: true, comment: '审核人ID' })
  public auditUserId: number;

  @ApiProperty({ type: Date, description: '审核时间', required: false })
  @Column({ type: 'datetime', name: 'audit_time', nullable: true, comment: '审核时间' })
  public auditTime: Date;

  @ApiProperty({ type: String, description: '审核备注', required: false })
  @Column({ type: 'varchar', name: 'audit_remark', length: 500, nullable: true, comment: '审核备注' })
  public auditRemark: string;

  @ApiProperty({ type: Number, description: '排序', required: false })
  @Column({ type: 'int', name: 'sort', nullable: true, comment: '排序' })
  public sort: number;
}
