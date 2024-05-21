import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from 'src/common/entities/base';

@Entity('sys_dept', {
  comment: '部门表',
})
export class SysDeptEntity extends BaseEntity {
  @ApiProperty({ type: String, description: '部门ID' })
  @PrimaryGeneratedColumn({ type: 'int', name: 'dept_id', comment: '部门ID' })
  public deptId: number;

  @ApiProperty({ type: String, description: '父部门ID' })
  @Column({ type: 'int', name: 'parent_id', default: 0, comment: '父部门ID' })
  public parentId: number;

  @Column({ type: 'varchar', name: 'ancestors', length: 50, default: '0', comment: '祖级列表' })
  public ancestors: string;

  @Column({ type: 'varchar', name: 'dept_name', length: 30, comment: '部门名称' })
  public deptName: string;

  @Column({ type: 'int', name: 'order_num', default: 0, comment: '显示顺序' })
  public orderNum: number;

  @Column({ type: 'varchar', name: 'leader', length: 20, comment: '负责人' })
  public leader: string;

  @ApiProperty({ type: String, description: '联系电话' })
  @Column({ type: 'varchar', name: 'phone', default: '', length: 11, comment: '联系电话' })
  public phone: string;

  @ApiProperty({ type: String, description: '邮箱' })
  @Column({ type: 'varchar', name: 'email', length: 50, default: '', comment: '邮箱' })
  public email: string;
}
