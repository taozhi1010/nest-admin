import { Injectable, OnModuleInit } from '@nestjs/common';
import * as Minio from 'minio';
import { ConfigService } from '@nestjs/config';
import { IFileStorage, UploadResult } from './interfaces/file-storage.interface';

/**
 * MinIO 文件存储实现
 */
@Injectable()
export class MinioFileStorage implements IFileStorage, OnModuleInit {
  private minioClient: Minio.Client;
  private bucketName: string;
  private serveRoot: string;

  constructor(private configService: ConfigService) {
    // 创建 MinIO 客户端
    this.minioClient = new Minio.Client({
      endPoint: this.configService.get<string>('minio.endPoint'),
      port: this.configService.get<number>('minio.port'),
      useSSL: this.configService.get<boolean>('minio.useSSL'),
      accessKey: this.configService.get<string>('minio.accessKey'),
      secretKey: this.configService.get<string>('minio.secretKey'),
      region: this.configService.get<string>('minio.region', 'us-east-1'),
    });

    this.bucketName = this.configService.get<string>('minio.bucket');
    this.serveRoot = this.configService.get<string>('app.file.serveRoot', '/profile');
  }

  /**
   * 模块初始化时自动设置存储桶策略
   */
  async onModuleInit() {
    try {
      await this.initialize();
      console.log(`✅ MinIO 文件存储初始化完成，存储桶: ${this.bucketName}`);
    } catch (error) {
      console.error('❌ MinIO 文件存储初始化失败:', error.message);
    }
  }

  /**
   * 确保存储桶存在并设置为公开访问
   */
  async initialize(): Promise<void> {
    const exists = await this.minioClient.bucketExists(this.bucketName);
    if (!exists) {
      await this.minioClient.makeBucket(this.bucketName, this.configService.get<string>('minio.region', 'us-east-1'));
      console.log(`✅ MinIO 存储桶 '${this.bucketName}' 已创建`);
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
    await this.minioClient.setBucketPolicy(this.bucketName, JSON.stringify(policy));
  }

  /**
   * 上传文件到 MinIO
   */
  async uploadFile(buffer: Buffer, fileName: string, contentType: string): Promise<UploadResult> {
    await this.initialize();

    // 上传文件
    await this.minioClient.putObject(this.bucketName, fileName, buffer, buffer.length, { 'Content-Type': contentType });

    // 返回相对路径，用于后端代理访问
    const url = `${this.serveRoot}/${this.bucketName}/${fileName}`;

    return {
      fileName: fileName,
      newFileName: fileName,
      url: url,
    };
  }

  /**
   * 删除文件
   */
  async deleteFile(fileName: string): Promise<void> {
    await this.minioClient.removeObject(this.bucketName, fileName);
  }

  /**
   * 检查文件是否存在
   */
  async fileExists(fileName: string): Promise<boolean> {
    try {
      await this.minioClient.statObject(this.bucketName, fileName);
      return true;
    } catch {
      return false;
    }
  }
}
