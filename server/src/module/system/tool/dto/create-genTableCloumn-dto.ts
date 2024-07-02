import { IsString, IsJSON, IsEnum, IsPhoneNumber, IsArray, Min, Length, IsOptional, IsBoolean, IsNumber, IsNumberString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PagingDto } from 'src/common/dto/index';

export class CreateGenTableCloumnDto {
  @ApiProperty({ type: Number, description: '归属表编号' })
  public tableId: number;

  @ApiProperty({ type: String, description: '创建人' })
  public createBy: string;

  @ApiProperty({ type: String, description: '列类型' })
  public columnType: string;

  @ApiProperty({ type: String, description: '列描述' })
  public columnComment: string;

  @ApiProperty({ type: String, description: '列名称' })
  public columnName: string;

  @ApiProperty({ type: String, description: 'JAVA字段名' })
  public javaField: string;

  @ApiProperty({ type: String, description: 'JAVA类型' })
  public javaType: string;

  @ApiProperty({ type: String, description: '查询方式（等于、不等于、大于、小于、范围）' })
  public queryType: string;

  @ApiProperty({ type: String, description: '是否为插入字段（1是）' })
  public isInsert: string;
  @ApiProperty({ type: String, description: '显示类型（文本框、文本域、下拉框、复选框、单选框、日期控件）' })
  public htmlType: string;
  @ApiProperty({ type: String, description: '是否编辑字段（1是）' })
  public isEdit: string;
  @ApiProperty({ type: String, description: '是否列表字段（1是）' })
  public isList: string;
  @ApiProperty({ type: String, description: '是否查询字段（1是）' })
  public isQuery: string;
  @ApiProperty({ type: String, description: '是否主键（1是）' })
  public isPk: string;
  @ApiProperty({ type: String, description: '是否自增（1是）' })
  public isIncrement: string;
  @ApiProperty({ type: String, description: '是否必填（1是）' })
  public isRequired: string;
}

export class genTableCloumnUpdate {
  @ApiProperty({
    required: true,
  })
  @IsOptional()
  @IsNumber()
  columnId:number;
  @IsOptional()
  @IsString()
  columnComment?:string;
  @IsOptional()
  @IsString()
  javaType?:string;
  @IsOptional()
  @IsString()
  javaField?:string;
  @IsOptional()
  @IsString()
  isInsert?:string;
  @IsOptional()
  @IsString()
  isEdit?:string;
  @IsOptional()
  @IsString()
  isList?:string;
  @IsOptional()
  @IsString()
  isQuery?:string;
  @IsOptional()
  @IsString()
  queryType?:string;
  @IsOptional()
  @IsString()
  isRequired?:string;
  @IsOptional()
  @IsString()
  htmlType?:string;
  @IsOptional()
  @IsString()
  dictType?:string;
}