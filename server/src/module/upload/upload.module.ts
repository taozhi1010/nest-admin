import { Global, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { StorageAdapter } from './adapter/storage.adapter'
import { SysUploadEntity } from './entities/upload.entity'
import { CosStorageService } from './service/cos-storage.service'
import { LocalStorageService } from './service/local-storage.service'
import { UploadController } from './upload.controller'
import { UploadService } from './upload.service'

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([SysUploadEntity])],
  controllers: [UploadController],
  providers: [UploadService, LocalStorageService, CosStorageService, StorageAdapter],
  exports: [UploadService],
})
export class UploadModule {}
