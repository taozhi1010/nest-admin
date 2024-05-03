import { IsString, IsJSON, IsEnum, IsPhoneNumber, Min, Length, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PagingDto } from 'src/common/dto/index';

export enum StatusEnum {
  STATIC = '0',
  DYNAMIC = '1',
}

export class CreateLoginlogDto {
  @IsOptional()
  @IsString()
  @Length(0, 128)
  ipaddr?: string;

  @IsOptional()
  @IsString()
  @Length(0, 50)
  userName?: string;

  @IsOptional()
  @IsString()
  @Length(0, 255)
  loginLocation?: string;

  @IsOptional()
  @IsString()
  @Length(0, 50)
  browser?: string;

  @IsOptional()
  @IsString()
  @Length(0, 50)
  os?: string;

  @IsOptional()
  @IsString()
  @Length(0, 255)
  msg?: string;

  @IsOptional()
  @IsString()
  @IsEnum(StatusEnum)
  status?: string;
}

export class UpdateLoginlogDto extends CreateLoginlogDto {
  @IsNumber()
  infoId: number;
}

export class ListLoginlogDto extends PagingDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(0, 128)
  ipaddr?: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(0, 50)
  userName?: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsEnum(StatusEnum)
  status?: string;
}
