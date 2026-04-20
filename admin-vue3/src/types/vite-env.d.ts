/// <reference types="vite/client" />

/**
 * 扩展 Vite 环境变量类型
 */
declare interface ImportMetaEnv {
  readonly VITE_APP_ENV: string
  readonly VITE_APP_BASE_API: string
  readonly [key: string]: any
}

declare interface ImportMeta {
  readonly env: ImportMetaEnv
}

