import { IsString, IsJSON, IsEnum, IsPhoneNumber, Min, Length, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { PagingDto } from 'src/common/dto/index';

export enum StatusEnum {
  STATIC = '0',
  DYNAMIC = '1',
}

export class CreateDictTypeDto {
  @ApiProperty({
    required: true,
  })
  @IsString()
  @Length(0, 100)
  dictName: string;

  @ApiProperty({
    required: true,
  })
  @IsString()
  @Length(0, 100)
  dictType: string;

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

export class UpdateDictTypeDto extends CreateDictTypeDto {
  @IsNumber()
  dictId: number;
}

export class ListDictType extends PagingDto {
  @IsOptional()
  @IsString()
  @Length(0, 100)
  dictName?: string;

  @IsOptional()
  @IsString()
  @Length(0, 100)
  dictType?: string;

  @IsOptional()
  @IsString()
  @IsEnum(StatusEnum)
  status?: string;
}

export class CreateDictDataDto {
  @IsString()
  @Length(0, 100)
  dictType: string;

  @IsString()
  @Length(0, 100)
  dictLabel: string;

  @IsString()
  @Length(0, 100)
  dictValue: string;

  @IsString()
  @Length(0, 100)
  listClass: string;

  @IsOptional()
  @IsNumber()
  dictSort?: number;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  remark?: string;

  @IsOptional()
  @IsString()
  @IsEnum(StatusEnum)
  status?: string;
}

export class UpdateDictDataDto extends CreateDictDataDto {
  @IsNumber()
  dictCode: number;
}

export class ListDictData extends PagingDto {
  @IsOptional()
  @IsString()
  @Length(0, 100)
  dictLabel?: string;

  @IsOptional()
  @IsString()
  @Length(0, 100)
  dictType?: string;

  @IsOptional()
  @IsString()
  @IsEnum(StatusEnum)
  status?: string;
}
