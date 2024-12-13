import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Length } from 'class-validator';
import { PagingDto } from 'src/common/dto/index';

export class CreateJobDto {
  @ApiProperty({ description: '任务名称' })
  @IsNotEmpty({ message: '任务名称不能为空' })
  @IsString()
  @Length(1, 64)
  jobName: string;

  @ApiProperty({ description: '任务组名' })
  @IsNotEmpty({ message: '任务组名不能为空' })
  @IsString()
  @Length(1, 64)
  jobGroup: string;

  @ApiProperty({ description: '调用目标字符串' })
  @IsNotEmpty({ message: '调用目标字符串不能为空' })
  @IsString()
  @Length(1, 500)
  invokeTarget: string;

  @ApiProperty({ description: 'cron执行表达式' })
  @IsNotEmpty({ message: 'cron表达式不能为空' })
  @IsString()
  cronExpression: string;

  @ApiProperty({ description: '计划执行错误策略（1立即执行 2执行一次 3放弃执行）' })
  @IsString()
  @IsOptional()
  misfirePolicy?: string;

  @ApiProperty({ description: '是否并发执行（0允许 1禁止）' })
  @IsString()
  @IsOptional()
  concurrent?: string;

  @ApiProperty({ description: '状态（0正常 1暂停）' })
  @IsString()
  status: string;

  @ApiProperty({ description: '备注信息', required: false })
  @IsString()
  @IsOptional()
  remark?: string;
}

export class ListJobDto {
  @ApiProperty({ description: '任务名称' })
  @IsOptional()
  @IsString()
  jobName?: string;

  @ApiProperty({ description: '任务组名' })
  @IsOptional()
  @IsString()
  @Length(1, 64)
  jobGroup: string;

  @ApiProperty({ description: '状态（0正常 1暂停）' })
  @IsOptional()
  @IsString()
  status?: string;
}

export class ListJobLogDto extends PagingDto {
  @ApiProperty({ description: '任务名称' })
  @IsOptional()
  @IsString()
  jobName?: string;

  @ApiProperty({ description: '任务组名' })
  @IsOptional()
  @IsString()
  @Length(1, 64)
  jobGroup: string;

  @ApiProperty({ description: '状态（0正常 1暂停）' })
  @IsOptional()
  @IsString()
  status?: string;
}
