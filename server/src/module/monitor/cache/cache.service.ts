import { Injectable } from '@nestjs/common';
import { RedisService } from 'src/module/redis/redis.service';
import { CacheEnum } from 'src/common/enum/index';
import { DeepClone } from 'src/common/utils/index';
import { ResultData } from 'src/common/utils/result';

@Injectable()
export class CacheService {
  constructor(private readonly redisService: RedisService) {}

  private readonly caches = [
    {
      cacheName: 'login_tokens:',
      cacheKey: '',
      cacheValue: '',
      remark: '用户信息',
    },
    {
      cacheName: 'sys_config:',
      cacheKey: '',
      cacheValue: '',
      remark: '配置信息',
    },
    {
      cacheName: 'sys_dict:',
      cacheKey: '',
      cacheValue: '',
      remark: '数据字典',
    },
    {
      cacheName: 'captcha_codes:',
      cacheKey: '',
      cacheValue: '',
      remark: '验证码',
    },
    {
      cacheName: 'repeat_submit:',
      cacheKey: '',
      cacheValue: '',
      remark: '防重提交',
    },
    {
      cacheName: 'rate_limit:',
      cacheKey: '',
      cacheValue: '',
      remark: '限流处理',
    },
    {
      cacheName: 'pwd_err_cnt:',
      cacheKey: '',
      cacheValue: '',
      remark: '密码错误次数',
    },
  ];

  async getNames() {
    return ResultData.ok(this.caches);
  }

  async getKeys(id: string) {
    const data = await this.redisService.keys(id + '*');
    return ResultData.ok(data);
  }

  async clearCacheKey(id: string) {
    const data = await this.redisService.del(id);
    return ResultData.ok(data);
  }

  async clearCacheName(id: string) {
    const keys = await this.redisService.keys(id + '*');
    const data = await this.redisService.del(keys);
    return ResultData.ok(data);
  }

  async clearCacheAll() {
    const data = await this.redisService.reset();
    return ResultData.ok(data);
  }

  async getValue(params) {
    const list = DeepClone(this.caches);
    const data = list.find((item) => item.cacheName === params.cacheName);
    const cacheValue = await this.redisService.get(params.cacheKey);
    data.cacheValue = JSON.stringify(cacheValue);
    data.cacheKey = params.cacheKey;
    return ResultData.ok(data);
  }

  /**
   * 缓存监控
   * @returns
   */
  async getInfo() {
    const info = await this.redisService.getInfo();
    const dbSize = await this.redisService.getDbSize();
    const commandStats = await this.redisService.commandStats();
    return ResultData.ok({
      dbSize: dbSize,
      info: info,
      commandStats: commandStats,
    });
  }
}
