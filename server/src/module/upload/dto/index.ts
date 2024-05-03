import { ApiProperty } from '@nestjs/swagger';

export class FileUploadDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;
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
}

export class ChunkMergeFileDto {
  @ApiProperty({ type: 'string' })
  uploadId: string;
  @ApiProperty({ type: 'string' })
  fileName: string;
}
