import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { DeleteStatusEntity } from 'src/common/entities/base';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 文章实体类
 * 对应数据库表：post_article
 */
@Entity('post_article', {
  comment: '文章库',
})
export class PostArticleEntity extends DeleteStatusEntity {
  @ApiProperty({ type: String, description: '创建者' })
  @Column({ type: 'varchar', name: 'create_by', length: 64, default: '', comment: '创建者' })
  public createBy: string;

  @CreateDateColumn({ type: 'datetime', name: 'create_time', default: null, comment: '创建时间' })
  public createTime: Date;

  @Column({ type: 'varchar', name: 'update_by', length: 64, default: '', comment: '更新者' })
  public updateBy: string;

  @UpdateDateColumn({ type: 'datetime', name: 'update_time', default: null, comment: '更新时间' })
  public updateTime: Date;

  @Column({ type: 'varchar', name: 'remark', length: 500, default: null, comment: '备注' })
  public remark: string;
  @ApiProperty({ type: Number, description: '文章ID' })
  @PrimaryGeneratedColumn({ name: 'id', comment: '文章ID' })
  public id: number;

  @ApiProperty({ type: String, description: '文章标题' })
  @Column({ type: 'varchar', name: 'title', length: 64, comment: '文章标题' })
  public title: string;

  @ApiProperty({ type: String, description: '文章简介', required: false })
  @Column({ type: 'varchar', name: 'desc', length: 255, nullable: true, comment: '文章简介' })
  public desc: string;

  @ApiProperty({ type: String, description: '专栏ID' })
  @Column({ type: 'int', name: 'subject_id', comment: '专栏ID' })
  public subjectId: number;

  @ApiProperty({ type: Number, description: '作者用户ID' })
  @Column({ type: 'int', name: 'user_id', comment: '作者用户ID' })
  public userId: number;

  @ApiProperty({ type: String, description: '文章内容', required: false })
  @Column({ type: 'longtext', name: 'content', nullable: true, comment: '文章内容' })
  public content: string;

  @ApiProperty({ type: String, description: '封面图片', required: false })
  @Column({ type: 'varchar', name: 'cover', length: 255, nullable: true, comment: '封面' })
  public cover: string;

  @ApiProperty({ type: String, description: '作者昵称', required: false })
  @Column({ type: 'varchar', name: 'author', length: 64, nullable: true, comment: '作者昵称' })
  public author: string;

  @ApiProperty({ type: Date, description: '发布时间', required: false })
  @Column({ type: 'datetime', name: 'publish_time', nullable: true, comment: '发布时间' })
  public publishTime: Date;

  @ApiProperty({ type: Number, description: '点赞数' })
  @Column({ type: 'int', name: 'like_num', default: 0, comment: '点赞数' })
  public likeNum: number;

  @ApiProperty({ type: Number, description: '阅读数' })
  @Column({ type: 'int', name: 'read_num', default: 0, comment: '阅读数' })
  public readNum: number;

  @ApiProperty({ type: Number, description: '评论数' })
  @Column({ type: 'int', name: 'comment_num', default: 0, comment: '评论数' })
  public commentNum: number;

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
