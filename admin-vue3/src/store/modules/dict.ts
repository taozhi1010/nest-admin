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

interface DictData {
  key: string
  value: DictItem[]
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

/**
 * 格式化字典数据
 * @param dictDataList - 原始字典数据列表
 * @returns 格式化后的字典数据
 */
function formatDictData(dictDataList: RawDictItem[]): DictItem[] {
  return dictDataList.map((item) => ({
    label: item.dictLabel,
    value: item.dictValue,
    elTagType: item.listClass,
    elTagClass: item.cssClass
  }))
}

/**
 * 读取本地持久化缓存
 */
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
      // 字典缓存数组 [{ key: dictType, value: dictData[] }]
      dict: (cached
        ? Object.entries(cached.dicts).map(([key, value]) => ({ key, value }))
        : []) as DictData[],
      // 已加载（含本地缓存恢复）的字典类型集合
      loadedTypes: new Set<string>(cached ? Object.keys(cached.dicts) : []),
      // 最近一次与后端校验通过的字典版本号
      serverVersion: cached?.serverVersion || ''
    }
  },
  actions: {
    /**
     * 将当前字典写入 localStorage
     */
    persist() {
      try {
        const dicts: Record<string, DictItem[]> = {}
        this.dict.forEach((item) => {
          dicts[item.key] = item.value
        })

        const cache: PersistedDictCache = {
          schema: CACHE_SCHEMA_VERSION,
          serverVersion: this.serverVersion,
          savedAt: Date.now(),
          dicts
        }
        localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(cache))
      } catch (error) {
        console.warn('[字典] 本地缓存写入失败:', error)
      }
    },

    /**
     * 获取字典数据
     * @param key - 字典类型
     * @returns 字典数据数组
     */
    getDict(key: string): DictItem[] | null {
      if (!key) return null
      const item = this.dict.find((d) => d.key === key)
      return item ? item.value : null
    },

    /**
     * 设置字典数据（不自动持久化，由调用方统一处理）
     * @param key - 字典类型
     * @param value - 字典数据数组
     */
    setDict(key: string, value: DictItem[]) {
      if (!key) return

      const existingIndex = this.dict.findIndex((item) => item.key === key)
      if (existingIndex !== -1) {
        this.dict[existingIndex].value = value
      } else {
        this.dict.push({ key, value })
      }
    },

    /**
     * 删除字典（同时从持久化缓存移除）
     * @param key - 字典类型
     * @returns 是否删除成功
     */
    removeDict(key: string): boolean {
      const index = this.dict.findIndex((item) => item.key === key)
      if (index === -1) return false

      this.dict.splice(index, 1)
      this.loadedTypes.delete(key)
      this.persist()
      return true
    },

    /**
     * 清空所有字典（内存 + localStorage）
     */
    cleanDict() {
      this.dict = []
      this.loadedTypes.clear()
      this.serverVersion = ''
      try {
        localStorage.removeItem(CACHE_STORAGE_KEY)
      } catch (error) {
        console.warn('[字典] 本地缓存清理失败:', error)
      }
    },

    /**
     * 标记字典类型为已加载
     * @param dictType - 字典类型
     */
    markTypeAsLoaded(dictType: string) {
      this.loadedTypes.add(dictType)
    },

    /**
     * 检查字典类型是否已加载
     * @param dictType - 字典类型
     * @returns 是否已加载
     */
    isTypeLoaded(dictType: string): boolean {
      return this.loadedTypes.has(dictType)
    },

    /**
     * 加载单个字典
     * @param dictType - 字典类型
     * @param options.fresh - 绕过本地缓存与后端 Redis 缓存
     * @returns 字典数据数组
     */
    async loadDict(dictType: string, options: DictLoadOptions = {}): Promise<DictItem[]> {
      const { fresh = false } = options

      if (!fresh && this.isTypeLoaded(dictType)) {
        return this.getDict(dictType) || []
      }

      // 全量初始化进行中时先等待，避免启动阶段再发单类型请求
      if (initPromise) {
        await initPromise.catch(() => {})
        if (!fresh && this.isTypeLoaded(dictType)) {
          return this.getDict(dictType) || []
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

    /**
     * 请求单个字典类型并写入缓存
     */
    async fetchAndCacheType(dictType: string, fresh: boolean): Promise<DictItem[]> {
      try {
        const resp = await getDicts(dictType, fresh)
        const dictData = formatDictData(resp.data || [])
        this.setDict(dictType, dictData)
        this.markTypeAsLoaded(dictType)
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
     * @param options.force - 忽略版本校验，强制重新拉取全量字典
     * @param options.fresh - 拉取时绕过本地缓存与后端 Redis 缓存
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

      // 版本一致，直接使用本地缓存
      if (!fresh && version && this.dict.length > 0 && version === this.serverVersion) {
        return
      }

      // 版本接口不可用时，已有本地缓存则继续使用，避免每次启动重复全量拉取
      if (!fresh && !version && this.dict.length > 0) {
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
        if (this.dict.length === 0) {
          await this.initDictFallback()
        }
      }
    },

    /**
     * 拉取全量字典并覆盖本地缓存
     */
    async fetchAllDicts(fresh: boolean) {
      const response = await getAllDicts(fresh)
      const allDicts = response.data || {}

      this.dict = []
      this.loadedTypes.clear()

      if (Array.isArray(allDicts)) {
        // 格式 A: 返回字典项数组 [{dictType, dictLabel, dictValue, ...}]
        this.processArrayDicts(allDicts)
      } else if (typeof allDicts === 'object') {
        // 格式 B: 返回对象 {dictType: [items]}
        this.processObjectDicts(allDicts)
      }

      this.persist()
    },

    /**
     * 静默刷新版本号（失败不影响已加载的字典）
     */
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
     * 处理数组格式的字典数据
     */
    processArrayDicts(allDicts: RawDictItem[]) {
      const groupedDicts: Record<string, RawDictItem[]> = {}

      allDicts.forEach((item) => {
        const dictType = item.dictType
        if (dictType) {
          if (!groupedDicts[dictType]) {
            groupedDicts[dictType] = []
          }
          groupedDicts[dictType].push(item)
        }
      })

      Object.entries(groupedDicts).forEach(([dictType, dictDataList]) => {
        this.setDict(dictType, formatDictData(dictDataList))
        this.markTypeAsLoaded(dictType)
      })
    },

    /**
     * 处理对象格式的字典数据
     */
    processObjectDicts(allDicts: Record<string, RawDictItem[]>) {
      Object.entries(allDicts).forEach(([dictType, dictDataList]) => {
        if (dictType && Array.isArray(dictDataList)) {
          this.setDict(dictType, formatDictData(dictDataList))
          this.markTypeAsLoaded(dictType)
        }
      })
    },

    /**
     * 回退方案：全量接口不可用时，按字典类型逐个加载
     * 注意：这里直接请求，不能调用 loadDict，否则会等待当前初始化而互相死锁
     */
    async initDictFallback() {
      try {
        const response = await optionselect()
        const dictTypes = response.data || []

        await Promise.all(
          dictTypes.map(async (item: any) => {
            const type = item.dictType || item.type
            if (!type) return

            try {
              const resp = await getDicts(type)
              this.setDict(type, formatDictData(resp.data || []))
              this.markTypeAsLoaded(type)
            } catch (error) {
              console.error(`[字典] 加载失败 (${type}):`, error)
            }
          })
        )

        this.persist()
        console.log('[字典] 逐个加载完成，已缓存', this.dict.length, '个字典类型')
      } catch (error) {
        console.error('[字典] 回退加载失败:', error)
      }
    }
  }
})

export default useDictStore
