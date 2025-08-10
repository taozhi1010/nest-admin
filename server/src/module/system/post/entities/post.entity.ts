import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from 'src/common/entities/base';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('sys_post', {
	comment: '岗位信息表',
})
export class SysPostEntity extends BaseEntity {
	@ApiProperty({ type: String, description: '岗位ID' })
	@PrimaryGeneratedColumn({ type: 'int', name: 'post_id', comment: '岗位ID' })
	public postId: number;

	@Column({ type: 'varchar', name: 'post_code', length: 64, comment: '岗位编码' })
	public postCode: string;

	@Column({ type: 'varchar', name: 'post_category', length: 64, comment: '类别编码' })
	public postCategory: string;
	
	@Column({ type: 'int', name: 'belong_dept_id', default: 100, comment: '部门ID' })
	public deptId: number;

	@Column({ type: 'varchar', name: 'post_name', length: 50, comment: '岗位名称' })
	public postName: string;

	@Column({ type: 'int', name: 'post_sort', default: 0, comment: '显示顺序' })
	public postSort: number;

	@Column({ type: 'char', name: 'status', default: '0', length: 1, comment: '状态（0正常 1停用）' })
	public status: string;
}
