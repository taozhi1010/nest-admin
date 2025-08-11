import { RedisService as liaoliaoRedisService } from '@liaoliaots/nestjs-redis';
import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { MemoryRedisAdapter } from './memory-redis.adapter';

interface RedisAdapter {
	set(key: string, value: string, px?: number): Promise<'OK' | null>;
	get(key: string): Promise<string | null>;
	mset(...args: string[]): Promise<'OK'>;
	mget(keys: string[]): Promise<(string | null)[]>;
	del(...keys: string[]): Promise<number>;
	ttl(key: string): Promise<number>;
	keys(pattern: string): Promise<string[]>;
	expire(key: string, seconds: number): Promise<number>;
	dbsize(): Promise<number>;
	info(section?: string): Promise<string>;

	// Hash operations
	hset(key: string, field: string, value: string): Promise<number>;
	hmset(key: string, obj: Record<string, string | number | boolean>): Promise<'OK'>;
	hget(key: string, field: string): Promise<string | null>;
	hgetall(key: string): Promise<Record<string, string>>;
	hvals(key: string): Promise<string[]>;
	hkeys(key: string): Promise<string[]>;
	hdel(key: string, ...fields: string[]): Promise<number>;

	// List operations
	lpush(key: string, ...values: string[]): Promise<number>;
	rpush(key: string, ...values: string[]): Promise<number>;
	lpushx(key: string, ...values: string[]): Promise<number>;
	rpushx(key: string, ...values: string[]): Promise<number>;
	llen(key: string): Promise<number>;
	lrange(key: string, start: number, stop: number): Promise<string[]>;
	lindex(key: string, index: number): Promise<string | null>;
	lset(key: string, index: number, value: string): Promise<'OK' | null>;
	lrem(key: string, count: number, value: string): Promise<number>;
	ltrim(key: string, start: number, stop: number): Promise<'OK'>;
	linsert(
		key: string,
		direction: 'BEFORE' | 'AFTER',
		pivot: string,
		value: string
	): Promise<number>;
	blpop(key: string, timeout?: number): Promise<string[]>;
	brpop(key: string, timeout?: number): Promise<string[]>;
	brpoplpush(source: string, destination: string, timeout: number): Promise<string | null>;

	// Set operations
	sadd(key: string, ...members: string[]): Promise<number>;
	srem(key: string, ...members: string[]): Promise<number>;
	sismember(key: string, member: string): Promise<number>;
	smembers(key: string): Promise<string[]>;
	scard(key: string): Promise<number>;
	spop(key: string): Promise<string | null>;
	srandmember(key: string, count?: number): Promise<string[]>;
	sdiff(...keys: string[]): Promise<string[]>;
}

@Injectable()
export class RedisService {
	private adapter: RedisAdapter;
	private isMemoryMode: boolean;

	constructor(
		@Inject('REDIS_SERVICE') private readonly rs: liaoliaoRedisService | null,
		private readonly configService: ConfigService,
		private readonly memoryAdapter: MemoryRedisAdapter
	) {
		const redisMode = this.configService.get<string>('redis.mode', 'host');
		this.isMemoryMode = redisMode === 'memory';

		if (this.isMemoryMode) {
			this.adapter = this.memoryAdapter;
			console.log('✅ Redis服务运行在内存模式');
		} else {
			if (!this.rs) {
				throw new Error('Redis服务未配置，但Redis模式设置为host模式');
			}
			const client = this.rs.getOrThrow();
			this.adapter = this.createRedisClientAdapter(client);
			console.log('✅ Redis服务连接到远程服务器');
		}
	}

