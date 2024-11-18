import { IsDateString, IsNumber, IsNumberString, IsObject, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

/**
 * 时间区间对象
 */
export class DateParamsDTO {
  @IsDateString()
  beginTime: string;

  @IsDateString()
  endTime: string;
}

/**
 * 分页DTO
 */
export class PagingDto {
  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @Transform(({ value }) => {
    return value?.toString?.() || '1';
  })
  @IsNumberString()
  pageNum?: number;

  @ApiProperty({ required: false, default: 10 })
  @IsOptional()
  @Transform(({ value }) => {
    return value?.toString?.() || '10';
  })
  @IsNumberString()
  pageSize?: number;

  /**
   * 时间区间
   */
  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  params?: DateParamsDTO;

  /**
   * 排序字段
   */
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  orderByColumn?: string;

  /**
   * 排序规则
   */
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  isAsc?: 'ascending' | 'descending';
}
