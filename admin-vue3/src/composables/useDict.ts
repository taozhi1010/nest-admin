import { useDict as originalUseDict } from '@/utils/dict'

/**
 * 字典 Composable
 * @example
 * const { sys_user_type, getDictData } = useDict('sys_user_type')
 */
export function useDict(...args: string[]) {
  const result = originalUseDict(...args)

  /**
   * 获取字典标签
   * @param type 字典类型
   * @param value 字典值
   * @returns 字典标签
   */
  const getDictData = (type: string, value: number | string) => {
    const dict = result[type]
    if (!dict || !dict.value) return null

    const item = dict.value.find((item: any) => {
      return item.dictValue === value.toString()
    })

    return item ? item.dictLabel : null
  }

  return {
    ...result,
    getDictData
  }
}
