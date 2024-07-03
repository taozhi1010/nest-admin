import { IsString, IsJSON, IsEnum, IsPhoneNumber, IsArray, Min, Length, IsOptional, IsBoolean, IsNumber, IsNumberString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PagingDto } from 'src/common/dto/index';
import { genTableCloumnUpdate } from './create-genTableCloumn-dto';
export class CreateGenTableDto {
  @ApiProperty({ type: String, description: '表名称' })
  public tableName: string;

  @ApiProperty({ type: String, description: '表描述' })
  public tableComment: string;

  @ApiProperty({ type: String, description: '实体类名称' })
  public className: string;

  @ApiProperty({ type: String, description: '生成包路径' })
  public packageName: string;

  @ApiProperty({ type: String, description: '生成模块名' })
  public moduleName: string;

  @ApiProperty({ type: String, description: '生成业务名' })
  public businessName: string;

  @ApiProperty({ type: String, description: '生成功能名' })
  public functionName: string;

  @ApiProperty({ type: String, description: '生成功能作者' })
  public functionAuthor: string;

  @ApiProperty({ type: String, description: '创建人' })
  public createBy: string;
}

export class UpdateGenTableDto extends CreateGenTableDto {
  @ApiProperty({ type: Number, description: '编号' })
  public tableId: number;
}
export class GenDbTableList extends PagingDto {
  @IsString()
  @IsOptional()
  tableName?: string;
  @IsString()
  @IsOptional()
  tableComment?: string;
}

export class TableName {
  @ApiProperty({
    required: true,
  })
  @IsString()
  tableNames: string;
}
export class TableId {
  @ApiProperty({
    required: true,
  })
  @IsString()
  tableIds: string;
}

export class GenTableList extends PagingDto {
  @IsString()
  @IsOptional()
  tableNames?: string;
  @IsOptional()
  @IsString()
  tableComment?: string;
}

export class GenTableUpdate {
  @ApiProperty({
    required: true,
  })
  @IsOptional()
  tableId: number;
  @IsOptional()
  @IsString()
  tableName?: string;
  @IsOptional()
  @IsString()
  tableComment?: string;
  @IsOptional()
  @IsString()
  className?: string;
  @IsOptional()
  @IsString()
  functionAuthor?: string;
  @IsOptional()
  @IsString()
  remark?: string;
  @IsOptional()
  @IsString()
  tplCategory?: string;
  @IsOptional()
  @IsString()
  packageName?: string;
  @IsOptional()
  @IsString()
  moduleName?: string;
  @IsOptional()
  @IsString()
  businessName?: string;
  @IsOptional()
  @IsString()
  functionName?: string;
  @IsOptional()
  @IsString()
  genType?: string;
  @IsOptional()
  columns?: genTableCloumnUpdate[];
  @IsString()
  tplWebType?: string;
}
