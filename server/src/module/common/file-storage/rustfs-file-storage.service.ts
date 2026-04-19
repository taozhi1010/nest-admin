import { Injectable } from '@nestjs/common';
import * as Minio from 'minio'; // RustFS 兼容 S3 API，可以使用 MinIO 客户端
import { ConfigService } from '@nestjs/config';
import { IFileStorage, UploadResult } from './interfaces/file-storage.interface';
import Mime from 'mime-types';

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
