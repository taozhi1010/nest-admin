import { Module } from '@nestjs/common'
import { CacheController } from './cache.controller'
import { CacheService } from './cache.service'

@Module({
  controllers: [CacheController],
  providers: [CacheService],
})
export class CacheModule {}
