import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { BaseEntity } from 'src/common/entities/base';
import { ApiProperty } from '@nestjs/swagger';

@Entity('game_article', {
  comment: '游戏文章表',
})
export class gameAricleEntity extends BaseEntity {
  @ApiProperty({ type: Number, description: '文章ID' })
  @PrimaryGeneratedColumn({ type: 'int', name: 'article_id', comment: '文章ID' })
  public articleId: number;

  @ApiProperty({ type: String, description: '文章标题' })
  @Column({ type: 'varchar', name: 'title', length: 50, default: '', comment: '文章标题' })
  public title: string;

  @ApiProperty({ type: String, description: '文章简介' })
  @Column({ type: 'varchar', name: 'remark', length: 50, default: '', comment: '文章简介' })
  public remark: string;

  @ApiProperty({ type: String, description: '文章专栏' })
  @Column({ type: 'int', name: 'subject_id', default: null, comment: '文章专栏' })
  public subjectId: string;

  @ApiProperty({ type: String, description: '文章内容' })
  @Column({ type: 'varchar', name: 'content', length: 200, default: '', comment: '文章内容' })
  public content: string;

  @ApiProperty({ type: String, description: '文章封面' })
  @Column({ type: 'varchar', name: 'cover', length: 255, default: '', comment: '文章封面' })
  public cover: string;

  @ApiProperty({ type: String, description: '作者' })
  @Column({ type: 'varchar', name: 'author', length: 200, default: '', comment: '作者' })
  public author: string;

  @ApiProperty({ type: Date, description: '发布时间' })
  @Column({ type: 'datetime', name: 'publish_time', default: null, comment: '发布时间' })
  public publishTime: Date;

  @ApiProperty({ type: Number, description: '点赞数' })
  @Column({ type: 'int', name: 'like_num', default: null, comment: '点赞数' })
  public likeNum: number;

  @ApiProperty({ type: Number, description: '阅读量' })
  @Column({ type: 'int', name: 'read_num', default: null, comment: '阅读量' })
  public readNum: number;

  @ApiProperty({ type: Number, description: '阅读量' })
  @Column({ type: 'int', name: 'comment_num', default: null, comment: '阅读量' })
  public commentNum: number;

  // 0草稿 1发布 2下架 3审核中
  @ApiProperty({ type: Number, description: '状态' })
  @Column({ type: 'char', name: 'status', default: '0', length: 1, comment: '文章状态 0草稿 1发布 2下架 3审核中' })
  public status: string;

  //0代表存在 1代表删除
  @ApiProperty({ type: String, description: '删除标志' })
  @Column({ type: 'char', name: 'del_flag', default: '0', length: 1, comment: '删除标志' })
  public delFlag: string;
}
