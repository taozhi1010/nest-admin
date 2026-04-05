import defAva from '@/assets/images/profile.jpg'

/**
 * 图片资源统一处理工具
 * 解决开发环境图片请求不走 API 代理的问题
 */

/**
 * 判断是否为外部 URL（http:// 或 https:// 开头）
 * @param {string} url - 要判断的 URL
 * @returns {boolean} - 是否为外部 URL
 */
export function isExternalUrl(url) {
  if (!url) return false
  return /^https?:\/\//.test(url)
}

/**
 * 判断是否为本地相对路径（以 /uploads/ 或 uploads/ 开头）
 * @param {string} path - 要判断的路径
 * @returns {boolean} - 是否为本地相对路径
 */
export function isLocalImagePath(path) {
  if (!path) return false
  return /^\/?uploads\//.test(path)
}

/**
 * 构建完整的图片 URL
 * - 开发环境：使用相对路径，走 Vite 图片代理
 * - 生产环境：拼接完整 URL
 * - 外部 URL：直接返回
 *
 * @param {string} path - 图片路径或 URL
 * @param {object} options - 配置选项
 * @param {boolean} options.forceAbsolute - 是否强制返回绝对 URL（用于生产环境或需要完整 URL 的场景）
 * @returns {string} - 完整的图片 URL
 *
 * @example
 * // 开发环境
 * getImageUrl('/uploads/avatar/2024/01/01/test.png')
 * // => '/uploads/avatar/2024/01/01/test.png'
 *
 * // 生产环境
 * getImageUrl('/uploads/avatar/2024/01/01/test.png', { forceAbsolute: true })
 * // => 'https://example.com/uploads/avatar/2024/01/01/test.png'
 *
 * // 外部 URL 直接返回
 * getImageUrl('https://cdn.example.com/image.png')
 * // => 'https://cdn.example.com/image.png'
 */
export function getImageUrl(path, options = {}) {
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
  if (import.meta.env.VITE_APP_ENV === 'development' && !forceAbsolute) {
    return normalizedPath
  } else {
    // 生产环境：拼接基础 URL
    const baseUrl = (import.meta.env.VITE_APP_BASE_API || '').replace(/\/$/, '')
    return `${baseUrl}${normalizedPath}`
  }
}

/**
 * 批量处理图片 URL 数组
 * @param {string[]} paths - 图片路径数组
 * @param {object} options - 配置选项
 * @returns {string[]} - 完整的图片 URL 数组
 */
export function getImageUrlList(paths, options = {}) {
  if (!Array.isArray(paths)) return []
  return paths.map((path) => getImageUrl(path, options))
}

/**
 * 将逗号分隔的图片路径字符串转换为 URL 数组
 * @param {string} paths - 逗号分隔的图片路径字符串
 * @param {object} options - 配置选项
 * @returns {string[]} - 图片 URL 数组
 */
export function parseImageUrlList(paths, options = {}) {
  if (!paths) return []
  return getImageUrlList(paths.split(','), options)
}

/**
 * 将图片 URL 数组转换为逗号分隔的字符串
 * @param {string[]} urls - 图片 URL 数组
 * @returns {string} - 逗号分隔的图片 URL 字符串
 */
export function stringifyImageUrlList(urls) {
  if (!Array.isArray(urls) || urls.length === 0) return ''
  return urls.join(',')
}

/**
 * 获取默认头像
 * @returns {string} - 默认头像 URL
 */
export function getDefaultAvatar() {
  // 使用 import 导入的默认头像，Vite 会正确处理路径
  return defAva
}

/**
 * 获取用户头像 URL（处理空值和默认头像）
 * @param {string} avatarPath - 用户头像路径
 * @param {object} options - 配置选项
 * @returns {string} - 用户头像 URL
 */
export function getUserAvatar(avatarPath, options = {}) {
  // 如果头像路径为空，返回默认头像
  if (!avatarPath || avatarPath.trim() === '') {
    return getDefaultAvatar()
  }
  return getImageUrl(avatarPath, options)
}
