import { Module, Global } from '@nestjs/common';
import { RedisModule } from './redis/redis.module';
import { AxiosModule } from './axios/axios.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisClientOptions } from '@songkeys/nestjs-redis';

@Global()
@Module({
  imports: [
    RedisModule.forRootAsync(
      {
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => {
          const redisConfig = config.get<RedisClientOptions>('db.redis');
          return {
            closeClient: true,
            readyLog: true,
            errorLog: true,
            config: redisConfig,
          };
        },
      },
      true,
    ),

    AxiosModule,
  ],
})
export class CommonModule {}
