import { IsString, IsJSON, IsEnum, IsPhoneNumber, Min, Length, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { PagingDto } from 'src/common/dto/index';

export enum StatusEnum {
  STATIC = '0',
  DYNAMIC = '1',
}
export enum TypeEnum {
  Instruct = '1',
  Notice = '2',
}
export class CreateNoticeDto {
  @IsString()
  @Length(0, 50)
  noticeTitle: string;

  @IsString()
  @IsEnum(TypeEnum)
  noticeType: string;

  @ApiProperty({
    required: true,
  })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  remark?: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsEnum(StatusEnum)
  status?: string;
}

export class UpdateNoticeDto extends CreateNoticeDto {
  @IsNumber()
  noticeId: number;
}

export class ListNoticeDto extends PagingDto {
  @IsOptional()
  @IsString()
  @Length(0, 50)
  noticeTitle?: string;

  @IsOptional()
  @IsString()
  @IsEnum(TypeEnum)
  noticeType?: string;

  @IsOptional()
  @IsString()
  createBy?: string;
}
