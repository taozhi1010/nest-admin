import { Global, Module } from '@nestjs/common'
import { AxiosModule } from './axios/axios.module'
import { RedisModule } from './redis/redis.module'

@Global()
@Module({
  imports: [RedisModule, AxiosModule],
})
export class CommonModule {}
