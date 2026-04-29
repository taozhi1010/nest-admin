import { ApiProperty } from '@nestjs/swagger';

export class FileUploadDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;

  @ApiProperty({
    type: 'string',
    required: true,
    description: '文件存储路径（如：avatar、article、document），不能为空',
  })
  path: string;
}
export class uploadIdDto {
  @ApiProperty({ type: 'string' })
  uploadId: string;
}
export class ChunkFileDto {
  @ApiProperty({ type: 'string' })
  index: number;
  @ApiProperty({ type: 'string' })
  totalChunks: number;
  @ApiProperty({ type: 'string' })
  uploadId: string;
  @ApiProperty({ type: 'string' })
  fileName: string;
  @ApiProperty({
    type: 'string',
    required: true,
    description: '文件存储路径（如：avatar、article、document），不能为空',
  })
  path: string;
}

export class ChunkMergeFileDto {
  @ApiProperty({ type: 'string' })
  uploadId: string;
  @ApiProperty({ type: 'string' })
  fileName: string;
  @ApiProperty({
    type: 'string',
    required: true,
    description: '文件存储路径（如：avatar、article、document），不能为空',
  })
  path: string;
}
