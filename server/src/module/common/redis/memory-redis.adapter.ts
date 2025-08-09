import { Injectable } from '@nestjs/common';

/**
 * 内存Redis适配器
 * 在内存中模拟Redis的基本操作
 */
@Injectable()
export class MemoryRedisAdapter {
	private store = new Map<string, any>();
	private hashStore = new Map<string, Map<string, string>>();
	private listStore = new Map<string, string[]>();
	private setStore = new Map<string, Set<string>>();
	private ttlStore = new Map<string, number>();

	constructor() {
		// 定期清理过期的键
		setInterval(() => {
			this.cleanExpiredKeys();
		}, 60000); // 每分钟清理一次
	}

	private cleanExpiredKeys() {
		const now = Date.now();
		for (const [key, expireTime] of this.ttlStore.entries()) {
			if (expireTime <= now) {
				this.store.delete(key);
				this.hashStore.delete(key);
				this.listStore.delete(key);
				this.setStore.delete(key);
				this.ttlStore.delete(key);
			}
		}
	}

	private isExpired(key: string): boolean {
		const expireTime = this.ttlStore.get(key);
		if (expireTime && expireTime <= Date.now()) {
			this.store.delete(key);
			this.hashStore.delete(key);
			this.listStore.delete(key);
			this.setStore.delete(key);
			this.ttlStore.delete(key);
			return true;
		}
		return false;
	}

	// String operations
	async set(key: string, value: string, px?: number): Promise<'OK' | null> {
		if (this.isExpired(key)) return null;
		this.store.set(key, value);
		if (px) {
			this.ttlStore.set(key, Date.now() + px);
		}
		return 'OK';
	}

	async get(key: string): Promise<string | null> {
		if (this.isExpired(key)) return null;
		return this.store.get(key) || null;
	}

	async mset(...args: string[]): Promise<'OK'> {
		for (let i = 0; i < args.length; i += 2) {
			const key = args[i];
			const value = args[i + 1];
			if (key && value !== undefined) {
				this.store.set(key, value);
			}
		}
		return 'OK';
	}

	async mget(keys: string[]): Promise<(string | null)[]> {
		return keys.map(key => {
			if (this.isExpired(key)) return null;
			return this.store.get(key) || null;
		});
	}

	async del(...keys: string[]): Promise<number> {
		let count = 0;
		for (const key of keys) {
			if (
				this.store.has(key) ||
				this.hashStore.has(key) ||
				this.listStore.has(key) ||
				this.setStore.has(key)
			) {
				this.store.delete(key);
				this.hashStore.delete(key);
				this.listStore.delete(key);
				this.setStore.delete(key);
				this.ttlStore.delete(key);
				count++;
			}
		}
		return count;
	}

	async ttl(key: string): Promise<number> {
		if (this.isExpired(key)) return -2;
		const expireTime = this.ttlStore.get(key);
		if (!expireTime) return -1;
		return Math.ceil((expireTime - Date.now()) / 1000);
	}

	async keys(pattern: string): Promise<string[]> {
		const regex = pattern.replace(/\*/g, '.*').replace(/\?/g, '.');
		const regExp = new RegExp(`^${regex}$`);
		const allKeys = [
			...this.store.keys(),
			...this.hashStore.keys(),
			...this.listStore.keys(),
			...this.setStore.keys(),
		];
		return [...new Set(allKeys)].filter(key => {
			if (this.isExpired(key)) return false;
			return regExp.test(key);
		});
	}

	async expire(key: string, seconds: number): Promise<number> {
		if (this.isExpired(key)) return 0;
		if (
			this.store.has(key) ||
			this.hashStore.has(key) ||
			this.listStore.has(key) ||
			this.setStore.has(key)
		) {
			this.ttlStore.set(key, Date.now() + seconds * 1000);
			return 1;
		}
		return 0;
	}

	async dbsize(): Promise<number> {
		this.cleanExpiredKeys();
		return this.store.size + this.hashStore.size + this.listStore.size + this.setStore.size;
	}

	// Hash operations
	async hset(key: string, field: string, value: string): Promise<number> {
		if (this.isExpired(key)) return 0;
		if (!this.hashStore.has(key)) {
			this.hashStore.set(key, new Map());
		}
		const hash = this.hashStore.get(key)!;
		const isNew = !hash.has(field);
		hash.set(field, value);
		return isNew ? 1 : 0;
	}

	async hmset(key: string, obj: Record<string, string | number | boolean>): Promise<'OK'> {
		if (this.isExpired(key)) return 'OK';
		if (!this.hashStore.has(key)) {
			this.hashStore.set(key, new Map());
		}
		const hash = this.hashStore.get(key)!;
		for (const [field, value] of Object.entries(obj)) {
			hash.set(field, String(value));
		}
		return 'OK';
	}

	async hget(key: string, field: string): Promise<string | null> {
		if (this.isExpired(key)) return null;
		const hash = this.hashStore.get(key);
		return hash?.get(field) || null;
	}

