import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from 'src/common/entities/base';

@Entity('sys_post', {
  comment: '岗位信息表',
})
export class SysPostEntity extends BaseEntity {
  @ApiProperty({ type: String, description: '岗位ID' })
  @PrimaryGeneratedColumn({ type: 'int', name: 'post_id', comment: '岗位ID' })
  public postId: number;

  @Column({ type: 'varchar', name: 'post_code', length: 64, comment: '岗位编码' })
  public postCode: string;

  @Column({ type: 'varchar', name: 'post_name', length: 50, comment: '岗位名称' })
  public postName: string;

  @Column({ type: 'int', name: 'post_sort', default: 0, comment: '显示顺序' })
  public postSort: number;
}
