import { ApiProperty } from '@nestjs/swagger'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { BaseEntity } from '@/common/entities/base'

@Entity('sys_job_log')
export class JobLog extends BaseEntity {
  @ApiProperty({ description: '任务日志ID' })
  @PrimaryGeneratedColumn({ name: 'job_log_id', comment: '任务日志ID' })
  jobLogId: number

  @ApiProperty({ description: '任务名称' })
  @Column({ name: 'job_name', length: 64, comment: '任务名称' })
  jobName: string

  @ApiProperty({ description: '任务组名' })
  @Column({ name: 'job_group', length: 64, comment: '任务组名' })
  jobGroup: string

  @ApiProperty({ description: '调用目标字符串' })
  @Column({ name: 'invoke_target', length: 500, comment: '调用目标字符串' })
  invokeTarget: string

  @ApiProperty({ description: '日志信息' })
  @Column({ name: 'job_message', length: 500, nullable: true, comment: '日志信息' })
  jobMessage: string

  @ApiProperty({ description: '执行状态（0正常 1失败）' })
  @Column({
    name: 'status',
    type: 'char',
    length: 1,
    default: '0',
    comment: '执行状态（0正常 1失败）',
  })
  status: string

  @ApiProperty({ description: '异常信息' })
  @Column({ name: 'exception_info', length: 2000, nullable: true, comment: '异常信息' })
  exceptionInfo: string
}
