import { IsString, IsJSON, IsEnum, IsPhoneNumber, IsArray, Min, Length, IsOptional, IsBoolean, IsNumber, IsNumberString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PagingDto } from 'src/common/dto/index';

export enum StatusEnum {
  STATIC = '0',
  DYNAMIC = '1',
}

//菜单类型
export enum RoleTypeEnum {
  M = 'M',
  C = 'C',
  F = 'F',
}

export class CreateRoleDto {
  @ApiProperty({ required: true })
  @IsString()
  @Length(0, 30)
  roleName: string;

  @ApiProperty({ required: true })
  @IsString()
  @Length(0, 100)
  roleKey: string;

  @IsOptional()
  @IsArray()
  menuIds?: Array<number>;

  @IsOptional()
  @IsArray()
  deptIds?: Array<number>;

  @ApiProperty({ required: true })
  @IsOptional()
  @IsNumber()
  roleSort?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @IsEnum(StatusEnum)
  status?: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  dataScope: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  remark?: string;

  @IsOptional()
  @IsBoolean()
  menuCheckStrictly?: boolean;

  @IsOptional()
  @IsBoolean()
  deptCheckStrictly?: boolean;
}

export class UpdateRoleDto extends CreateRoleDto {
  @ApiProperty({
    required: true,
  })
  @IsNumber()
  roleId: number;
}

export class ChangeStatusDto {
  @ApiProperty({
    required: true,
  })
  @IsNumber()
  roleId: number;

  @ApiProperty({ required: true })
  @IsString()
  @IsEnum(StatusEnum)
  status: string;
}

export class ListRoleDto extends PagingDto {
  @IsOptional()
  @IsString()
  @Length(0, 30)
  roleName?: string;

  @IsOptional()
  @IsString()
  @Length(0, 100)
  roleKey?: string;

  @IsOptional()
  @IsString()
  @IsEnum(StatusEnum)
  status?: string;

  @IsOptional()
  @IsString()
  @Length(0, 100)
  roleId?: string;
}

export class AuthUserCancelDto {
  @ApiProperty({
    required: true,
  })
  @IsNumber()
  roleId: number;

  @ApiProperty({
    required: true,
  })
  @IsNumber()
  userId: number;
}

export class AuthUserCancelAllDto {
  @ApiProperty({
    required: true,
  })
  @IsNumber()
  roleId: number;

  @ApiProperty({
    required: true,
  })
  @IsString()
  userIds: string;
}

export class AuthUserSelectAllDto {
  @ApiProperty({
    required: true,
  })
  @IsNumber()
  roleId: number;

  @ApiProperty({
    required: true,
  })
  @IsString()
  userIds: string;
}
