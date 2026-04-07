import { parseTime as _parseTime, addDateRange as _addDateRange, handleTree as _handleTree } from '@/utils/ruoyi'
import { download as _download } from './useRequest'
import type { FormInstance } from 'element-plus'
import { getCurrentInstance } from 'vue'

// 单独导出各个工具函数
export const parseTime = _parseTime
export const addDateRange = _addDateRange
export const handleTree = _handleTree
export const download = _download

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
 * const { parseTime, resetForm, handleTree, download } = useCommon()
 */
export function useCommon() {
  return {
    parseTime,
    resetForm,
    addDateRange,
    handleTree,
    download
  }
}
