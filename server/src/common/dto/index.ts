import { IsDateString, IsNumber, IsNumberString, IsObject, IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { SortRuleEnum } from 'src/common/enum/index';

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
 * 分页 DTO
 */
export class PagingDto {
  @ApiProperty({ required: true, description: '当前分页', default: 1 })
  @IsOptional()
  @Transform(({ value }) => {
    // 转换为数字，默认值为 1
    const num = parseInt(value, 10);
    return isNaN(num) ? 1 : num;
  })
  pageNum?: number;

  @ApiProperty({ required: true, description: '每页数量', default: 10 })
  @IsOptional()
  @Transform(({ value }) => {
    // 转换为数字，默认值为 10
    const num = parseInt(value, 10);
    return isNaN(num) ? 10 : num;
  })
  pageSize?: number;

  /**
   * 时间区间
   */
  @ApiProperty({ required: false, description: '时间范围' })
  @IsOptional()
  @IsObject()
  params?: DateParamsDTO;

  /**
   * 排序字段
   */
  @ApiProperty({ required: false, description: '排序字段' })
  @IsOptional()
  @IsString()
  orderByColumn?: string;

  /**
   * 排序规则
   */
  @ApiProperty({ required: false, description: '排序规则' })
  @IsOptional()
  @IsEnum(SortRuleEnum)
  isAsc?: string;
}
