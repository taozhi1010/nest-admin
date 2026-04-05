import { useDict as originalUseDict } from '@/utils/dict'
import useDictStore from '@/store/modules/dict'

/**
 * 字典 Composable
 * @example
 * const { sys_user_type, getDictLabel, getDictTag } = useDict('sys_user_type')
 */
export function useDict(...args: string[]) {
  const result = originalUseDict(...args)
  const dictStore = useDictStore()

  /**
   * 获取字典标签（根据字典类型和值）
   * @param type 字典类型
   * @param value 字典值
   * @returns 字典标签
   */
  const getDictLabel = (type: string, value: number | string | undefined | null): string | number | undefined | null => {
    if (value === undefined || value === null) return value
    const dict = dictStore.getDict(type)
    if (!dict) return value

    const item = dict.find((item: any) => item.value == value)
    return item ? item.label : value
  }

  /**
   * 获取字典标签（通过当前组件已加载的字典）
   * @param type 字典类型
   * @param value 字典值
   * @returns 字典标签
   */
  const getDictData = (type: string, value: number | string) => {
    const dict = result[type]
    if (!dict || !dict.value) return null

    const item = dict.value.find((item: any) => {
      return item.value === value.toString()
    })

    return item ? item.label : null
  }

  /**
   * 获取字典项的样式类型（用于 el-tag 的 type 属性）
   * @param type 字典类型
   * @param value 字典值
   * @returns 样式类型 (default, primary, success, info, warning, danger)
   */
  const getDictTagType = (type: string, value: number | string | undefined | null): string => {
    if (value === undefined || value === null) return 'info'
    const dict = dictStore.getDict(type)
    if (!dict) return 'info'

    const item = dict.find((item: any) => item.value == value)
    return item?.elTagType || 'default'
  }

  return {
    ...result,
    getDictData,
    getDictLabel,
    getDictTagType
  }
}
