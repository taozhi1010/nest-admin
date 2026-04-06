/**
 * catTools - 本地工具函数库
 * 提供 npm cat-tools 库未包含的本地工具方法
 * TODO:未来会继续整合相关方法到npm库中，避免重复代码
 * 
 * 注意：isNullorUndefined 等通用函数请使用 npm cat-tools 库
 */

import dayjs from 'dayjs'

/**
 * 日期格式化（基于 dayjs）
 * @param {Date|string|number} date - 日期对象、字符串或时间戳
 * @param {string} format - 格式化模板，默认 'YYYY-MM-DD HH:mm:ss'
 * @returns {string} 格式化后的日期字符串
 * @example
 * dateFormat(new Date(), 'YYYY-MM-DD') // '2024-01-01'
 */
export function dateFormat(date, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!date) return ''
  return dayjs(date).format(format)
}

/**
 * 防抖函数
 * @param {Function} fn - 要执行的函数
 * @param {number} delay - 延迟时间（毫秒），默认 300ms
 * @returns {Function} 防抖处理后的函数
 * @example
 * const debouncedFn = debounce(() => console.log('executed'), 500)
 */
export function debounce(fn, delay = 300) {
  let timer = null
  return function (...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

/**
 * 节流函数
 * @param {Function} fn - 要执行的函数
 * @param {number} delay - 延迟时间（毫秒），默认 300ms
 * @returns {Function} 节流处理后的函数
 * @example
 * const throttledFn = throttle(() => console.log('executed'), 500)
 */
export function throttle(fn, delay = 300) {
  let lastTime = 0
  return function (...args) {
    const now = Date.now()
    if (now - lastTime >= delay) {
      fn.apply(this, args)
      lastTime = now
    }
  }
}

/**
 * 生成 UUID v4
 * @returns {string} UUID 字符串
 * @example
 * uuid() // 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
 */
export function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

/**
 * 解析 URL 参数
 * @param {string} url - URL 字符串
 * @returns {Object} 参数对象
 * @example
 * parseUrl('http://example.com?name=test&age=18') // { name: 'test', age: '18' }
 */
export function parseUrl(url) {
  const params = {}
  const queryString = url.split('?')[1]
  if (!queryString) return params
  
  const pairs = queryString.split('&')
  pairs.forEach(pair => {
    const [key, value] = pair.split('=').map(decodeURIComponent)
    params[key] = value
  })
  
  return params
}

/**
 * 格式化文件大小
 * @param {number} bytes - 字节数
 * @returns {string} 格式化后的大小字符串
 * @example
 * formatSize(1024) // '1 KB'
 * formatSize(1048576) // '1 MB'
 */
export function formatSize(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 生成指定范围内的随机整数
 * @param {number} min - 最小值（包含）
 * @param {number} max - 最大值（包含）
 * @returns {number} 随机整数
 * @example
 * random(1, 10) // 1-10 之间的随机整数
 */
export function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// 导出所有工具函数（移除了与 npm cat-tools 重复的 isNullorUndefined）
export const catTools = {
  dateFormat,
  debounce,
  throttle,
  uuid,
  parseUrl,
  formatSize,
  random
}

export default catTools