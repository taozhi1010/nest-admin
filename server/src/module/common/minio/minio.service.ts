import { Injectable } from '@nestjs/common';
import * as Minio from 'minio';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MinioService {
  private minioClient: Minio.Client;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    // 创建 MinIO 客户端
    this.minioClient = new Minio.Client({
      endPoint: this.configService.get<string>('minio.endPoint'),
      port: this.configService.get<number>('minio.port'),
      useSSL: this.configService.get<boolean>('minio.useSSL'),
      accessKey: this.configService.get<string>('minio.accessKey'),
      secretKey: this.configService.get<string>('minio.secretKey'),
      // 添加 region 配置，避免签名错误
      region: this.configService.get<string>('minio.region', 'us-east-1'),
    });

    this.bucketName = this.configService.get<string>('minio.bucket');
  }

  /**
   * 确保存储桶存在（如果不存在就创建）
   */
  async ensureBucketExists(): Promise<void> {
    const exists = await this.minioClient.bucketExists(this.bucketName);
    if (!exists) {
      await this.minioClient.makeBucket(this.bucketName, this.configService.get<string>('minio.region', 'us-east-1'));
      console.log(`✅ MinIO 存储桶 '${this.bucketName}' 已创建`);
    }
  }

  /**
   * 上传文件到 MinIO
   * @param buffer 文件数据
   * @param fileName 文件名
   * @param contentType 文件类型
   * @returns 文件的相对路径（用于代理访问）
   */
  async uploadFile(buffer: Buffer, fileName: string, contentType: string): Promise<string> {
    await this.ensureBucketExists();

    // 上传文件
    await this.minioClient.putObject(this.bucketName, fileName, buffer, buffer.length, { 'Content-Type': contentType });

    // 返回相对路径，例如: /profile/avatars/avatar_123.png
    const serveRoot = this.configService.get<string>('app.file.serveRoot', '/profile');
    return `${serveRoot}/${this.bucketName}/${fileName}`;
  }

  /**
   * 删除文件
   * @param fileName 文件名
   */
  async deleteFile(fileName: string): Promise<void> {
    await this.minioClient.removeObject(this.bucketName, fileName);
  }
}
