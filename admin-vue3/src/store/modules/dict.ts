/**
 * 字典数据管理
 * 全量字典持久化到 localStorage，启动时只校验版本号，版本变化才重新拉取
 */
import { defineStore } from 'pinia'
import { getDicts, getAllDicts, getDictVersion } from '@/api/system/dict/data'
import { optionselect } from '@/api/system/dict/type'

// ==================== 类型定义 ====================

interface DictItem {
  label: string
  value: string
  elTagType?: string
  elTagClass?: string
}

interface RawDictItem {
  dictLabel: string
  dictValue: string
  listClass?: string
  cssClass?: string
  dictType?: string
  type?: string
}

interface DictLoadOptions {
  /** 绕过本地缓存与后端 Redis 缓存，直接查询数据库 */
  fresh?: boolean
}

interface DictInitOptions {
  /** 忽略版本校验，强制重新拉取全量字典 */
  force?: boolean
  /** 拉取时绕过本地缓存与后端 Redis 缓存 */
  fresh?: boolean
}

interface PersistedDictCache {
  schema: number
  serverVersion: string
  savedAt: number
  dicts: Record<string, DictItem[]>
}

// ==================== 常量与模块级状态 ====================

const CACHE_STORAGE_KEY = 'nest-admin:dict-cache'
const CACHE_SCHEMA_VERSION = 1

// 初始化与单类型加载的去重，避免同一时刻重复请求
let initPromise: Promise<void> | null = null
const pendingTypeLoads = new Map<string, Promise<DictItem[]>>()

// ==================== 工具函数 ====================

/** 把后端字典数据转换为前端使用的结构 */
function formatDictData(dictDataList: RawDictItem[]): DictItem[] {
  return dictDataList.map((item) => ({
    label: item.dictLabel,
    value: item.dictValue,
    elTagType: item.listClass,
    elTagClass: item.cssClass
  }))
}

/** 读取并校验 localStorage 中的字典缓存 */
function readPersistedCache(): PersistedDictCache | null {
  try {
    const raw = localStorage.getItem(CACHE_STORAGE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw) as PersistedDictCache
    if (parsed?.schema !== CACHE_SCHEMA_VERSION || !parsed.dicts || typeof parsed.dicts !== 'object') {
      localStorage.removeItem(CACHE_STORAGE_KEY)
      return null
    }
    return parsed
  } catch (error) {
    console.warn('[字典] 本地缓存读取失败，已丢弃:', error)
    try {
      localStorage.removeItem(CACHE_STORAGE_KEY)
    } catch {
      // localStorage 不可用时仅使用内存缓存
    }
    return null
  }
}

// ==================== Store 定义 ====================

