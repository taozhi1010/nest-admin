/**
 * catTools - 全局工具函数库
 * 提供常用的工具方法
 */

import dayjs from 'dayjs'

// 日期格式化
export function dateFormat(date, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!date) return ''
  return dayjs(date).format(format)
}

// 深拷贝
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime())
  if (obj instanceof Array) return obj.map(item => deepClone(item))
  if (obj instanceof Object) {
    const clonedObj = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
}

// 防抖函数
export function debounce(fn, delay = 300) {
  let timer = null
  return function (...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

// 节流函数
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

// 生成 UUID
export function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// 解析 URL 参数
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

// 格式化文件大小
export function formatSize(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 随机数
export function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// 导出所有工具函数
export const catTools = {
  dateFormat,
  deepClone,
  debounce,
  throttle,
  uuid,
  parseUrl,
  formatSize,
  random
}

export default catTools