import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MinioFileStorage } from './minio-file-storage.service';
import { LocalFileStorage } from './local-file-storage.service';
import { RustFSFileStorage } from './rustfs-file-storage.service';
import { FileStorageFactory } from './file-storage.factory';

/**
 * 文件存储模块
 * 统一管理所有文件存储驱动
 */
@Module({
  imports: [ConfigModule],
  providers: [MinioFileStorage, LocalFileStorage, RustFSFileStorage, FileStorageFactory],
  exports: [FileStorageFactory],
})
export class FileStorageModule {}
