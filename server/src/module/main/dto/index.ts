import { IsString, IsJSON, IsEnum, IsPhoneNumber, Min, IsOptional, IsBoolean, IsNumber, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum StatusEnum {
  STATIC = '0',
  DYNAMIC = '1',
}

export class LoginDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString({ message: '验证码必须是字符串' })
  code?: string;

  @ApiProperty({
    required: true,
  })
  @IsString({ message: '账号必须是字符串' })
  @MinLength(2, { message: '账号长度必须为 2 到 50 个字符' })
  @MaxLength(50, { message: '账号长度必须为 2 到 50 个字符' })
  username: string;

  @ApiProperty({
    required: true,
  })
  @IsString({ message: '密码必须是字符串' })
  @MinLength(5, { message: '密码长度必须为 5 到 20 个字符' })
  @MaxLength(20, { message: '密码长度必须为 5 到 20 个字符' })
  password: string;

  @ApiProperty({
    required: true,
  })
  @IsOptional()
  @IsString({ message: 'uuid 必须是字符串' })
  uuid?: string;
}

export class RegisterDto extends LoginDto {}