const useDictStore = defineStore('dict', {
  state: () => {
    const cached = readPersistedCache()
    return {
      // 字典数据，key 为字典类型
      dicts: (cached?.dicts || {}) as Record<string, DictItem[]>,
      // 最近一次与后端校验通过的字典版本号
      serverVersion: cached?.serverVersion || ''
    }
  },
  actions: {
    /** 将当前字典写入 localStorage */
    persist() {
      try {
        const cache: PersistedDictCache = {
          schema: CACHE_SCHEMA_VERSION,
          serverVersion: this.serverVersion,
          savedAt: Date.now(),
          dicts: this.dicts
        }
        localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(cache))
      } catch (error) {
        console.warn('[字典] 本地缓存写入失败:', error)
      }
    },

    /** 获取指定类型的字典数据，不存在时返回 null */
    getDict(key: string): DictItem[] | null {
      if (!key) return null
      return this.dicts[key] || null
    },

    /** 写入指定类型的字典数据（不自动持久化） */
    setDict(key: string, value: DictItem[]) {
      if (!key) return
      this.dicts[key] = value
    },

    /** 删除指定类型的字典，并同步到本地缓存 */
    removeDict(key: string): boolean {
      if (!this.dicts[key]) return false
      delete this.dicts[key]
      this.persist()
      return true
    },

    /** 清空内存和 localStorage 中的全部字典缓存 */
    cleanDict() {
      this.dicts = {}
      this.serverVersion = ''
      try {
        localStorage.removeItem(CACHE_STORAGE_KEY)
      } catch (error) {
        console.warn('[字典] 本地缓存清理失败:', error)
      }
    },

    /**
     * 加载单个字典
     * @param options.fresh - 绕过本地缓存与后端 Redis 缓存
     */
    async loadDict(dictType: string, options: DictLoadOptions = {}): Promise<DictItem[]> {
      const { fresh = false } = options

      if (!fresh && this.dicts[dictType]) {
        return this.dicts[dictType]
      }

      // 全量初始化进行中时先等待，避免启动阶段再发单类型请求
      if (initPromise) {
        await initPromise.catch(() => {})
        if (!fresh && this.dicts[dictType]) {
          return this.dicts[dictType]
        }
      }

      const pending = pendingTypeLoads.get(dictType)
      if (pending) {
        const data = await pending
        if (!fresh) return data
      }

      const task = this.fetchAndCacheType(dictType, fresh).finally(() => {
        if (pendingTypeLoads.get(dictType) === task) {
          pendingTypeLoads.delete(dictType)
        }
      })
      pendingTypeLoads.set(dictType, task)
      return task
    },

    /** 请求单个字典类型并写入缓存 */
    async fetchAndCacheType(dictType: string, fresh: boolean): Promise<DictItem[]> {
      try {
        const resp = await getDicts(dictType, fresh)
        const dictData = formatDictData(resp.data || [])
        this.setDict(dictType, dictData)
        this.persist()
        return dictData
      } catch (error) {
        console.error(`[字典] 加载失败 (${dictType}):`, error)
        return this.getDict(dictType) || []
      }
    },

    /**
     * 初始化字典
     * 默认先用本地缓存，仅发一个版本号请求；版本变化时才重新全量拉取
     */
    async initDict(options: DictInitOptions = {}): Promise<void> {
      const { force = false, fresh = false } = options

      if (initPromise) {
        await initPromise.catch(() => {})
        if (!force && !fresh) return
      }

      const task = this.runInit(force, fresh)
      initPromise = task
      try {
        await task
      } finally {
        if (initPromise === task) {
          initPromise = null
        }
      }
    },

    /** 校验版本号，缓存有效时直接复用，否则拉取全量字典 */
    async runInit(force: boolean, fresh: boolean) {
      if (force) {
        await this.fetchAllDicts(fresh)
        await this.refreshVersion()
        return
      }

      let version = ''
      try {
        const versionResp = await getDictVersion()
        version = versionResp?.data?.version || ''
      } catch (error) {
        console.warn('[字典] 版本校验失败:', error)
      }

      // 版本一致，或版本接口不可用时已有缓存，直接使用本地缓存
      if (!fresh && Object.keys(this.dicts).length > 0 && (!version || version === this.serverVersion)) {
        return
      }

      try {
        await this.fetchAllDicts(fresh)
        if (version) {
          this.serverVersion = version
          this.persist()
        }
      } catch (error) {
        console.warn('[字典] 全量加载失败:', error)
        if (Object.keys(this.dicts).length === 0) {
          await this.initDictFallback()
        }
      }
    },

    /** 拉取全量字典并覆盖本地缓存 */
    async fetchAllDicts(fresh: boolean) {
      const response = await getAllDicts(fresh)
      const allDicts = response.data || {}
      const dicts: Record<string, DictItem[]> = {}

      Object.entries(allDicts).forEach(([dictType, dictDataList]) => {
        if (dictType && Array.isArray(dictDataList)) {
          dicts[dictType] = formatDictData(dictDataList)
        }
      })

      this.dicts = dicts
      this.persist()
    },

    /** 拉取并保存最新版本号，失败时保留原值 */
    async refreshVersion() {
      try {
        const versionResp = await getDictVersion()
        const version = versionResp?.data?.version
        if (version) {
          this.serverVersion = version
          this.persist()
        }
      } catch (error) {
        console.warn('[字典] 版本号刷新失败:', error)
      }
    },

    /**
     * 回退方案：全量接口不可用时，按字典类型逐个加载
     * 这里不能调用 loadDict，否则会等待当前初始化而互相死锁
     */
    async initDictFallback() {
      try {
        const response = await optionselect()
        const dictTypes = response.data || []

        await Promise.all(
          dictTypes.map((item: any) => {
            const type = item.dictType || item.type
            return type ? this.fetchAndCacheType(type, false) : Promise.resolve()
          })
        )
      } catch (error) {
        console.error('[字典] 回退加载失败:', error)
      }
    }
  }
})

export default useDictStore
