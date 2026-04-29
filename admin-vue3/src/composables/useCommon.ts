import { download as _download } from './useRequest'
import dayjs from 'dayjs'
import { debounce, throttle } from 'radash'

/**
 * 构造树型结构数据
 * @param data 数据源
 * @param id id字段 默认 'id'
 * @param parentId 父节点字段 默认 'parentId'
 * @param children 孩子节点字段 默认 'children'
 */
export function handleTree<T = any>(data: T[], id?: string, parentId?: string, children?: string): T[] {
  if (!Array.isArray(data)) {
    return []
  }

  const config = {
    id: id || 'id',
    parentId: parentId || 'parentId',
    childrenList: children || 'children'
  }

  const childrenMap = new Map<string | number, T[]>()
  const nodeMap = new Map<string | number, T>()
  const result: T[] = []

  // 1. 建立映射关系
  for (const item of data) {
    const pid = (item as any)[config.parentId]
    const idVal = (item as any)[config.id]
    
    if (!childrenMap.has(pid)) childrenMap.set(pid, [])
    childrenMap.get(pid)!.push(item)
    nodeMap.set(idVal, item)
  }

  // 2. 组装树结构
  for (const item of data) {
    const pid = (item as any)[config.parentId]
    if (!nodeMap.has(pid)) {
      result.push(item)
    }
    const children = childrenMap.get((item as any)[config.id])
    if (children) {
      (item as any)[config.childrenList] = children
    }
  }

  return result
}

// 格式映射：兼容旧的 {y} 格式
const formatMap: Record<string, string> = {
  '{y}': 'YYYY',
  '{m}': 'MM',
  '{d}': 'DD',
  '{h}': 'HH',
  '{i}': 'mm',
  '{s}': 'ss',
}

/**
 * 日期格式化（使用 dayjs）
 */
export function parseTime(time: any, pattern = '{y}-{m}-{d} {h}:{i}:{s}') {
  if (arguments.length === 0 || !time) return null
  let format = pattern
  for (const k in formatMap) {
    format = format.replace(new RegExp(k.replace(/[{}]/g, '\\$&'), 'g'), formatMap[k])
  }
  return dayjs(time).format(format)
}

/**
 * 添加日期范围参数
 * 替代原 ruoyi.js 中的 addDateRange 方法
 * @param params 查询参数对象
 * @param dateRange 日期范围数组 [开始时间, 结束时间]
 * @param propName 属性名称前缀（可选）
 * @returns 添加了日期范围的参数对象
 */
export function addDateRange(
  params: any,
  dateRange: string[],
  propName?: string
) {
  const search = params
  search.params =
    typeof search.params === 'object' &&
    search.params !== null &&
    !Array.isArray(search.params)
      ? search.params
      : {}
  
  const range = Array.isArray(dateRange) ? dateRange : []
  
  if (typeof propName === 'undefined') {
    search.params['beginTime'] = range[0]
    search.params['endTime'] = range[1]
  } else {
    search.params[`begin${propName}`] = range[0]
    search.params[`end${propName}`] = range[1]
  }
  
  return search
}

/**
 * 转换字符串，将 undefined、null 等转化为空字符串
 * 替代原 ruoyi.js 中的 parseStrEmpty 方法
 * @param str 待转换的字符串
 * @returns 转换后的字符串
 */
export function parseStrEmpty(str: any): string {
  if (!str || str === 'undefined' || str === 'null') {
    return ''
  }
  return String(str)
}

// 单独导出各个工具函数
export const download = _download

/**
 * 返回规范化路径（移除多余的 /）
 * @param path 路径字符串
 */
export function getNormalPath(path: string): string {
  if (!path || path.length === 0 || path === 'undefined') {
    return path
  }
  // 替换连续斜杠为单个斜杠
  let res = path.replace(/\/+/g, '/')
  // 移除末尾斜杠
  if (res.length > 1 && res.endsWith('/')) {
    res = res.slice(0, -1)
  }
  return res
}

/**
 * 创建防抖函数
 * 
 * 防抖：在事件被触发 n 秒后再执行回调，如果 n 秒内又被触发，则重新计时
 * 适用场景：搜索框输入、窗口 resize、表单验证等
 * 
 * @param fn 要执行的函数
 * @param delay 延迟时间（毫秒），默认 300ms
 * @returns 防抖后的函数
 * @example
 * const handleSearch = useDebounce((value) => {
 *   console.log('搜索:', value)
 * }, 300)
 */
export function useDebounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
) {
  return debounce({ delay }, fn)
}

/**
 * 创建节流函数
 * 
 * 节流：规定在一个单位时间内，只能触发一次函数。如果这个单位时间内触发多次函数，只有一次生效
 * 适用场景：滚动事件、按钮点击防止重复提交、鼠标移动等
 * 
 * @param fn 要执行的函数
 * @param interval 间隔时间（毫秒），默认 300ms
 * @returns 节流后的函数
 * @example
 * const handleScroll = useThrottle(() => {
 *   console.log('滚动')
 * }, 100)
 */
export function useThrottle<T extends (...args: any[]) => any>(
  fn: T,
  interval: number = 300
) {
  return throttle({ interval }, fn)
}

/**
 * 通用工具函数 Composable
 * @example
 * const { parseTime, handleTree, download, getNormalPath, useDebounce, useThrottle } = useCommon()
 */
export function useCommon() {
  return {
    parseTime,
    addDateRange,
    handleTree,
    download,
    getNormalPath,
    useDebounce,
    useThrottle
  }
}
