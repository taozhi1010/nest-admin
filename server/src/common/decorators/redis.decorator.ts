import { Inject } from '@nestjs/common';
import { RedisService } from 'src/module/common/redis/redis.service';
import { paramsKeyFormat } from '../utils/decorator';

export function CacheEvict(CACHE_NAME: string, CACHE_KEY: string) {
  const injectRedis = Inject(RedisService);

  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    injectRedis(target, 'redis');

    const originMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const key = paramsKeyFormat(originMethod, CACHE_KEY, args);

      if (key === '*') {
        const res = await this.redis.keys(`${CACHE_NAME}*`);
        if (res.length) {
          await this.redis.del(res);
        }
      } else if (key !== null) {
        await this.redis.del(`${CACHE_NAME}${key}`);
      } else {
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

        await this.redis.set(`${CACHE_NAME}${key}`, result, CACHE_EXPIRESIN);

        return result;
      }

      return cacheResult;
    };
  };
}
