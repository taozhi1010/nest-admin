import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from 'src/common/entities/base';

@Entity('sys_notice', {
  comment: '通知公告表',
})
export class SysNoticeEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'notice_id', comment: '公告ID' })
  public noticeId: number;

  @Column({ type: 'varchar', name: 'notice_title', length: 50, default: '', comment: '公告标题' })
  public noticeTitle: string;

  //公告类型（1通知 2公告）
  @Column({ type: 'char', name: 'notice_type', length: 1, comment: '公告类型' })
  public noticeType: string;

  @Column({ type: 'longtext', name: 'notice_content', default: null, comment: '公告内容' })
  public noticeContent: string;
}
