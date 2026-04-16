import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IFileStorage, UploadResult } from './interfaces/file-storage.interface';
import { MinioFileStorage } from './minio-file-storage.service';
import { LocalFileStorage } from './local-file-storage.service';
import { RustFSFileStorage } from './rustfs-file-storage.service';

/**
 * 文件存储工厂服务
 * 根据配置动态选择对应的存储驱动
 */
@Injectable()
export class FileStorageFactory {
  private storage: IFileStorage;
  private storageType: string;

  constructor(
    private configService: ConfigService,
    private minioStorage: MinioFileStorage,
    private localStorage: LocalFileStorage,
    private rustfsStorage: RustFSFileStorage,
  ) {
    this.storageType = this.configService.get<string>('app.file.storageType') || 'local';
    this.storage = this.getStorageInstance();
  }

  /**
   * 根据配置获取存储实例
   */
  private getStorageInstance(): IFileStorage {
    switch (this.storageType) {
      case 'minio':
        console.log('📦 使用 MinIO 文件存储');
        return this.minioStorage;
      case 'rustfs':
        console.log('📦 使用 RustFS 文件存储');
        return this.rustfsStorage;
      case 'local':
        console.log('📦 使用本地文件存储');
        return this.localStorage;
      default:
        throw new Error(`不支持的文件存储类型: ${this.storageType}。支持的类型: minio, rustfs, local`);
    }
  }

  /**
   * 上传文件（代理到具体存储实现）
   */
  async uploadFile(buffer: Buffer, fileName: string, contentType: string): Promise<UploadResult> {
    return this.storage.uploadFile(buffer, fileName, contentType);
  }

  /**
   * 删除文件（代理到具体存储实现）
   */
  async deleteFile(fileName: string): Promise<void> {
    return this.storage.deleteFile(fileName);
  }

  /**
   * 检查文件是否存在（代理到具体存储实现）
   */
  async fileExists(fileName: string): Promise<boolean> {
    if (this.storage.fileExists) {
      return this.storage.fileExists(fileName);
    }
    return false;
  }

  /**
   * 获取当前存储类型
   */
  getStorageType(): string {
    return this.storageType;
  }
}