	async hgetall(key: string): Promise<Record<string, string>> {
		if (this.isExpired(key)) return {};
		const hash = this.hashStore.get(key);
		if (!hash) return {};
		const result: Record<string, string> = {};
		for (const [field, value] of hash.entries()) {
			result[field] = value;
		}
		return result;
	}

	async hvals(key: string): Promise<string[]> {
		if (this.isExpired(key)) return [];
		const hash = this.hashStore.get(key);
		return hash ? Array.from(hash.values()) : [];
	}

	async hkeys(key: string): Promise<string[]> {
		if (this.isExpired(key)) return [];
		const hash = this.hashStore.get(key);
		return hash ? Array.from(hash.keys()) : [];
	}

	async hdel(key: string, ...fields: string[]): Promise<number> {
		if (this.isExpired(key)) return 0;
		const hash = this.hashStore.get(key);
		if (!hash) return 0;
		let count = 0;
		for (const field of fields) {
			if (hash.delete(field)) {
				count++;
			}
		}
		return count;
	}

	// List operations
	async lpush(key: string, ...values: string[]): Promise<number> {
		if (this.isExpired(key)) return 0;
		if (!this.listStore.has(key)) {
			this.listStore.set(key, []);
		}
		const list = this.listStore.get(key)!;
		list.unshift(...values.reverse());
		return list.length;
	}

	async rpush(key: string, ...values: string[]): Promise<number> {
		if (this.isExpired(key)) return 0;
		if (!this.listStore.has(key)) {
			this.listStore.set(key, []);
		}
		const list = this.listStore.get(key)!;
		list.push(...values);
		return list.length;
	}

	async lpushx(key: string, ...values: string[]): Promise<number> {
		if (this.isExpired(key)) return 0;
		if (!this.listStore.has(key)) return 0;
		return this.lpush(key, ...values);
	}

	async rpushx(key: string, ...values: string[]): Promise<number> {
		if (this.isExpired(key)) return 0;
		if (!this.listStore.has(key)) return 0;
		return this.rpush(key, ...values);
	}

	async llen(key: string): Promise<number> {
		if (this.isExpired(key)) return 0;
		const list = this.listStore.get(key);
		return list ? list.length : 0;
	}

	async lrange(key: string, start: number, stop: number): Promise<string[]> {
		if (this.isExpired(key)) return [];
		const list = this.listStore.get(key);
		if (!list) return [];

		let startIdx = start < 0 ? Math.max(0, list.length + start) : start;
		let stopIdx = stop < 0 ? list.length + stop : stop;

		if (stopIdx >= list.length) stopIdx = list.length - 1;
		if (startIdx > stopIdx) return [];

		return list.slice(startIdx, stopIdx + 1);
	}

	async lindex(key: string, index: number): Promise<string | null> {
		if (this.isExpired(key)) return null;
		const list = this.listStore.get(key);
		if (!list) return null;

		const idx = index < 0 ? list.length + index : index;
		return list[idx] || null;
	}

	async lset(key: string, index: number, value: string): Promise<'OK' | null> {
		if (this.isExpired(key)) return null;
		const list = this.listStore.get(key);
		if (!list) return null;

		const idx = index < 0 ? list.length + index : index;
		if (idx < 0 || idx >= list.length) return null;

		list[idx] = value;
		return 'OK';
	}

	async lrem(key: string, count: number, value: string): Promise<number> {
		if (this.isExpired(key)) return 0;
		const list = this.listStore.get(key);
		if (!list) return 0;

		let removed = 0;
		if (count === 0) {
			// Remove all occurrences
			for (let i = list.length - 1; i >= 0; i--) {
				if (list[i] === value) {
					list.splice(i, 1);
					removed++;
				}
			}
		} else if (count > 0) {
			// Remove from head
			for (let i = 0; i < list.length && removed < count; i++) {
				if (list[i] === value) {
					list.splice(i, 1);
					removed++;
					i--; // Adjust index after removal
				}
			}
		} else {
			// Remove from tail
			const absCount = Math.abs(count);
			for (let i = list.length - 1; i >= 0 && removed < absCount; i--) {
				if (list[i] === value) {
					list.splice(i, 1);
					removed++;
				}
			}
		}
		return removed;
	}

	async ltrim(key: string, start: number, stop: number): Promise<'OK'> {
		if (this.isExpired(key)) return 'OK';
		const list = this.listStore.get(key);
		if (!list) return 'OK';

		let startIdx = start < 0 ? Math.max(0, list.length + start) : start;
		let stopIdx = stop < 0 ? list.length + stop : stop;

		if (startIdx > stopIdx || startIdx >= list.length) {
			list.length = 0;
		} else {
			const newList = list.slice(startIdx, stopIdx + 1);
			list.length = 0;
			list.push(...newList);
		}

		return 'OK';
	}

