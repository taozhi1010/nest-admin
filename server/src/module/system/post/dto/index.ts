import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsNumber, IsOptional, IsString, Length } from 'class-validator'
import { PagingDto } from 'src/common/dto/index'

export enum StatusEnum {
  STATIC = '0',
  DYNAMIC = '1',
}

export class CreatePostDto {
  @IsString()
  @Length(0, 50)
  postName: string

  @IsString()
  @Length(0, 64)
  postCode: string

  @ApiProperty({ required: true })
  @IsOptional()
  @IsNumber()
  deptId: number

  @IsOptional()
  @IsString()
  @IsEnum(StatusEnum)
  status?: string

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  remark?: string

  @ApiProperty({ required: true })
  @IsOptional()
  @IsNumber()
  postSort?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  postCategory?: string
}

export class UpdatePostDto extends CreatePostDto {
  @ApiProperty({
    required: true,
  })
  @IsNumber()
  postId: number
}

export class ListPostDto extends PagingDto {
  @IsOptional()
  @IsString()
  @Length(0, 50)
  postName?: string

  @IsOptional()
  @IsString()
  belongDeptId?: string

  @IsOptional()
  @IsString()
  @Length(0, 64)
  postCode?: string

  @IsOptional()
  @IsString()
  @IsEnum(StatusEnum)
  status?: string
}
