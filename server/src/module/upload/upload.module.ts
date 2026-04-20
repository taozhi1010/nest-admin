import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { SysUploadEntity } from './entities/upload.entity';
import { FileStorageModule } from '../common/file-storage/file-storage.module';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([SysUploadEntity]), FileStorageModule],
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}
