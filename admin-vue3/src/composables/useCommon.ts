import { parseTime, resetForm, addDateRange, handleTree, selectDictLabel, selectDictLabels } from '@/utils/ruoyi'

/**
 * 通用工具函数 Composable
 * @example
 * const { parseTime, resetForm, handleTree } = useCommon()
 */
export function useCommon() {
  return {
    parseTime,
    resetForm,
    addDateRange,
    handleTree,
    selectDictLabel,
    selectDictLabels
  }
}
