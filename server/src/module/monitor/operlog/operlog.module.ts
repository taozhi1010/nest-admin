import { Module } from '@nestjs/common';
import { OperlogService } from './operlog.service';
import { OperlogController } from './operlog.controller';

@Module({
  controllers: [OperlogController],
  providers: [OperlogService],
})
export class OperlogModule {}