	async linsert(
		key: string,
		direction: 'BEFORE' | 'AFTER',
		pivot: string,
		value: string
	): Promise<number> {
		if (this.isExpired(key)) return -1;
		const list = this.listStore.get(key);
		if (!list) return 0;

		const pivotIndex = list.indexOf(pivot);
		if (pivotIndex === -1) return -1;

		const insertIndex = direction === 'BEFORE' ? pivotIndex : pivotIndex + 1;
		list.splice(insertIndex, 0, value);

		return list.length;
	}

	async blpop(key: string, timeout?: number): Promise<string[]> {
		if (this.isExpired(key)) return [];
		const list = this.listStore.get(key);
		if (!list || list.length === 0) return [];

		const value = list.shift();
		return value ? [key, value] : [];
	}

	async brpop(key: string, timeout?: number): Promise<string[]> {
		if (this.isExpired(key)) return [];
		const list = this.listStore.get(key);
		if (!list || list.length === 0) return [];

		const value = list.pop();
		return value ? [key, value] : [];
	}

	async brpoplpush(source: string, destination: string, timeout: number): Promise<string | null> {
		if (this.isExpired(source) || this.isExpired(destination)) return null;
		const sourceList = this.listStore.get(source);
		if (!sourceList || sourceList.length === 0) return null;

		const value = sourceList.pop();
		if (!value) return null;

		if (!this.listStore.has(destination)) {
			this.listStore.set(destination, []);
		}
		const destList = this.listStore.get(destination)!;
		destList.unshift(value);

		return value;
	}

	// Set operations
	async sadd(key: string, ...members: string[]): Promise<number> {
		if (this.isExpired(key)) return 0;
		if (!this.setStore.has(key)) {
			this.setStore.set(key, new Set());
		}
		const set = this.setStore.get(key)!;
		let added = 0;
		for (const member of members) {
			if (!set.has(member)) {
				set.add(member);
				added++;
			}
		}
		return added;
	}

	async srem(key: string, ...members: string[]): Promise<number> {
		if (this.isExpired(key)) return 0;
		const set = this.setStore.get(key);
		if (!set) return 0;

		let removed = 0;
		for (const member of members) {
			if (set.delete(member)) {
				removed++;
			}
		}
		return removed;
	}

	async sismember(key: string, member: string): Promise<number> {
		if (this.isExpired(key)) return 0;
		const set = this.setStore.get(key);
		return set?.has(member) ? 1 : 0;
	}

	async smembers(key: string): Promise<string[]> {
		if (this.isExpired(key)) return [];
		const set = this.setStore.get(key);
		return set ? Array.from(set) : [];
	}

	async scard(key: string): Promise<number> {
		if (this.isExpired(key)) return 0;
		const set = this.setStore.get(key);
		return set ? set.size : 0;
	}

	async spop(key: string): Promise<string | null> {
		if (this.isExpired(key)) return null;
		const set = this.setStore.get(key);
		if (!set || set.size === 0) return null;

		const members = Array.from(set);
		const randomMember = members[Math.floor(Math.random() * members.length)];
		set.delete(randomMember);
		return randomMember;
	}

	async srandmember(key: string, count: number = 1): Promise<string[]> {
		if (this.isExpired(key)) return [];
		const set = this.setStore.get(key);
		if (!set || set.size === 0) return [];

		const members = Array.from(set);
		const result: string[] = [];

		for (let i = 0; i < count && i < members.length; i++) {
			const randomIndex = Math.floor(Math.random() * members.length);
			result.push(members[randomIndex]);
		}

		return result;
	}

	async sdiff(...keys: string[]): Promise<string[]> {
		if (keys.length === 0) return [];

		const firstKey = keys[0];
		if (this.isExpired(firstKey)) return [];

		const firstSet = this.setStore.get(firstKey);
		if (!firstSet) return [];

		const result = new Set(firstSet);

		for (let i = 1; i < keys.length; i++) {
			const key = keys[i];
			if (this.isExpired(key)) continue;

			const set = this.setStore.get(key);
			if (set) {
				for (const member of set) {
					result.delete(member);
				}
			}
		}

		return Array.from(result);
	}

	// Info and stats methods
	async info(section?: string): Promise<string> {
		const stats = {
			redis_version: '7.0.0-memory',
			redis_mode: 'memory',
			tcp_port: '0',
			uptime_in_seconds: Math.floor(Date.now() / 1000),
			connected_clients: '1',
			used_memory: this.calculateMemoryUsage(),
			used_memory_human: this.formatBytes(this.calculateMemoryUsage()),
			total_commands_processed: '0',
			keyspace_hits: '0',
			keyspace_misses: '0',
		};

		return Object.entries(stats)
			.map(([key, value]) => `${key}:${value}`)
			.join('\r\n');
	}

	private calculateMemoryUsage(): number {
		// 简单估算内存使用量
		let size = 0;
		size += this.store.size * 100; // 粗略估算
		size += this.hashStore.size * 200;
		size += this.listStore.size * 150;
		size += this.setStore.size * 150;
		return size;
	}

	private formatBytes(bytes: number): string {
		if (bytes === 0) return '0B';
		const k = 1024;
		const sizes = ['B', 'K', 'M', 'G'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))}${sizes[i]}`;
	}
}
