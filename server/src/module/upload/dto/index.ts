import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Matches, Min } from 'class-validator';

/**
 * 存储路径约束：仅允许字母数字、下划线、中划线、斜杠，阻断空路径与 ../ 路径穿越
 */
const PATH_PATTERN = /^[a-zA-Z0-9_/-]{1,50}$/;

/**
 * 文件名约束：禁止路径分隔符与特殊字符（Windows 非法字符集），中文不受影响
 */
const FILE_NAME_PATTERN = /^[^\\/:*?"<>|]{1,255}$/;

/**
 * 上传任务 Id 约束：服务端 GenerateUUID 生成的是去掉连字符的 32 位十六进制串
 */
const UPLOAD_ID_PATTERN = /^[a-fA-F0-9]{32}$/;

/** multipart 表单里的空字符串统一转为 undefined，让 @IsOptional 生效 */
const emptyToUndefined = ({ value }) => (typeof value === 'string' && value.trim() === '' ? undefined : value);

export class FileUploadDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;

  @ApiProperty({
    type: 'string',
    required: false,
    description: '文件存储路径（如：avatar、article、document），缺省时服务端落到 uploads 目录',
  })
  @IsOptional()
  @Transform(emptyToUndefined)
  @Matches(PATH_PATTERN, { message: 'path 仅允许字母数字、下划线、中划线、斜杠，长度 1-50' })
  path: string;
}
export class UploadIdDto {
  @ApiProperty({ type: 'string', description: '分片上传任务 Id（32 位十六进制）' })
  @Matches(UPLOAD_ID_PATTERN, { message: 'uploadId 非法' })
  uploadId: string;
}
export class ChunkFileDto {
  @ApiProperty({ type: 'number' })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  index: number;
  @ApiProperty({ type: 'number' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  totalChunks: number;
  @ApiProperty({ type: 'string', description: '分片上传任务 Id（32 位十六进制）' })
  @Matches(UPLOAD_ID_PATTERN, { message: 'uploadId 非法' })
  uploadId: string;
  @ApiProperty({ type: 'string' })
  @Matches(FILE_NAME_PATTERN, { message: 'fileName 不能包含路径分隔符或特殊字符' })
  fileName: string;
  @ApiProperty({
    type: 'string',
    required: false,
    description: '文件存储路径（如：avatar、article、document），缺省时服务端落到 uploads 目录',
  })
  @IsOptional()
  @Transform(emptyToUndefined)
  @Matches(PATH_PATTERN, { message: 'path 仅允许字母数字、下划线、中划线、斜杠，长度 1-50' })
  path: string;
}

export class ChunkMergeFileDto {
  @ApiProperty({ type: 'string', description: '分片上传任务 Id（32 位十六进制）' })
  @Matches(UPLOAD_ID_PATTERN, { message: 'uploadId 非法' })
  uploadId: string;
  @ApiProperty({ type: 'string' })
  @Matches(FILE_NAME_PATTERN, { message: 'fileName 不能包含路径分隔符或特殊字符' })
  fileName: string;
  @ApiProperty({
    type: 'string',
    required: false,
    description: '文件存储路径（如：avatar、article、document），缺省时服务端落到 uploads 目录',
  })
  @IsOptional()
  @Transform(emptyToUndefined)
  @Matches(PATH_PATTERN, { message: 'path 仅允许字母数字、下划线、中划线、斜杠，长度 1-50' })
  path: string;
}

export class CosAuthorizationDto {
  @ApiProperty({ type: 'string', description: 'COS 对象键' })
  @IsString()
  @Matches(/^[^\\]{1,255}$/, { message: 'key 非法' })
  key: string;
}
