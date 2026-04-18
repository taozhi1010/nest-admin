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
          // 动态读取 config 中的 redis 配置
          const redisConfig = config.get<any>('redis');
          return {
            closeClient: true,
            readyLog: true,
            errorLog: true,
            config: {
              ...redisConfig,
              // ioredis 连接保活配置
              retryStrategy: (times: number) => {
                const delay = Math.min(times * 100, 3000);
                console.log(`[Redis] 连接断开，第 ${times} 次重连，延迟 ${delay}ms`);
                return delay;
              },
              enableOfflineQueue: true,
              connectTimeout: 10000, // 连接超时 10 秒
              // 发送心跳保持连接活跃
              keepAlive: 5000, // 每 5 秒发送一次心跳
            },
          };
        },
      },
      true,
    ),

    AxiosModule,
  ],
})
export class CommonModule {}
