import { IsString, IsNumberString, IsEnum, IsPhoneNumber, Min, Length, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class OnlineListDto {
  @ApiProperty({ required: false })
  @IsNumberString()
  pageNum: number;

  @ApiProperty({ required: false })
  @IsNumberString()
  pageSize: number;
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
}
