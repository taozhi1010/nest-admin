import { IsString, IsJSON, IsEnum, IsPhoneNumber, Min, Length, IsOptional, IsBoolean, IsNumber, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PagingDto } from 'src/common/dto/index';

export enum StatusEnum {
  STATIC = '0',
  DYNAMIC = '1',
}
export class CreateGameAricleDto {
  @ApiProperty({
    required: true,
  })
  @IsString()
  @Length(0, 50)
  title: string;

  @ApiProperty({
    required: true,
  })
  @IsString()
  @Length(0, 50)
  desc: string;

  @ApiProperty({
    required: true,
  })
  @IsOptional()
  @IsString()
  @IsEnum(StatusEnum)
  status?: string;
}

export class UpdateGameAricleDto extends CreateGameAricleDto {
  @ApiProperty({
    required: false,
  })
  @IsNumber()
  articleId: number;
}

export class ListGameAricleDto extends PagingDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsEnum(StatusEnum)
  status?: string;
}
