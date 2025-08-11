import { BaseEntity } from 'src/common/entities/base'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('sys_config', {
  comment: '参数配置表',
})
export class SysConfigEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'config_id', comment: '参数主键' })
  public configId: number

  @Column({ type: 'varchar', name: 'config_name', length: 100, default: '', comment: '参数名称' })
  public configName: string

  @Column({ type: 'varchar', name: 'config_key', length: 100, default: '', comment: '参数键名' })
  public configKey: string

  @Column({ type: 'varchar', name: 'config_value', length: 500, default: '', comment: '参数键值' })
  public configValue: string

  // 系统内置（Y是 N否）
  @Column({ type: 'char', name: 'config_type', length: 1, default: 'N', comment: '系统内置' })
  public configType: string

  @Column({ type: 'char', name: 'status', default: '0', length: 1, comment: '状态（0正常 1停用）' })
  public status: string
}
