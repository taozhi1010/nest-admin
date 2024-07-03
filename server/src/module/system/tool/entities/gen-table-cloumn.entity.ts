import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from 'src/common/entities/base';

@Entity('gen_table_column', {
  comment: '代码生成业务表字段',
})
export class GenTableColumnEntity extends BaseEntity {
  @ApiProperty({ type: Number, description: '编号' })
  @PrimaryGeneratedColumn({ type: 'int', name: 'column_id', comment: '编号' })
  public columnId: number;

  @ApiProperty({ type: Number, description: '归属表编号' })
  @Column({ type: 'int', name: 'table_id', comment: '归属表编号' })
  public tableId: number;

  @ApiProperty({ type: String, description: '列名称' })
  @Column({ type: 'varchar', name: 'column_name', length: 200, comment: '列名称' })
  public columnName: string;

  @ApiProperty({ type: String, description: '列描述' })
  @Column({ type: 'varchar', name: 'column_comment', length: 500, comment: '列描述' })
  public columnComment: string;

  @ApiProperty({ type: String, description: '列类型' })
  @Column({ type: 'varchar', name: 'column_type', length: 100, comment: '列类型' })
  public columnType: string;

  @ApiProperty({ type: String, description: 'JAVA类型' })
  @Column({ type: 'varchar', name: 'java_type', length: 500, comment: 'JAVA类型' })
  public javaType: string;

  @ApiProperty({ type: String, description: 'JAVA字段名' })
  @Column({ type: 'varchar', name: 'java_field', length: 200, comment: 'JAVA字段名' })
  public javaField: string;

  @ApiProperty({ type: String, description: '是否主键（1是）' })
  @Column({ type: 'char', name: 'is_pk', default: '0', length: 1, comment: '是否主键（1是）' })
  public isPk: string;

  @ApiProperty({ type: String, description: '是否自增（1是）' })
  @Column({ type: 'char', name: 'is_increment', default: '0', length: 1, comment: '是否自增（1是）' })
  public isIncrement: string;

  @ApiProperty({ type: String, description: '是否必填（1是）' })
  @Column({ type: 'char', name: 'is_required', default: '0', length: 1, comment: '是否必填（1是）' })
  public isRequired: string;

  @ApiProperty({ type: String, description: '是否为插入字段（1是）' })
  @Column({ type: 'char', name: 'is_insert', default: '0', length: 1, comment: '是否为插入字段（1是）' })
  public isInsert: string;

  @ApiProperty({ type: String, description: '是否编辑字段（1是）' })
  @Column({ type: 'char', name: 'is_edit', default: '0', length: 1, comment: '是否编辑字段（1是）' })
  public isEdit: string;

  @ApiProperty({ type: String, description: '是否列表字段（1是）' })
  @Column({ type: 'char', name: 'is_list', default: '0', length: 1, comment: '是否列表字段（1是）' })
  public isList: string;

  @ApiProperty({ type: String, description: '是否查询字段（1是）' })
  @Column({ type: 'char', name: 'is_query', length: 1, default: '1', comment: '是否查询字段（1是）' })
  public isQuery: string;

  @ApiProperty({ type: String, description: '查询方式（等于、不等于、大于、小于、范围）' })
  @Column({ type: 'varchar', name: 'query_type', length: 200, default: 'EQ', comment: '查询方式（等于、不等于、大于、小于、范围）' })
  public queryType: string;

  @ApiProperty({ type: String, description: '显示类型（文本框、文本域、下拉框、复选框、单选框、日期控件）' })
  @Column({ type: 'varchar', name: 'html_type', length: 200, default: '', comment: '显示类型（文本框、文本域、下拉框、复选框、单选框、日期控件）' })
  public htmlType: string;

  @ApiProperty({ type: String, description: '字典类型' })
  @Column({ type: 'varchar', name: 'dict_type', length: 200, default: '', comment: '字典类型' })
  public dictType: string;

  @ApiProperty({ type: Number, description: '排序' })
  @Column({ type: 'int', name: 'sort', comment: '排序' })
  public sort: number;
}
