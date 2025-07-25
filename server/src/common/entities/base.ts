import { Column, CreateDateColumn, Entity, UpdateDateColumn } from 'typeorm';
import { dateTransformer } from 'src/common/utils/index';
import { ApiProperty } from '@nestjs/swagger';

//基础实体信息
@Entity()
export abstract class DeleteStatusEntity {
  //0代表存在 1代表删除
  @ApiProperty({ type: String, description: '删除标志' })
  @Column({ type: 'char', name: 'del_flag', default: '0', length: 1, comment: '删除标志' })
  public delFlag: string;
}

// 状态
@Entity()
export abstract class BaseStatusEntity extends DeleteStatusEntity {
  //0正常 1停用
  @ApiProperty({ type: String, description: '状态' })
  @Column({ type: 'char', name: 'status', default: '0', length: 1, comment: '状态' })
  public status: string;
}

//基础实体信息
@Entity()
export abstract class BaseEntity extends BaseStatusEntity {
  @ApiProperty({ type: String, description: '创建者' })
  @Column({ type: 'varchar', name: 'create_by', length: 64, default: '', comment: '创建者' })
  public createBy: string;

  @CreateDateColumn({ type: 'datetime', name: 'create_time', default: null, transformer: dateTransformer, comment: '创建时间' })
  public createTime: Date;

  @Column({ type: 'varchar', name: 'update_by', length: 64, default: '', comment: '更新者' })
  public updateBy: string;

  @UpdateDateColumn({ type: 'datetime', name: 'update_time', default: null, transformer: dateTransformer, comment: '更新时间' })
  public updateTime: Date;

  @Column({ type: 'varchar', name: 'remark', length: 500, default: null, comment: '备注' })
  public remark: string;
}
