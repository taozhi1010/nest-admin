import { Module } from '@nestjs/common';
import { MainService } from './main.service';
import { MainController } from './main.controller';

@Module({
  controllers: [MainController],
  providers: [MainService],
})
export class MainModule {}
