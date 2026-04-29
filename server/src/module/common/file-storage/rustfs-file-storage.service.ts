import { Injectable, OnModuleInit } from '@nestjs/common';
import * as Minio from 'minio'; // RustFS 兼容 S3 API，可以使用 MinIO 客户端
import { ConfigService } from '@nestjs/config';
import { IFileStorage, UploadResult } from './interfaces/file-storage.interface';

/**
 * RustFS 文件存储实现
 * RustFS 100% 兼容 S3 API，因此可以直接使用 MinIO 客户端连接
 */
@Injectable()
export class RustFSFileStorage implements IFileStorage, OnModuleInit {
  private rustfsClient: Minio.Client;
  private bucketName: string;
  private serveRoot: string;

  constructor(private configService: ConfigService) {
    this.rustfsClient = new Minio.Client({
      endPoint: this.configService.get<string>('rustfs.endPoint', '127.0.0.1'),
      port: this.configService.get<number>('rustfs.port', 9000),
      useSSL: this.configService.get<boolean>('rustfs.useSSL', false),
      accessKey: this.configService.get<string>('rustfs.accessKey', ''),
      secretKey: this.configService.get<string>('rustfs.secretKey', ''),
      region: this.configService.get<string>('rustfs.region', 'us-east-1'),
    });

    this.bucketName = this.configService.get<string>('rustfs.bucket', 'nest-admin');
    this.serveRoot = this.configService.get<string>('app.file.serveRoot', '/profile');
  }

  /**
   * 模块初始化时自动设置存储桶策略
   */
  async onModuleInit() {
    try {
      await this.initialize();
      console.log(`✅ RustFS 文件存储初始化完成，存储桶: ${this.bucketName}`);
    } catch (error) {
      console.error('❌ RustFS 文件存储初始化失败:', error.message);
    }
  }

  /**
   * 确保存储桶存在并设置为公开访问
   */
  async initialize(): Promise<void> {
    try {
      const exists = await this.rustfsClient.bucketExists(this.bucketName);
      if (!exists) {
        await this.rustfsClient.makeBucket(this.bucketName, this.configService.get<string>('rustfs.region', 'us-east-1'));
        console.log(`✅ RustFS 存储桶 '${this.bucketName}' 已创建`);
      }

      // 设置公开访问策略
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Sid: 'PublicRead',
            Effect: 'Allow',
            Principal: '*',
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${this.bucketName}/*`],
          },
        ],
      };
      await this.rustfsClient.setBucketPolicy(this.bucketName, JSON.stringify(policy));
      console.log(`✅ RustFS 存储桶 '${this.bucketName}' 已设置为公开访问`);
    } catch (error) {
      console.error('❌ RustFS 初始化失败:', error.message);
      throw error;
    }
  }

  /**
   * 上传文件到 RustFS
   * @param buffer 文件二进制数据
   * @param fileName 文件名
   * @param contentType 文件 MIME 类型
   * @param customPath 自定义存储路径（必填）
   * @param authorName 作者名称（可选，用于生成文件名）
   */
  async uploadFile(buffer: Buffer, fileName: string, contentType: string, customPath: string, authorName?: string): Promise<UploadResult> {
    await this.initialize();

    // 验证 path 参数
    if (!customPath || !customPath.trim()) {
      throw new Error('文件存储路径不能为空');
    }

    // 处理文件名：添加时间戳和作者名
    const processedFileName = this.getNewFileName(fileName, authorName);

    // 清理路径，防止路径遍历攻击
    const safePath = customPath.replace(/\.\./g, '').replace(/^\/+|\/+$/g, '');
    // 构建对象键：路径 + 文件名
    const objectKey = `${safePath}/${processedFileName}`;

    // 上传文件
    await this.rustfsClient.putObject(this.bucketName, objectKey, buffer, buffer.length, { 'Content-Type': contentType });

    // 返回相对路径
    const url = `${this.serveRoot}/${this.bucketName}/${objectKey}`;

    return {
      fileName: objectKey,
      newFileName: processedFileName,
      url: url,
    };
  }

  /**
   * 生成新的文件名
   * @param originalname 原始文件名
   * @param authorName 作者名称（可选）
   * @returns 带时间戳和作者名的新文件名
   */
  private getNewFileName(originalname: string, authorName?: string): string {
    if (!originalname) {
      return originalname;
    }

    // 分离文件名和扩展名
    const lastDotIndex = originalname.lastIndexOf('.');
    let fileName = originalname;
    let ext = '';
    if (lastDotIndex > 0) {
      fileName = originalname.substring(0, lastDotIndex);
      ext = originalname.substring(lastDotIndex);
    }

    // 检查文件名是否已经包含时间戳
    const timestampRegex = /_\d{13}$/;

    // 构建新文件名：原名_时间戳_作者名
    const timestamp = new Date().getTime();
    if (authorName) {
      // 清理作者名中的特殊字符，只保留字母、数字、中文、下划线
      const safeAuthorName = authorName.replace(/[^a-zA-Z0-9\u4e00-\u9fa5_]/g, '_');
      if (!timestampRegex.test(fileName)) {
        fileName = `${fileName}_${timestamp}_${safeAuthorName}`;
      } else {
        // 如果已有时间戳，在时间戳后添加作者名
        fileName = fileName.replace(/(\d{13})$/, `$1_${safeAuthorName}`);
      }
    } else {
      // 没有作者名，只添加时间戳
      if (!timestampRegex.test(fileName)) {
        fileName = `${fileName}_${timestamp}`;
      }
    }

    return fileName + ext;
  }

  /**
   * 删除文件
   */
  async deleteFile(fileName: string): Promise<void> {
    await this.rustfsClient.removeObject(this.bucketName, fileName);
  }

  /**
   * 检查文件是否存在
   */
  async fileExists(fileName: string): Promise<boolean> {
    try {
      await this.rustfsClient.statObject(this.bucketName, fileName);
      return true;
    } catch {
      return false;
    }
  }
}
