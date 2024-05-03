import { Module } from '@nestjs/common';
import { ServerService } from './server.service';
import { ServerController } from './server.controller';

@Module({
  controllers: [ServerController],
  providers: [ServerService],
})
export class ServerModule {}
