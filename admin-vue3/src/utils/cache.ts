/**
 * 缓存工具
 * 提供 sessionStorage 和 localStorage 的封装
 */

interface StorageCache {
  set(key: string, value: string): void
  get(key: string): string | null
  setJSON(key: string, jsonValue: any): void
  getJSON<T = any>(key: string): T | null
  remove(key: string): void
}

const sessionCache: StorageCache = {
  set(key: string, value: string): void {
    if (!sessionStorage) {
      return
    }
    if (key != null && value != null) {
      sessionStorage.setItem(key, value)
    }
  },
  get(key: string): string | null {
    if (!sessionStorage) {
      return null
    }
    if (key == null) {
      return null
    }
    return sessionStorage.getItem(key)
  },
  setJSON(key: string, jsonValue: any): void {
    if (jsonValue != null) {
      this.set(key, JSON.stringify(jsonValue))
    }
  },
  getJSON<T = any>(key: string): T | null {
    const value = this.get(key)
    if (value != null) {
      return JSON.parse(value) as T
    }
    return null
  },
  remove(key: string): void {
    sessionStorage.removeItem(key)
  }
}

const localCache: StorageCache = {
  set(key: string, value: string): void {
    if (!localStorage) {
      return
    }
    if (key != null && value != null) {
      localStorage.setItem(key, value)
    }
  },
  get(key: string): string | null {
    if (!localStorage) {
      return null
    }
    if (key == null) {
      return null
    }
    return localStorage.getItem(key)
  },
  setJSON(key: string, jsonValue: any): void {
    if (jsonValue != null) {
      this.set(key, JSON.stringify(jsonValue))
    }
  },
  getJSON<T = any>(key: string): T | null {
    const value = this.get(key)
    if (value != null) {
      return JSON.parse(value) as T
    }
    return null
  },
  remove(key: string): void {
    localStorage.removeItem(key)
  }
}

export default {
  /**
   * 会话级缓存
   */
  session: sessionCache,
  /**
   * 本地缓存
   */
  local: localCache
}
