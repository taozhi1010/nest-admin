import defAva from '@/assets/images/avatar.webp'

/**
 * 图片资源统一处理工具
 * 解决开发环境图片请求不走 API 代理的问题
 */

// 获取环境变量（兼容 TS 类型检查）
const env = import.meta.env as any
const VITE_APP_ENV = env?.VITE_APP_ENV
const VITE_APP_BASE_API = env?.VITE_APP_BASE_API || ''

/**
 * 判断是否为外部 URL（http:// 或 https:// 开头）
 * @param url 要判断的 URL
 * @returns 是否为外部 URL
 */
export function isExternalUrl(url: string): boolean {
  if (!url) return false
  return /^https?:\/\//.test(url)
}

/**
 * 判断是否为本地相对路径（以 /uploads/ 或 uploads/ 开头）
 * @param path 要判断的路径
 * @returns 是否为本地相对路径
 */
export function isLocalImagePath(path: string): boolean {
  if (!path) return false
  return /^\/?(uploads|profile)\//.test(path)
}

/**
 * 构建完整的图片 URL
 * @param path 图片路径或 URL
 * @param options 配置选项
 * @param options.forceAbsolute 是否强制返回绝对 URL
 * @returns 完整的图片 URL
 */
export function getImageUrl(
  path: string,
  options: { forceAbsolute?: boolean } = {}
): string {
  const { forceAbsolute = false } = options

  // 1. 空值处理
  if (!path) return ''

  // 2. 外部 URL 直接返回
  if (isExternalUrl(path)) {
    return path
  }

  // 3. 处理本地路径
  let normalizedPath = path
  // 确保路径以 / 开头
  if (!normalizedPath.startsWith('/')) {
    normalizedPath = `/${normalizedPath}`
  }

  // 处理双斜杠问题（保留协议部分，只处理路径部分）
  normalizedPath = normalizedPath.replace(/(?<!:)\//g, '/')

  // 4. 开发环境：返回相对路径，走 Vite 代理
  // 生产环境或强制绝对路径：拼接完整 URL
  if (VITE_APP_ENV === 'development' && !forceAbsolute) {
    return normalizedPath
  } else {
    // /profile 和 /uploads 由前端站点自身代理，不应再拼接 /api
    if (isLocalImagePath(normalizedPath)) {
      return normalizedPath
    }
    // 生产环境：拼接基础 URL
    const baseUrl = VITE_APP_BASE_API.replace(/\/$/, '')
    return `${baseUrl}${normalizedPath}`
  }
}

/**
 * 批量处理图片 URL 数组
 * @param paths 图片路径数组
 * @param options 配置选项
 * @returns 完整的图片 URL 数组
 */
export function getImageUrlList(
  paths: string[],
  options: { forceAbsolute?: boolean } = {}
): string[] {
  if (!Array.isArray(paths)) return []
  return paths.map((path) => getImageUrl(path, options))
}

/**
 * 将逗号分隔的图片路径字符串转换为 URL 数组
 * @param paths 逗号分隔的图片路径字符串
 * @param options 配置选项
 * @returns 图片 URL 数组
 */
export function parseImageUrlList(
  paths: string,
  options: { forceAbsolute?: boolean } = {}
): string[] {
  if (!paths) return []
  return getImageUrlList(paths.split(','), options)
}

/**
 * 将图片 URL 数组转换为逗号分隔的字符串
 * @param urls 图片 URL 数组
 * @returns 逗号分隔的图片 URL 字符串
 */
export function stringifyImageUrlList(urls: string[]): string {
  if (!Array.isArray(urls) || urls.length === 0) return ''
  return urls.join(',')
}

/**
 * 获取默认头像
 * @returns 默认头像 URL
 */
export function getDefaultAvatar(): string {
  return defAva
}

/**
 * 获取用户头像 URL（处理空值和默认头像）
 * @param avatarPath 用户头像路径
 * @param options 配置选项
 * @returns 用户头像 URL
 */
export function getUserAvatar(
  avatarPath: string,
  options: { forceAbsolute?: boolean } = {}
): string {
  // 如果头像路径为空，返回默认头像
  if (!avatarPath || avatarPath.trim() === '') {
    return getDefaultAvatar()
  }
  return getImageUrl(avatarPath, options)
}
