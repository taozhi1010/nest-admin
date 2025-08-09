import { Inject } from '@nestjs/common';
import { RedisService } from 'src/module/common/redis/redis.service';
import { paramsKeyFormat, paramsKeyGet } from '../utils/decorator';

export function CacheEvict(CACHE_NAME: string, CACHE_KEY: string) {
	const injectRedis = Inject(RedisService);

	return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
		injectRedis(target, 'redis');

		const originMethod = descriptor.value;

		descriptor.value = async function (...args: any[]) {
			const key = paramsKeyFormat(originMethod, CACHE_KEY, args);

			if (key === '*') {
				const sets = await this.redis.sMembers(`${CACHE_NAME}SET`);
				await this.redis.del(sets);
				await this.redis.del(`${CACHE_NAME}SET`);
			} else if (key !== null) {
				await this.redis.sRemove(`${CACHE_NAME}SET`, key);
				await this.redis.del(`${CACHE_NAME}${key}`);
			} else {
				await this.redis.sRemove(`${CACHE_NAME}SET`, CACHE_KEY);
				await this.redis.del(`${CACHE_NAME}${CACHE_KEY}`);
			}

			return await originMethod.apply(this, args);
		};
	};
}

export function Cacheable(CACHE_NAME: string, CACHE_KEY: string, CACHE_EXPIRESIN?: number) {
	const injectRedis = Inject(RedisService);

	return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
		injectRedis(target, 'redis');

		const originMethod = descriptor.value;

		descriptor.value = async function (...args: any[]) {
			const key = paramsKeyFormat(originMethod, CACHE_KEY, args);

			if (key === null) {
				return await originMethod.apply(this, args);
			}

			const cacheResult = await this.redis.get(`${CACHE_NAME}${key}`);

			if (!cacheResult) {
				const result = await originMethod.apply(this, args);

				if (!result) {
					return result;
				}

				await this.redis.sAdd(`${CACHE_NAME}SET`, `${CACHE_NAME}${key}`);
				await this.redis.set(`${CACHE_NAME}${key}`, result, CACHE_EXPIRESIN);

				return result;
			}

			return cacheResult;
		};
	};
}

export function CacheRefresh(CACHE_NAME: string, CACHE_KEY: string, CACHE_EXPIRESIN?: number) {
	const injectRedis = Inject(RedisService);

	return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
		injectRedis(target, 'redis');

		const originMethod = descriptor.value;

		descriptor.value = async function (...args: any[]) {
			const key = paramsKeyFormat(originMethod, CACHE_KEY, args);

			if (key === null) {
				return await originMethod.apply(this, args);
			}

			const result = await originMethod.apply(this, args);

			if (!result) {
				return result;
			}

			await this.redis.sAdd(`${CACHE_NAME}SET`, `${CACHE_NAME}${key}`);
			await this.redis.set(`${CACHE_NAME}${key}`, result, CACHE_EXPIRESIN);

			return result;
		};
	};
}

export function CacheList(CACHE_NAME: string, CACHE_KEY: string, CACHE_EXPIRESIN?: number) {
	const injectRedis = Inject(RedisService);

	return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
		injectRedis(target, 'redis');

		const originMethod = descriptor.value;

		descriptor.value = async function (...args: any[]) {
			const result: any[] = await originMethod.apply(this, args);

			if (!result || result.length === 0 || !Array.isArray(result)) {
				return result;
			}

			const list = result
				.map(item => {
					const key = paramsKeyGet(CACHE_KEY, item);
					return [key, item];
				})
				.filter(item => item[0] !== null);

			await this.redis.sAdd(
				`${CACHE_NAME}SET`,
				list.map(([key]) => `${CACHE_NAME}${key}`)
			);
			await this.redis.mset(list.map(([key, value]) => [`${CACHE_NAME}${key}`, value]));

			return result;
		};
	};
}
