import { Injectable, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Redis } from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisService {
  private redisClient: Redis;

  constructor(
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
    @Inject(ConfigService)
    private config: ConfigService,
  ) {
    this.redisClient = new Redis({
      port: this.config.get('redis.port'),
      host: this.config.get('redis.host'),
      password: this.config.get('redis.password'),
    });
  }

  /**
   * redis基本信息
   * @returns
   */
  async getInfo() {
    // 连接到 Redis 服务器
    const rawInfo = await this.redisClient.info();
    // 按行分割字符串
    const lines = rawInfo.split('\r\n');
    const parsedInfo = {};
    // 遍历每一行并分割键值对
    lines.forEach((line) => {
      const [key, value] = line.split(':');
      parsedInfo[key?.trim()] = value?.trim();
    });
    return parsedInfo;
  }

  /**
   * 分页查询缓存数据
   * @param data
   * @returns
   */
  async skipFind(data: { key: string; pageSize: number; pageNum: number }) {
    const rawInfo = await this.redisClient.lrange(data.key, (data.pageNum - 1) * data.pageSize, data.pageNum * data.pageSize);
    return rawInfo;
  }
  /**
   * 缓存Key数量
   * @returns
   */
  async getDbSize() {
    return await this.redisClient.dbsize();
  }

  /**
   * 命令统计
   * @returns
   */
  async commandStats() {
    const rawInfo = await this.redisClient.info('commandstats');
    // 按行分割字符串
    const lines = rawInfo.split('\r\n');
    const commandStats = [];
    // 遍历每一行并分割键值对
    lines.forEach((line) => {
      const [key, value] = line.split(':');
      if (key && value) {
        commandStats.push({
          name: key?.trim()?.replaceAll('cmdstat_', ''),
          value: +value?.trim()?.split(',')[0]?.split('=')[1],
        });
      }
    });
    return commandStats;
  }

  /**
   * 存储字符串
   * @param key
   * @param value
   * @param ttl
   */
  set(key: string, value: string, ttl?: number) {
    return this.cacheManager.set(key, value, ttl);
  }

  /**
   * 获取字符串
   * @param key
   */
  async get(key: any): Promise<any> {
    return this.cacheManager.get(key);
  }

  /**
   * 删除字符串
   * @param key
   */
  async del(key: any): Promise<any> {
    return this.cacheManager.del(key);
  }

  /**
   * 存储对象
   * @param key
   * @param value
   * @param ttl
   */
  storeSet(key: string, value: any, ttl?: number) {
    this.cacheManager.store.set(key, value, ttl);
  }

  /**
   * 获取对象
   * @param key
   */
  async storeGet(key: string): Promise<any[]> {
    return await this.cacheManager.store.get(key);
  }

  /**
   * 获取对象keys
   * @param key
   */
  async storeKeys(key?: string) {
    return await this.cacheManager.store.keys(key);
  }

  /**
   * 删除对象
   * @param key
   */
  async storeDel(key: string) {
    return this.cacheManager.store.del(key);
  }

  /**
   * 批量删除对象
   * @param key
   */
  async storeMDel(keys: string[]) {
    return this.cacheManager.store.mdel(...keys);
  }

  /**
   * 批量获取对象
   * @param key
   */
  async storeMGet(keys: string[]) {
    return this.cacheManager.store.mget(...keys);
  }

  /**
   * 清除全部
   * @param key
   */
  async storeReset() {
    return this.cacheManager.store.reset();
  }
}