	private createRedisClientAdapter(client: Redis): RedisAdapter {
		return {
			// String operations
			async set(key: string, value: string, px?: number) {
				if (!px) return await client.set(key, value);
				return await client.set(key, value, 'PX', px);
			},
			async get(key: string) {
				return await client.get(key);
			},
			async mset(...args: string[]) {
				return await client.mset(...args);
			},
			async mget(keys: string[]) {
				return await client.mget(keys);
			},
			async del(...keys: string[]) {
				return await client.del(...keys);
			},
			async ttl(key: string) {
				return await client.ttl(key);
			},
			async keys(pattern: string) {
				return await client.keys(pattern);
			},
			async expire(key: string, seconds: number) {
				return await client.expire(key, seconds);
			},
			async dbsize() {
				return await client.dbsize();
			},
			async info(section?: string) {
				return await client.info(section);
			},

			// Hash operations
			async hset(key: string, field: string, value: string) {
				return await client.hset(key, field, value);
			},
			async hmset(key: string, obj: Record<string, string | number | boolean>) {
				return await client.hmset(key, obj);
			},
			async hget(key: string, field: string) {
				return await client.hget(key, field);
			},
			async hgetall(key: string) {
				return await client.hgetall(key);
			},
			async hvals(key: string) {
				return await client.hvals(key);
			},
			async hkeys(key: string) {
				return await client.hkeys(key);
			},
			async hdel(key: string, ...fields: string[]) {
				return await client.hdel(key, ...fields);
			},

			// List operations
			async lpush(key: string, ...values: string[]) {
				return await client.lpush(key, ...values);
			},
			async rpush(key: string, ...values: string[]) {
				return await client.rpush(key, ...values);
			},
			async lpushx(key: string, ...values: string[]) {
				return await client.lpushx(key, ...values);
			},
			async rpushx(key: string, ...values: string[]) {
				return await client.rpushx(key, ...values);
			},
			async llen(key: string) {
				return await client.llen(key);
			},
			async lrange(key: string, start: number, stop: number) {
				return await client.lrange(key, start, stop);
			},
			async lindex(key: string, index: number) {
				return await client.lindex(key, index);
			},
			async lset(key: string, index: number, value: string) {
				return await client.lset(key, index, value);
			},
			async lrem(key: string, count: number, value: string) {
				return await client.lrem(key, count, value);
			},
			async ltrim(key: string, start: number, stop: number) {
				return await client.ltrim(key, start, stop);
			},
			async linsert(key: string, direction: 'BEFORE' | 'AFTER', pivot: string, value: string) {
				if (direction === 'BEFORE') {
					return await client.linsert(key, 'BEFORE', pivot, value);
				} else {
					return await client.linsert(key, 'AFTER', pivot, value);
				}
			},
			async blpop(key: string, timeout?: number) {
				const result = await client.blpop(key, timeout || 0);
				return result || [];
			},
			async brpop(key: string, timeout?: number) {
				const result = await client.brpop(key, timeout || 0);
				return result || [];
			},
			async brpoplpush(source: string, destination: string, timeout: number) {
				return await client.brpoplpush(source, destination, timeout);
			},

			// Set operations
			async sadd(key: string, ...members: string[]) {
				return await client.sadd(key, ...members);
			},
			async srem(key: string, ...members: string[]) {
				return await client.srem(key, ...members);
			},
			async sismember(key: string, member: string) {
				return await client.sismember(key, member);
			},
			async smembers(key: string) {
				return await client.smembers(key);
			},
			async scard(key: string) {
				return await client.scard(key);
			},
			async spop(key: string) {
				return await client.spop(key);
			},
			async srandmember(key: string, count: number = 1) {
				return await client.srandmember(key, count);
			},
			async sdiff(...keys: string[]) {
				return await client.sdiff(...keys);
			},
		};
	}

	getClient(): Redis | null {
		return this.isMemoryMode ? null : this.rs?.getOrThrow() || null;
	}

	isUsingMemoryMode(): boolean {
		return this.isMemoryMode;
	}

