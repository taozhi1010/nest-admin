import { Module } from '@nestjs/common';
import { OnlineService } from './online.service';
import { OnlineController } from './online.controller';

@Module({
  controllers: [OnlineController],
  providers: [OnlineService],
})
export class OnlineModule {}
