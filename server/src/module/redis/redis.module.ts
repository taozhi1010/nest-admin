import { Module, Global } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { RedisService } from './redis.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-ioredis-yet';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        redis: `redis://:${config.get('redis.password')}@${config.get('redis.host')}:${config.get('redis.port')}/2`,
      }),
      inject: [ConfigService],
      isGlobal: true,
    }),
  ],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}

// TODO 优先推荐下面的写法，如报错 ReplyError: NOAUTH Authentication required. 用上面的
// @Global()
// @Module({
//   imports: [
//     CacheModule.registerAsync({
//       imports: [ConfigModule],
//       useFactory: async (config: ConfigService) => ({
//         store: redisStore,
//         port: config.get('redis.port'),
//         host: config.get('redis.host'),
//         auth_pass: config.get('redis.password'),
//         db: config.get('redis.db'),
//         ttl: 1000 * 60 * 60 * 24 * 30,
//       }),
//       inject: [ConfigService],
//       isGlobal: true,
//     }),
//   ],
//   providers: [RedisService],
//   exports: [RedisService],
// })
// export class RedisModule {}
