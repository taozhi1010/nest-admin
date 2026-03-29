import { parseTime as _parseTime, resetForm as _resetForm, addDateRange as _addDateRange, handleTree as _handleTree, selectDictLabel as _selectDictLabel, selectDictLabels as _selectDictLabels } from '@/utils/ruoyi'
import { download as _download } from '@/utils/request'

// 单独导出各个工具函数
export const parseTime = _parseTime
export const resetForm = _resetForm
export const addDateRange = _addDateRange
export const handleTree = _handleTree
export const selectDictLabel = _selectDictLabel
export const selectDictLabels = _selectDictLabels
export const download = _download

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
    selectDictLabel,
    selectDictLabels,
    download
  }
}
