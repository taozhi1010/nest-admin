import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
	RedisModule as LibRedisModule,
	RedisService as LibRedisService,
} from '@liaoliaots/nestjs-redis';
import { RedisService } from './redis.service';
import { MemoryRedisAdapter } from './memory-redis.adapter';

@Global()
@Module({
	imports: [
		ConfigModule,
		LibRedisModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => {
				const redisMode = configService.get<string>('redis.mode', 'host');

				// 如果是内存模式，不需要连接真实Redis
				if (redisMode === 'memory') {
					return {
						config: [], // 空配置，不连接Redis
					};
				}

				// host模式，连接真实Redis
				return {
					config: {
						host: configService.get<string>('redis.host', 'localhost'),
						port: configService.get<number>('redis.port', 6379),
						password: configService.get<string>('redis.password'),
						db: configService.get<number>('redis.db', 0),
						keyPrefix: configService.get<string>('redis.keyPrefix', ''),
					},
				};
			},
		}),
	],
	providers: [
		MemoryRedisAdapter,
		{
			provide: 'REDIS_SERVICE',
			inject: [LibRedisService, ConfigService],
			useFactory: (libRedisService: LibRedisService, configService: ConfigService) => {
				const redisMode = configService.get<string>('redis.mode', 'host');
				return redisMode === 'memory' ? null : libRedisService;
			},
		},
		RedisService,
	],
	exports: [RedisService, MemoryRedisAdapter],
})
export class RedisModule {}
