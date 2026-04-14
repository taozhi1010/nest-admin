// 导出所有全局类型定义

export * from './api'

/**
 * Vite 环境变量类型定义
 */
interface ImportMetaEnv {
  readonly VITE_APP_ENV: string
  readonly VITE_APP_BASE_API: string
  [key: string]: any
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
