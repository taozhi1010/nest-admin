import { Injectable } from '@nestjs/common';
import * as Minio from 'minio'; // RustFS 兼容 S3 API，可以使用 MinIO 客户端
import { ConfigService } from '@nestjs/config';
import { IFileStorage, UploadResult } from './interfaces/file-storage.interface';

/**
 * RustFS 文件存储实现（预留，待 RustFS 正式可用后启用）
 *
 * TODO: RustFS 正式上线并集成到 1Panel 后的兼容性处理
 * - 等待 RustFS 发布正式开源版本
 * - 确认 RustFS 在 1Panel 中的部署方式和 API 端点
 * - 验证 S3 API 兼容性，可能需要调整客户端配置
 * - 测试存储桶策略设置是否符合 RustFS 规范
 * - 更新配置文件中的默认连接参数
 * - 补充完整的错误处理和日志记录
 *
 * 当前实现基于 RustFS 官方声明的 "100% 兼容 S3 API"，使用 MinIO 客户端直接连接。
 * 正式上线后需要根据实际 API 文档进行适配调整。
 */
@Injectable()
export class RustFSFileStorage implements IFileStorage {
  private rustfsClient: Minio.Client;
  private bucketName: string;
  private serveRoot: string;

  constructor(private configService: ConfigService) {
    // TODO: RustFS 正式上线后，根据实际 API 文档确认以下配置项
    // 当前基于 S3 兼容性的假设配置，可能需要调整
    this.rustfsClient = new Minio.Client({
      endPoint: this.configService.get<string>('rustfs.endPoint', '127.0.0.1'),
      port: this.configService.get<number>('rustfs.port', 9000),
      useSSL: this.configService.get<boolean>('rustfs.useSSL', false),
      accessKey: this.configService.get<string>('rustfs.accessKey', ''),
      secretKey: this.configService.get<string>('rustfs.secretKey', ''),
      region: this.configService.get<string>('rustfs.region', 'us-east-1'),
    });

    this.bucketName = this.configService.get<string>('rustfs.bucket', 'avatars');
    this.serveRoot = this.configService.get<string>('app.file.serveRoot', '/profile');
  }

  /**
   * 初始化存储桶
   *
   * TODO: RustFS 正式上线后需要验证：
   * 1. bucketExists、makeBucket API 是否完全兼容
   * 2. setBucketPolicy 的策略格式是否需要调整
   * 3. 公开访问策略的配置方式是否与 MinIO 一致
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
    }
  }

  /**
   * 上传文件到 RustFS
   *
   * TODO: RustFS 正式上线后需要验证：
   * 1. putObject API 的参数和返回值是否完全兼容
   * 2. 文件大小限制、分片上传等特性是否需要特殊处理
   * 3. Content-Type 设置是否正确生效
   */
  async uploadFile(buffer: Buffer, fileName: string, contentType: string): Promise<UploadResult> {
    await this.initialize();

    // 上传文件
    await this.rustfsClient.putObject(this.bucketName, fileName, buffer, buffer.length, { 'Content-Type': contentType });

    // 返回相对路径
    const url = `${this.serveRoot}/${this.bucketName}/${fileName}`;

    return {
      fileName: fileName,
      newFileName: fileName,
      url: url,
    };
  }

  /**
   * 删除文件
   *
   * TODO: RustFS 正式上线后需要验证 removeObject API 的兼容性
   */
  async deleteFile(fileName: string): Promise<void> {
    await this.rustfsClient.removeObject(this.bucketName, fileName);
  }

  /**
   * 检查文件是否存在
   *
   * TODO: RustFS 正式上线后需要验证 statObject API 的兼容性
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
