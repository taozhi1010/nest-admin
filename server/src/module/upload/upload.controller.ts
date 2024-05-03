import { Controller, Get, Post, Body, Query, UploadedFile, UseInterceptors, HttpCode } from '@nestjs/common';
import { UploadService } from './upload.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBody, ApiQuery } from '@nestjs/swagger';
import { ChunkFileDto, ChunkMergeFileDto, FileUploadDto, uploadIdDto } from './dto/index';

@ApiTags('通用-文件上传')
@Controller('common/upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  /**
   * 文件上传
   * @param file
   * @returns
   */
  @ApiOperation({
    summary: '文件上传',
  })
  @ApiBody({
    type: FileUploadDto,
    required: true,
  })
  @HttpCode(200)
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  singleFileUpload(@UploadedFile() file: Express.Multer.File) {
    return this.uploadService.singleFileUpload(file);
  }

  /**
   * 获取切片上传任务Id
   * @param file
   * @returns
   */
  @ApiOperation({
    summary: '获取切片上传任务Id',
  })
  @ApiBody({
    required: true,
  })
  @HttpCode(200)
  @Get('/chunk/uploadId')
  getChunkUploadId() {
    return this.uploadService.getChunkUploadId();
  }

  /**
   * 文件分片上传
   * @param file
   * @returns
   */
  @ApiOperation({
    summary: '文件切片上传',
  })
  @ApiBody({
    required: true,
  })
  @HttpCode(200)
  @Post('/chunk')
  @UseInterceptors(FileInterceptor('file'))
  chunkFileUpload(@UploadedFile() file: Express.Multer.File, @Body() body: ChunkFileDto) {
    return this.uploadService.chunkFileUpload(file, body);
  }

  /**
   * 文件分片合并
   * @returns
   */
  @ApiOperation({
    summary: '合并切片',
  })
  @ApiBody({
    type: ChunkMergeFileDto,
    required: true,
  })
  @HttpCode(200)
  @Post('/chunk/merge')
  chunkMergeFile(@Body() body: ChunkMergeFileDto) {
    return this.uploadService.chunkMergeFile(body);
  }

  /**
   * 获取切片上传任务结果
   * @param file
   * @returns
   *
   */
  @ApiOperation({
    summary: '获取切片上传结果',
  })
  @ApiQuery({
    type: uploadIdDto,
    required: true,
  })
  @HttpCode(200)
  @Get('/chunk/result')
  getChunkUploadResult(@Query() query: { uploadId: string }) {
    return this.uploadService.getChunkUploadResult(query.uploadId);
  }

  /**
   * 获取cos授权
   * @param query
   */
  @ApiOperation({
    summary: '获取cos上传密钥',
  })
  @ApiBody({
    required: true,
  })
  @Get('/cos/authorization')
  getAuthorization(@Query() query: { key: string }) {
    return this.uploadService.getAuthorization(query.key);
  }
}
