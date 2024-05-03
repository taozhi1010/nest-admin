import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { SysUploadEntity } from './entities/upload.entity';
@Module({
  imports: [TypeOrmModule.forFeature([SysUploadEntity])],
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}
