import { addDateRange as _addDateRange } from '@/utils/ruoyi'
import { download as _download } from './useRequest'
import type { FormInstance } from 'element-plus'
import { getCurrentInstance } from 'vue'
import dayjs from 'dayjs'

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

// 单独导出各个工具函数
export const addDateRange = _addDateRange
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
 * 表单重置（Vue 3 Composition API 版本）
 * @param refName ref 名称或 FormInstance 实例
 */
export function resetForm(refName: string | FormInstance) {
  if (typeof refName === 'string') {
    // 如果传入的是字符串，尝试从当前组件实例获取
    const instance = getCurrentInstance()
    if (instance && instance.proxy && (instance.proxy as any).$refs[refName]) {
      ;(instance.proxy as any).$refs[refName].resetFields()
    }
  } else if (refName && typeof refName === 'object' && 'resetFields' in refName) {
    // 如果传入的是 FormInstance 实例，直接调用
    refName.resetFields()
  }
}

/**
 * 通用工具函数 Composable
 * @example
 * const { parseTime, resetForm, handleTree, download, getNormalPath } = useCommon()
 */
export function useCommon() {
  return {
    parseTime,
    resetForm,
    addDateRange,
    handleTree,
    download,
    getNormalPath
  }
}
