import { ApiProperty } from '@nestjs/swagger';
import { stringDateTransformer } from 'src/common/entities/transformer';
import {
	Column,
	CreateDateColumn,
	DataSource,
	Entity,
	BaseEntity as TypeormBaseEntity,
	UpdateDateColumn,
} from 'typeorm';
import { getOrder, Order } from '../decorators/order.decorator';

// 删除
export abstract class DeleteStatusEntity extends TypeormBaseEntity {
	@Order(9991)
	// 0代表存在 1代表删除
	@ApiProperty({ type: String, description: '删除标志' })
	@Column({ type: 'char', name: 'del_flag', default: '0', length: 1, comment: '删除标志' })
	public delFlag: string;
}

// 基础实体信息
@Entity()
export abstract class BaseEntity extends DeleteStatusEntity {
	@Order(9970)
	@ApiProperty({ type: String, description: '创建者' })
	@Column({ type: 'varchar', name: 'create_by', length: 64, default: '', comment: '创建者' })
	public createBy: string;

	@Order(9971)
	@ApiProperty({ type: Date, description: '创建时间' })
	@CreateDateColumn({
		type: 'timestamp',
		name: 'create_time',
		default: null,
		comment: '创建时间',
		transformer: stringDateTransformer,
	})
	public createTime: string;

	@ApiProperty({ type: String, description: '更新者' })
	@Order(9980)
	@Column({ type: 'varchar', name: 'update_by', length: 64, default: '', comment: '更新者' })
	public updateBy: string;

	@Order(9981)
	@ApiProperty({ type: Date, description: '更新时间' })
	@UpdateDateColumn({
		type: 'timestamp',
		name: 'update_time',
		default: null,
		comment: '更新时间',
		transformer: stringDateTransformer,
	})
	public updateTime: string;

	@Order(9990)
	@ApiProperty({ type: String, description: '备注' })
	@Column({ type: 'varchar', name: 'remark', length: 500, default: null, comment: '备注' })
	public remark: string;

	static useDataSource(dataSource: DataSource) {
		try {
			TypeormBaseEntity.useDataSource.call(this, dataSource);
			const meta = dataSource.entityMetadatasMap.get(this);
			if (meta != null) {
				// reorder columns here
				meta.columns = [...meta.columns].sort((x, y) => {
					const orderX = getOrder((x.target as any).prototype, x.propertyName);
					const orderY = getOrder((y.target as any).prototype, y.propertyName);
					return orderX - orderY;
				});
			}
		} catch (e) {
			console.error('数据库排序失败, 请查看自定义的BaseEntity是否有问题');
		}
	}
}
