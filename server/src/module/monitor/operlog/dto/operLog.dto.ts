import { IsString, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, OmitType, IntersectionType } from '@nestjs/swagger';
import { PagingDto } from 'src/common/dto/index';
import { CharEnum } from 'src/common/enum/index';

export class BaseOperLogDto {
  @ApiProperty({ required: false, description: '日志主键' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  operId?: number;

  @ApiProperty({ required: false, description: '模块标题' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ required: false, description: '业务类型' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  businessType?: number;

  @ApiProperty({ required: false, description: '请求方式' })
  @IsOptional()
  @IsString()
  requestMethod?: string;

  @ApiProperty({ required: false, description: '操作类别' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  operatorType?: number;

  @ApiProperty({ required: false, description: '操作人员' })
  @IsOptional()
  @IsString()
  operName?: string;

  @ApiProperty({ required: false, description: '部门名称' })
  @IsOptional()
  @IsString()
  deptName?: string;

  @ApiProperty({ required: false, description: '请求URL' })
  @IsOptional()
  @IsString()
  operUrl?: string;

  @ApiProperty({ required: false, description: '操作地点' })
  @IsOptional()
  @IsString()
  operLocation?: string;

  @ApiProperty({ required: false, description: '请求参数' })
  @IsOptional()
  @IsString()
  operParam?: string;

  @ApiProperty({ required: false, description: '返回参数' })
  @IsOptional()
  @IsString()
  jsonResult?: string;

  @ApiProperty({ required: false, description: '错误消息' })
  @IsOptional()
  @IsString()
  errorMsg?: string;

  @ApiProperty({ required: false, description: '方法名称' })
  @IsOptional()
  @IsString()
  method?: string;

  @ApiProperty({ required: false, description: '主机地址' })
  @IsOptional()
  @IsString()
  operIp?: string;

  @ApiProperty({ required: false, description: '操作时间' })
  @IsOptional()
  @IsString()
  operTime?: string;

  @ApiProperty({ enum: CharEnum, required: false, description: '登录状态' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ required: false, description: '消耗时间' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  costTime?: number;
}

export class CreateOperLogDto extends OmitType(BaseOperLogDto, ['operId']) {}

export class QueryOperLogDto extends IntersectionType(BaseOperLogDto, PagingDto) {}
