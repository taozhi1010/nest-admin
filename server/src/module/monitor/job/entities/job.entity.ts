import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from 'src/common/entities/base';
import { ApiProperty } from '@nestjs/swagger';

@Entity('sys_job', {
  comment: '定时任务表',
})
export class Job extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'job_id', comment: '任务ID' })
  public jobId: number;

  @ApiProperty({ description: '任务名称' })
  @Column({ type: 'varchar', name: 'job_name', length: 64, comment: '任务名称' })
  public jobName: string;

  @ApiProperty({ description: '任务组名' })
  @Column({ type: 'varchar', name: 'job_group', length: 64, comment: '任务组名', default: 'DEFAULT' })
  public jobGroup: string;

  @ApiProperty({ description: '调用目标字符串' })
  @Column({ type: 'varchar', name: 'invoke_target', length: 500, comment: '调用目标字符串' })
  public invokeTarget: string;

  @ApiProperty({ description: 'cron执行表达式' })
  @Column({ type: 'varchar', name: 'cron_expression', length: 255, comment: 'cron执行表达式', nullable: true })
  public cronExpression: string;

  @ApiProperty({ description: '计划执行错误策略（1立即执行 2执行一次 3放弃执行）' })
  @Column({
    type: 'varchar',
    name: 'misfire_policy',
    length: 20,
    comment: '计划执行错误策略（1立即执行 2执行一次 3放弃执行）',
    default: '3',
    nullable: true,
  })
  public misfirePolicy: string;

  @ApiProperty({ description: '是否并发执行（0允许 1禁止）' })
  @Column({
    type: 'char',
    name: 'concurrent',
    length: 1,
    comment: '是否并发执行（0允许 1禁止）',
    default: '1',
    nullable: true,
  })
  public concurrent: string;
}
