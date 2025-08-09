export interface CacheListItem {
  cacheName: string;
  cacheKey: string;
  cacheValue: string;
}

export interface CacheListResult {
  rows: CacheListItem[];
  total: number;
}

export interface CacheListParams {
  cacheName?: string;
  cacheKey?: string;
  pageNum?: number;
  pageSize?: number;
}

export interface CacheNameItem {
  cacheName: string;
  cacheKey: string;
  cacheValue: string;
  remark: string;
}

export interface CacheValueItem {
  cacheName: string;
  cacheKey: string;
  cacheValue: string;
  remark: string;
} 