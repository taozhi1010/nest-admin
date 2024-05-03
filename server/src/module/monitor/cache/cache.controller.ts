import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiConsumes, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { CacheService } from './cache.service';

@ApiTags('缓存管理')
@Controller('monitor/cache')
export class CacheController {
  constructor(private readonly cacheService: CacheService) {}
  @ApiOperation({
    summary: '缓存监控信息',
  })
  @Get()
  getInfo() {
    return this.cacheService.getInfo();
  }

  @ApiOperation({
    summary: '缓存列表',
  })
  @Get('/getNames')
  getNames() {
    return this.cacheService.getNames();
  }

  @ApiOperation({
    summary: '键名列表',
  })
  @Get('/getKeys/:id')
  getKeys(@Param('id') id: string) {
    return this.cacheService.getKeys(id);
  }

  @ApiOperation({
    summary: '缓存内容',
  })
  @Get('/getValue/:cacheName/:cacheKey')
  getValue(@Param() params: string[]) {
    return this.cacheService.getValue(params);
  }

  @ApiOperation({
    summary: '清理缓存名称',
  })
  @Delete('/clearCacheName/:cacheName')
  clearCacheName(@Param('cacheName') cacheName: string) {
    return this.cacheService.clearCacheName(cacheName);
  }

  @ApiOperation({
    summary: '清理缓存键名',
  })
  @Delete('/clearCacheKey/:cacheKey')
  clearCacheKey(@Param('cacheKey') cacheKey: string) {
    return this.cacheService.clearCacheKey(cacheKey);
  }

  @ApiOperation({
    summary: '清理全部',
  })
  @Delete('/clearCacheAll')
  clearCacheAll() {
    return this.cacheService.clearCacheAll();
  }
}
