export class Dict {}
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from 'src/common/entities/base';

@Entity('sys_dict_data', {
  comment: '字典数据表',
})
export class SysDictDataEntity extends BaseEntity {
  @ApiProperty({ type: String, description: '字典主键' })
  @PrimaryGeneratedColumn({ type: 'int', name: 'dict_code', comment: '字典主键' })
  public dictCode: number;

  @Column({ type: 'int', name: 'dict_sort', default: 0, comment: '字典排序' })
  public dictSort: number;

  @Column({ type: 'varchar', name: 'dict_label', length: 100, comment: '字典标签' })
  public dictLabel: string;

  @Column({ type: 'varchar', name: 'dict_value', length: 100, comment: '字典键值' })
  public dictValue: string;

  @Column({ type: 'varchar', name: 'dict_type', length: 100, comment: '字典类型' })
  public dictType: string;

  //样式属性（其他样式扩展）
  @Column({ type: 'varchar', name: 'css_class', length: 100, default: '', comment: '样式属性' })
  public cssClass: string;

  //样式属性（其他样式扩展）
  @Column({ type: 'varchar', name: 'list_class', length: 100, comment: '表格回显样式' })
  public listClass: string;

  //是否默认（Y是 N否）
  @Column({ type: 'char', name: 'is_default', length: 1, default: 'N', comment: '是否默认' })
  public isDefault: string;
}
