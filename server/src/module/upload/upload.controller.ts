import { Controller, Get, Post, Body, Query, UploadedFile, UseInterceptors, HttpCode } from '@nestjs/common';
import { UploadService } from './upload.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBody, ApiQuery } from '@nestjs/swagger';
import { ChunkFileDto, ChunkMergeFileDto, CosAuthorizationDto, FileUploadDto, UploadIdDto } from './dto/index';
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
  async singleFileUpload(@UploadedFile() file: Express.Multer.File, @Body() body: FileUploadDto, @User() user?: UserDto) {
    // path 已由 FileUploadDto 校验（可选，缺省时服务端落到 uploads 目录）
    const customPath = body.path;

    // 从用户信息中获取作者名（如果有登录用户）
    const authorName = user?.user?.nickName || user?.user?.userName;

    const res = await this.uploadService.singleFileUpload(file, customPath, authorName);
    // 服务层校验失败（如超限）时返回的是失败信封，直接透传，避免 ok() 把失败包进外层成功
    if (res?.code && res.code !== 200) {
      return res;
    }
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
    // uploadId/fileName/path 均已由 ChunkMergeFileDto 校验
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
    type: UploadIdDto,
    required: true,
  })
  @HttpCode(200)
  @Get('/chunk/result')
  getChunkUploadResult(@Query() query: UploadIdDto) {
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
  getAuthorization(@Query() query: CosAuthorizationDto) {
    return this.uploadService.getAuthorization(query.key);
  }
}
