import { requestClient } from '#/api/request';
import type { CacheNameItem, CacheValueItem } from './model';

export interface CommandStats {
  name: string;
  value: string;
}

export interface RedisInfo {
  [key: string]: string;
}

export interface CacheInfo {
  commandStats: CommandStats[];
  dbSize: number;
  info: RedisInfo;
}

/**
 *
 * @returns redis信息
 */
export function redisCacheInfo() {
  return requestClient.get<CacheInfo>('/monitor/cache');
}

/**
 * 删除缓存
 */
export function deleteCacheName(cacheName: string) {
  return requestClient.delete(`/monitor/cache/clearCacheName/${cacheName}`);
}

/**
 * 删除缓存
 */
export function deleteCacheKey(cacheKey: string) {
  return requestClient.delete(`/monitor/cache/clearCacheKey/${cacheKey}`);
}

/**
 * 清空所有缓存
 */
export function clearAllCache() {
  return requestClient.delete('/monitor/cache/clearCacheAll');
}

// 获取缓存名称列表
export function getCacheNames() {
  return requestClient.get<CacheNameItem[]>('/monitor/cache/getNames');
}

// 获取缓存键名列表
export function getCacheKeys(cacheName: string) {
  return requestClient.get<string[]>(`/monitor/cache/getKeys/${cacheName}`);
}

// 获取缓存值
export function getCacheValue(cacheName: string, cacheKey: string) {
  return requestClient.get<CacheValueItem>(`/monitor/cache/getValue/${cacheName}/${cacheKey}`);
}
