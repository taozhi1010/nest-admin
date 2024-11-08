import { Inject } from '@nestjs/common';
import { get } from 'lodash';
import { RedisService } from 'src/module/redis/redis.service';

function getArgs(func) {
  const funcString = func.toString();
  return funcString.slice(funcString.indexOf('(') + 1, funcString.indexOf(')')).match(/([^\s,]+)/g);
}

const stringFormat = (str: string, callback: (key: string) => string): string => {
  return str.replace(/\{([^}]+)\}/g, (word, key) => callback(key));
};

export function CacheEvict(CACHE_NAME: string, CACHE_KEY: string, ALL_ENTRIES?: boolean) {
  const injectRedis = Inject(RedisService);

  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    injectRedis(target, 'redis');

    const originMethod = descriptor.value;

    const originMethodArgs = getArgs(originMethod);

    descriptor.value = async function (...args: any[]) {
      const paramsMap = {};

      originMethodArgs.forEach((arg, index) => {
        paramsMap[arg] = args[index];
      });

      let isNotGet = false;
      const key = stringFormat(CACHE_KEY, (key) => {
        const str = get(paramsMap, key);
        if (!str) isNotGet = true;
        return str;
      });

      if (ALL_ENTRIES) {
        await this.redis.del(await this.redis.keys(`${CACHE_NAME}*`));
      } else if (!isNotGet && key) {
        await this.redis.del(`${CACHE_NAME}${key}`);
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

    const originMethodArgs = getArgs(originMethod);

    descriptor.value = async function (...args: any[]) {
      const paramsMap = {};

      originMethodArgs.forEach((arg, index) => {
        paramsMap[arg] = args[index];
      });

      let isNotGet = false;
      const key = stringFormat(CACHE_KEY, (key) => {
        const str = get(paramsMap, key);
        if (!str) isNotGet = true;
        return str;
      });

      if (!key || isNotGet) {
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
