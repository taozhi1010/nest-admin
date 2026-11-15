import { Module, Global } from '@nestjs/common';
import { RedisModule } from './redis/redis.module';
import { AxiosModule } from './axios/axios.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisClientOptions } from '@songkeys/nestjs-redis';
import { DatabaseHealthService } from './database/database-health.service';
import { MailService } from './mail/mail.service';

@Global()
@Module({
  imports: [
    RedisModule.forRootAsync(
      {
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => {
          // Read scalar values explicitly. Some adapter versions silently fall
          // back to localhost when a nested config object is passed through.
          const redisConfig = {
            host: config.get<string>('redis.host'),
            port: config.get<number>('redis.port', 6379),
            password: config.get<string>('redis.password'),
            db: config.get<number>('redis.db', 0),
          };
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
              // Do not leave requests pending forever when Redis is unavailable.
              enableOfflineQueue: false,
              // The configured endpoint is an IPv4 address. Explicitly avoid
              // Node's dual-stack connection path on some Windows hosts.
              family: 4,
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
  providers: [DatabaseHealthService, MailService],
  exports: [MailService],
})
export class CommonModule {}
