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
          // 动态读取config中的redis
          let redisConfig = {};
          if (process.env.NODE_ENV === 'development') {
            redisConfig = {
              host: '111.229.29.214',
              password: 'redis_kjkikp_6379',
              port: 6379,
              db: 2,
              keyPrefix: '',
            };
          } else {
            redisConfig = config.get<RedisClientOptions>('redis');
          }
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
