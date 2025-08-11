import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SysNoticeEntity } from './entities/notice.entity'
import { NoticeController } from './notice.controller'
import { NoticeService } from './notice.service'

@Module({
  imports: [TypeOrmModule.forFeature([SysNoticeEntity])],
  controllers: [NoticeController],
  providers: [NoticeService],
})
export class NoticeModule {}
