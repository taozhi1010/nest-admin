import { Module } from '@nestjs/common'
import { SSEController } from './sse.controller'
import { SSEService } from './sse.service'

@Module({
  controllers: [SSEController],
  providers: [SSEService],
})
export class SSEModule {}