	/**
	 * redis基本信息
	 * @returns
	 */
	async getInfo() {
		const client = this.rs.getOrThrow();
		// 连接到 Redis 服务器
		const rawInfo = await client.info();
		// 按行分割字符串
		const lines = rawInfo.split('\r\n');
		const parsedInfo = {};
		// 遍历每一行并分割键值对
		lines.forEach(line => {
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
		const rawInfo = await this.adapter.lrange(
			data.key,
			(data.pageNum - 1) * data.pageSize,
			data.pageNum * data.pageSize
		);
		return rawInfo;
	}

	/**
	 * 缓存Key数量
	 * @returns
	 */
	async getDbSize() {
		return await this.adapter.dbsize();
	}

	/**
	 * 命令统计
	 * @returns
	 */
	async commandStats() {
		const rawInfo = await this.adapter.info('commandstats');
		// 按行分割字符串
		const lines = rawInfo.split('\r\n');
		const commandStats = [];
		// 遍历每一行并分割键值对
		lines.forEach(line => {
			const [key, value] = line.split(':');
			if (key && value) {
				commandStats.push({
					name: key?.trim()?.replaceAll('cmdstat_', ''),
					value: +value?.trim()?.split(',')[0]?.split('=')[1] || 0,
				});
			}
		});
		return commandStats;
	}

	/* --------------------- string 相关 -------------------------- */

	/**
	 *
	 * @param key 存储 key 值
	 * @param val key 对应的 val
	 * @param ttl 可选，过期时间，单位 毫秒
	 */
	async set(key: string, val: any, ttl?: number): Promise<'OK' | null> {
		const data = JSON.stringify(val);
		return await this.adapter.set(key, data, ttl);
	}

	async mset(data: Array<[string, any]>, ttl?: number) {
		if (!data || data.length === 0) return null;

		const list = data
			.map(([key, val]) => [key, typeof val === 'string' ? val : JSON.stringify(val)])
			.flat();

		return await this.adapter.mset(...list);
	}

	async mget(keys: string[]): Promise<(any | null)[]> {
		if (!keys || keys.length === 0) return null;
		const list = await this.adapter.mget(keys);
		return list.map(item => (item ? JSON.parse(item) : null));
	}

	/**
	 * 返回对应 value
	 * @param key
	 */
	async get(key: string): Promise<any> {
		if (!key || key === '*') return null;
		const res = await this.adapter.get(key);
		return res ? JSON.parse(res) : null;
	}

	async del(keys: string | string[]): Promise<number> {
		if (!keys || keys === '*') return 0;
		if (typeof keys === 'string') keys = [keys];
		if (keys.length === 0) return 0;
		return await this.adapter.del(...keys);
	}

	async ttl(key: string): Promise<number | null> {
		if (!key) return null;
		return await this.adapter.ttl(key);
	}

	/**
	 * 获取对象keys
	 * @param key
	 */
	async keys(key?: string) {
		return await this.adapter.keys(key || '*');
	}

	/* ----------------------- hash ----------------------- */

	/**
	 * hash 设置 key 下单个 field value
	 * @param key
	 * @param field 属性
	 * @param value 值
	 */
	async hset(key: string, field: string, value: string): Promise<string | number | null> {
		if (!key || !field) return null;
		return await this.adapter.hset(key, field, value);
	}

	/**
	 * hash 设置 key 下多个 field value
	 * @param key
	 * @param data
	 * @params expire 单位 秒
	 */
	async hmset(
		key: string,
		data: Record<string, string | number | boolean>,
		expire?: number
	): Promise<'OK' | any> {
		if (!key || !data) return 'OK';
		const result = await this.adapter.hmset(key, data);
		if (expire) {
			await this.adapter.expire(key, expire);
		}
		return result;
	}

	/**
	 * hash 获取单个 field 的 value
	 * @param key
	 * @param field
	 */
	async hget(key: string, field: string): Promise<number | string | null> {
		if (!key || !field) return null;
		return await this.adapter.hget(key, field);
	}

	/**
	 * hash 获取 key 下所有field 的 value
	 * @param key
	 */
	async hvals(key: string): Promise<string[]> {
		if (!key) return [];
		return await this.adapter.hvals(key);
	}

	async hGetAll(key: string): Promise<Record<string, string>> {
		return await this.adapter.hgetall(key);
	}

	/**
	 * hash 删除 key 下 一个或多个 fields value
	 * @param key
	 * @param fields
	 */
	async hdel(key: string, fields: string | string[]): Promise<string[] | number> {
		if (!key || fields.length === 0) return 0;
		const fieldsArray = Array.isArray(fields) ? fields : [fields];
		return await this.adapter.hdel(key, ...fieldsArray);
	}

	/**
	 * hash 删除 key 下所有 fields value
	 * @param key
	 */
	async hdelAll(key: string): Promise<string[] | number> {
		if (!key) return 0;
		const fields = await this.adapter.hkeys(key);
		if (fields.length === 0) return 0;
		return await this.hdel(key, fields);
	}

	/* -----------   list 相关操作 ------------------ */

	/**
	 * 获取列表长度
	 * @param key
	 */
	async lLength(key: string): Promise<number> {
		if (!key) return 0;
		return await this.adapter.llen(key);
	}

	/**
	 * 通过索引设置列表元素的值
	 * @param key
	 * @param index
	 * @param val
	 */
	async lSet(key: string, index: number, val: string): Promise<'OK' | null> {
		if (!key || index < 0) return null;
		return await this.adapter.lset(key, index, val);
	}

	/**
	 * 通过索引获取 列表中的元素
	 * @param key
	 * @param index
	 */
	async lIndex(key: string, index: number): Promise<string | null> {
		if (!key || index < 0) return null;
		return await this.adapter.lindex(key, index);
	}

	/**
	 * 获取列表指定范围内的元素
	 * @param key
	 * @param start 开始位置， 0 是开始位置
	 * @param stop 结束位置， -1 返回所有
	 */
	async lRange(key: string, start: number, stop: number): Promise<string[] | null> {
		if (!key) return null;
		return await this.adapter.lrange(key, start, stop);
	}

	/**
	 * 将一个或多个值插入到列表头部
	 * @param key
	 * @param val
	 */
	async lLeftPush(key: string, ...val: string[]): Promise<number> {
		if (!key) return 0;
		return await this.adapter.lpush(key, ...val);
	}

	/**
	 * 将一个值或多个值插入到已存在的列表头部
	 * @param key
	 * @param val
	 */
	async lLeftPushIfPresent(key: string, ...val: string[]): Promise<number> {
		if (!key) return 0;
		return await this.adapter.lpushx(key, ...val);
	}

	/**
	 * 如果 pivot 存在，则在 pivot 前面添加
	 * @param key
	 * @param pivot
	 * @param val
	 */
	async lLeftInsert(key: string, pivot: string, val: string): Promise<number> {
		if (!key || !pivot) return 0;
		return await this.adapter.linsert(key, 'BEFORE', pivot, val);
	}

	/**
	 * 如果 pivot 存在，则在 pivot 后面添加
	 * @param key
	 * @param pivot
	 * @param val
	 */
	async lRightInsert(key: string, pivot: string, val: string): Promise<number> {
		if (!key || !pivot) return 0;
		return await this.adapter.linsert(key, 'AFTER', pivot, val);
	}

	/**
	 * 在列表中添加一个或多个值
	 * @param key
	 * @param val
	 */
	async lRightPush(key: string, ...val: string[]): Promise<number> {
		if (!key) return 0;
		return await this.adapter.rpush(key, ...val);
	}

	/**
	 * 为已存在的列表添加一个或多个值
	 * @param key
	 * @param val
	 */
	async lRightPushIfPresent(key: string, ...val: string[]): Promise<number> {
		if (!key) return 0;
		return await this.adapter.rpushx(key, ...val);
	}

	/**
	 * 移除并获取列表第一个元素
	 * @param key
	 */
	async lLeftPop(key: string): Promise<string> {
		if (!key) return null;
		const result = await this.adapter.blpop(key);
		return result.length > 1 ? result[1] : null;
	}

	/**
	 * 移除并获取列表最后一个元素
	 * @param key
	 */
	async lRightPop(key: string): Promise<string> {
		if (!key) return null;
		const result = await this.adapter.brpop(key);
		return result.length > 1 ? result[1] : null;
	}

	/**
	 * 对一个列表进行修剪(trim)，就是说，让列表只保留指定区间内的元素，不在指定区间之内的元素都将被删除
	 * @param key
	 * @param start
	 * @param stop
	 */
	async lTrim(key: string, start: number, stop: number): Promise<'OK' | null> {
		if (!key) return null;
		return await this.adapter.ltrim(key, start, stop);
	}

	/**
	 * 移除列表元素
	 * @param key
	 * @param count
	 * count > 0 ：从表头开始向表尾搜索，移除与 value 相等的元素，数量为 count；
	 * count < 0 ：从表尾开始向表头搜索，移除与 value 相等的元素，数量为 count 的绝对值；
	 * count = 0 ： 移除表中所有与 value 相等的值
	 * @param val
	 */
	async lRemove(key: string, count: number, val: string): Promise<number> {
		if (!key) return 0;
		return await this.adapter.lrem(key, count, val);
	}

	/**
	 * 移除列表最后一个元素，并将该元素添加到另一个裂膏并返回
	 * 如果列表没有元素会阻塞队列直到等待超时或发现可弹出元素为止
	 * @param sourceKey
	 * @param destinationKey
	 * @param timeout
	 */
	async lPoplPush(sourceKey: string, destinationKey: string, timeout: number): Promise<string> {
		if (!sourceKey || !destinationKey) return null;
		return await this.adapter.brpoplpush(sourceKey, destinationKey, timeout);
	}

	/**
	 * 删除全部缓存
	 * @returns
	 */
	async reset() {
		const keys = await this.adapter.keys('*');
		return keys.length > 0 ? await this.adapter.del(...keys) : 0;
	}

	/* ----------------------- set 相关操作 ----------------------- */

	/**
	 * 添加一个或多个元素到集合
	 * @param key
	 * @param members
	 */
	async sAdd(key: string, ...members: string[]): Promise<number> {
		if (!key || members.length === 0) return 0;
		return await this.adapter.sadd(key, ...members);
	}

	/**
	 * 移除集合中的一个或多个元素
	 * @param key
	 * @param members
	 */
	async sRemove(key: string, ...members: string[]): Promise<number> {
		if (!key || members.length === 0) return 0;
		return await this.adapter.srem(key, ...members);
	}

	/**
	 * 判断元素是否在集合中
	 * @param key
	 * @param member
	 */
	sIsMember(key: string, member: string): Promise<boolean> {
		if (!key || !member) return Promise.resolve(false);
		return new Promise(resolve => {
			this.adapter
				.sismember(key, member)
				.then(res => {
					resolve(res === 1);
				})
				.catch(() => {
					resolve(false);
				});
		});
	}

	/**
	 * 获取集合中的所有元素
	 * @param key
	 */
	async sMembers(key: string): Promise<string[]> {
		if (!key) return [];
		return await this.adapter.smembers(key);
	}

	/**
	 * 获取集合的元素数量
	 * @param key
	 */
	async sCard(key: string): Promise<number> {
		if (!key) return 0;
		return await this.adapter.scard(key);
	}

	/**
	 * 随机移除并返回集合中的一个元素
	 * @param key
	 */
	async sPop(key: string): Promise<string | null> {
		if (!key) return null;
		return await this.adapter.spop(key);
	}

	/**
	 * 返回集合中的一个或多个随机元素
	 * @param key
	 * @param count
	 */
	async sRandMember(key: string, count: number = 1): Promise<string[]> {
		if (!key) return [];
		return await this.adapter.srandmember(key, count);
	}

	/**
	 * 差异
	 * @param keys
	 */
	async sDiff(...keys: string[]): Promise<string[]> {
		if (!keys || keys.length === 0) return [];
		return await this.adapter.sdiff(...keys);
	}

	async getCacheList<T>(CACHE_NAME: string, keys: string[]): Promise<(T | null)[]> {
		return await this.mget(keys.map(key => `${CACHE_NAME}${key}`));
	}
}
