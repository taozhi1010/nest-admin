import { Entity, Column, PrimaryColumn } from 'typeorm';
import { BaseEntity } from 'src/common/entities/base';

@Entity('sys_upload', {
  comment: '文件上传记录',
})
export class SysUploadEntity extends BaseEntity {
  @PrimaryColumn({ type: 'varchar', name: 'upload_id', comment: '任务Id' })
  uploadId: string;

  @Column({
    type: 'int',
    comment: '文件大小',
    name: 'size',
  })
  size: number;

  @Column({
    type: 'varchar',
    comment: '文件路径',
    name: 'file_name',
  })
  fileName: string;

  @Column({
    type: 'varchar',
    comment: '文件名',
    name: 'new_file_name',
  })
  newFileName: string;

  @Column({
    type: 'varchar',
    comment: '文件地址',
    name: 'url',
  })
  url: string;

  @Column({
    type: 'varchar',
    comment: '拓展名',
    nullable: true,
    name: 'ext',
  })
  ext: string;
}
