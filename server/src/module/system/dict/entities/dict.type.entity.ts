import { ApiProperty } from '@nestjs/swagger'
import { BaseEntity } from 'src/common/entities/base'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

export class Dict {}

@Entity('sys_dict_type', {
  comment: '字典类型表',
})
export class SysDictTypeEntity extends BaseEntity {
  @ApiProperty({ type: String, description: '字典主键' })
  @PrimaryGeneratedColumn({ type: 'int', name: 'dict_id', comment: '字典主键' })
  public dictId: number

  @Column({ type: 'varchar', name: 'dict_name', length: 100, comment: '字典名称' })
  public dictName: string

  @Column({ type: 'varchar', name: 'dict_type', unique: true, length: 100, comment: '字典类型' })
  public dictType: string

  @Column({ type: 'char', name: 'status', default: '0', length: 1, comment: '状态（0正常 1停用）' })
  public status: string
}
