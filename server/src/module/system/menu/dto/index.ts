import { IsString, IsJSON, IsEnum, IsPhoneNumber, Min, Length, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum StatusEnum {
  STATIC = '0',
  DYNAMIC = '1',
}

//菜单类型
export enum MenuTypeEnum {
  M = 'M',
  C = 'C',
  F = 'F',
}

export class CreateMenuDto {
  @ApiProperty({ required: true })
  @IsString()
  @Length(0, 50)
  menuName: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  orderNum: number;

  @ApiProperty({ required: true })
  @IsOptional()
  @IsNumber()
  parentId: number;

  @ApiProperty({ required: true })
  @IsString()
  @Length(0, 200)
  path: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Length(0, 200)
  query: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Length(0, 255)
  component?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Length(0, 100)
  icon?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @IsEnum(MenuTypeEnum)
  menuType: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @IsEnum(StatusEnum)
  isCache: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsEnum(StatusEnum)
  isFrame: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @IsEnum(StatusEnum)
  status: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @IsEnum(StatusEnum)
  visible: string;
}

export class UpdateMenuDto extends CreateMenuDto {
  @ApiProperty({ required: true })
  @ApiProperty({
    required: false,
  })
  @IsNumber()
  menuId: number;
}

export class ListDeptDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  menuName?: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsEnum(StatusEnum)
  status?: string;
}
