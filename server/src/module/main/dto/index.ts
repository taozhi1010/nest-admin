import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator'

export enum StatusEnum {
  STATIC = '0',
  DYNAMIC = '1',
}

export class LoginDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  code?: string

  @ApiProperty({
    required: true,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(10)
  username: string

  @ApiProperty({
    required: true,
  })
  @IsString()
  @MinLength(5)
  @MaxLength(20)
  password: string

  @ApiProperty({
    required: true,
  })
  @IsOptional()
  @IsString()
  uuid?: string
}

export class RegisterDto extends LoginDto {}
