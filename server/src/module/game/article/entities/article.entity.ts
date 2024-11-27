import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { BaseEntity } from 'src/common/entities/base';
import { ApiProperty } from '@nestjs/swagger';

@Entity('game_article', {
  comment: '游戏文章表',
})
export class gameAricleEntity extends BaseEntity {
  @ApiProperty({ type: Number, description: '文章ID' })
  @PrimaryGeneratedColumn({ type: 'int', name: 'article_id', comment: '文章ID' })
  public noticeId: number;

  @ApiProperty({ type: String, description: '文章标题' })
  @Column({ type: 'varchar', name: 'title', length: 50, default: '', comment: '文章标题' })
  public title: string;

  @ApiProperty({ type: String, description: '文章简介' })
  @Column({ type: 'varchar', name: 'desc', length: 50, default: '', comment: '文章简介' })
  public desc: string;

  @ApiProperty({ type: String, description: '文章专栏' })
  @Column({ type: 'varchar', name: 'subject_id', length: 50, default: '', comment: '文章专栏' })
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

  //0正常 1停用
  @ApiProperty({ type: String, description: '状态' })
  @Column({ type: 'char', name: 'status', default: '0', length: 1, comment: '文章状态' })
  public status: string;

  @ApiProperty({ type: Date, description: '发布时间' })
  @Column({ type: 'datetime', name: 'publish_time', default: null, comment: '发布时间' })
  public publishTime: Date;

  @ApiProperty({ type: String, description: '创建者' })
  @Column({ type: 'varchar', name: 'create_by', length: 64, default: '', comment: '创建者' })
  public createBy: string;

  @ApiProperty({ type: Date, description: '创建时间' })
  @CreateDateColumn({ type: 'datetime', name: 'create_time', default: null, comment: '创建时间' })
  public createTime: Date;

  @ApiProperty({ type: String, description: '更新者' })
  @Column({ type: 'varchar', name: 'update_by', length: 64, default: '', comment: '更新者' })
  public updateBy: string;

  @ApiProperty({ type: Date, description: '更新时间' })
  @UpdateDateColumn({ type: 'datetime', name: 'update_time', default: null, comment: '更新时间' })
  public updateTime: Date;

  //0代表存在 1代表删除
  @ApiProperty({ type: String, description: '删除标志' })
  @Column({ type: 'char', name: 'del_flag', default: '0', length: 1, comment: '删除标志' })
  public delFlag: string;
}
