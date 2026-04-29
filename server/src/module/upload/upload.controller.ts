import { Controller, Get, Post, Body, Query, UploadedFile, UseInterceptors, HttpCode, Req } from '@nestjs/common';
import { UploadService } from './upload.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBody, ApiQuery } from '@nestjs/swagger';
import { ChunkFileDto, ChunkMergeFileDto, FileUploadDto, uploadIdDto } from './dto/index';
import { ResultData } from 'src/common/utils/result';
import { User, UserDto } from 'src/module/system/user/user.decorator';

@ApiTags('通用-文件上传')
@Controller('common/upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  /**
   * 文件上传
   * @param file
   * @param body
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
  async singleFileUpload(@UploadedFile() file: Express.Multer.File, @Req() req: any, @User() user?: UserDto) {
    // 从请求体中获取 path 参数（multipart/form-data 中的表单字段）
    const customPath = req.body?.path;

    // 验证 path 参数
    if (!customPath || !customPath.trim()) {
      return ResultData.fail(400, '文件存储路径不能为空，请提供有效的 path 参数');
    }

    // 从用户信息中获取作者名（如果有登录用户）
    const authorName = user?.user?.nickName || user?.user?.userName;

    const res = await this.uploadService.singleFileUpload(file, customPath, authorName);
    return ResultData.ok(res);
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
   * @param body
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
   * @param body
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
    // 验证 path 参数
    if (!body.path || !body.path.trim()) {
      return ResultData.fail(400, '文件存储路径不能为空，请提供有效的 path 参数');
    }

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
