import { BaseEntity } from 'src/common/entities/base'
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('sys_logininfor', {
  comment: '系统访问记录',
})
export class MonitorLoginlogEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'info_id', comment: '访问ID' })
  public infoId: number

  @Column({ type: 'varchar', name: 'user_name', length: 50, default: '', comment: '用户账号' })
  public username: string

  @Column({ type: 'varchar', name: 'ipaddr', length: 128, default: '', comment: '登录IP地址' })
  public ipaddr: string

  @Column({
    type: 'varchar',
    name: 'login_location',
    length: 255,
    default: '',
    comment: '登录地点',
  })
  public loginLocation: string

  @Column({ type: 'varchar', name: 'browser', length: 50, default: '', comment: '浏览器类型' })
  public browser: string

  @Column({ type: 'varchar', name: 'os', length: 50, default: '', comment: '操作系统' })
  public os: string

  @CreateDateColumn({ type: 'timestamp', name: 'login_time', comment: '访问时间' })
  public loginTime: Date

  // 提示消息
  @Column({ type: 'varchar', name: 'message', length: 255, default: '', comment: '提示消息' })
  public message: string

  @Column({
    type: 'char',
    name: 'status',
    default: '0',
    length: 1,
    comment: '登录状态（0成功 1失败）',
  })
  public status: string
}
