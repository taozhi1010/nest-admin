import { IsString, IsJSON, IsEnum, IsPhoneNumber, Min, Length, IsOptional, IsBoolean, IsNumber, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum StatusEnum {
  STATIC = '0',
  DYNAMIC = '1',
}
export class CreateGameAricleDto {
  @ApiProperty({
    required: true,
  })
  @IsNumber()
  parentId: number;

  @ApiProperty({
    required: true,
  })
  @IsString()
  @Length(0, 30)
  deptName: string;

  @ApiProperty({
    required: true,
  })
  @IsNumber()
  @Min(0)
  orderNum: number;
}

export class UpdateGameAricleDto extends CreateGameAricleDto {
  @ApiProperty({
    required: false,
  })
  @IsNumber()
  deptId: number;
}

export class ListGameAricleDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  deptName?: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsEnum(StatusEnum)
  status?: string;
}
