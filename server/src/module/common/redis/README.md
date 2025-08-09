# Redis适配器

这个Redis适配器支持两种模式：

1. **内存模式** (`memory`) - 在内存中模拟Redis操作，无需连接真实Redis服务器
2. **远程服务器模式** (`host`) - 连接到真实的Redis服务器

## 配置

在 `config.yml` 中配置Redis模式：

```yaml
redis:
  # Redis模式：host-连接远程Redis服务器，memory-使用内存模拟Redis
  mode: memory  # 或 host
  host: localhost
  password: '*********'
  port: 6379
  db: 2
  keyPrefix: ''
```

## 功能特性

### 内存模式特性
- ✅ 完全在内存中运行，无需外部Redis服务器
- ✅ 支持所有常用Redis操作（String、Hash、List、Set）
- ✅ 支持TTL（过期时间）
- ✅ 自动清理过期键
- ✅ 与远程Redis模式相同的API
- ✅ 适用于开发环境和测试

### 远程服务器模式特性
- ✅ 连接真实Redis服务器
- ✅ 完整的Redis功能支持
- ✅ 适用于生产环境

## 支持的操作

### String操作
- `set(key, value, ttl?)` - 设置键值对
- `get(key)` - 获取值
- `mset(data)` - 批量设置
- `mget(keys)` - 批量获取
- `del(keys)` - 删除键
- `ttl(key)` - 获取过期时间
- `keys(pattern)` - 获取匹配的键

### Hash操作
- `hset(key, field, value)` - 设置hash字段
- `hmset(key, data, expire?)` - 批量设置hash字段
- `hget(key, field)` - 获取hash字段
- `hGetAll(key)` - 获取所有hash字段
- `hvals(key)` - 获取所有hash值
- `hdel(key, fields)` - 删除hash字段

### List操作
- `lLeftPush(key, ...values)` - 从左侧推入
- `lRightPush(key, ...values)` - 从右侧推入
- `lLength(key)` - 获取列表长度
- `lRange(key, start, stop)` - 获取范围数据
- `lLeftPop(key)` - 从左侧弹出
- `lRightPop(key)` - 从右侧弹出
- `lTrim(key, start, stop)` - 修剪列表

### Set操作
- `sAdd(key, ...members)` - 添加集合元素
- `sRemove(key, ...members)` - 移除集合元素
- `sIsMember(key, member)` - 检查元素是否存在
- `sMembers(key)` - 获取所有元素
- `sCard(key)` - 获取集合大小
- `sPop(key)` - 随机移除元素
- `sRandMember(key, count)` - 随机获取元素

## 使用示例

```typescript
import { Injectable } from '@nestjs/common'
import { RedisService } from './redis.service'

@Injectable()
export class MyService {
  constructor(private readonly redisService: RedisService) {}

  async example() {
    // 检查当前模式
    const isMemoryMode = this.redisService.isUsingMemoryMode()
    console.log('当前模式:', isMemoryMode ? '内存模式' : '远程服务器模式')

    // String操作
    await this.redisService.set('user:1', { name: '张三', age: 25 })
    const user = await this.redisService.get('user:1')
    
    // Hash操作
    await this.redisService.hmset('profile:1', {
      name: '李四',
      email: 'lisi@example.com'
    })
    
    // List操作
    await this.redisService.lLeftPush('queue', 'task1', 'task2')
    const tasks = await this.redisService.lRange('queue', 0, -1)
    
    // Set操作
    await this.redisService.sAdd('tags', 'javascript', 'nodejs')
    const allTags = await this.redisService.sMembers('tags')
  }
}
```

## 模式切换

只需要修改配置文件中的 `redis.mode` 即可：

- `mode: memory` - 使用内存模式
- `mode: host` - 使用远程Redis服务器

无需修改任何业务代码，API完全一致。

## 注意事项

1. **内存模式数据持久性**：内存模式的数据在应用重启后会丢失
2. **性能差异**：内存模式通常比远程Redis更快，但受限于应用内存
3. **功能支持**：内存模式支持大部分常用Redis操作，但可能不支持一些高级特性
4. **生产环境**：建议生产环境使用远程Redis服务器模式
5. **开发环境**：开发环境可以使用内存模式，简化环境配置 