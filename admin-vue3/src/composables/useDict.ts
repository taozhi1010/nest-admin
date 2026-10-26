import useDictStore from '@/store/modules/dict'

export interface UseDictOptions {
  /** 是否实时获取：同时绕过本地缓存与后端 Redis 缓存 */
  fresh?: boolean
}

/**
 * 获取字典数据
 * 默认使用本地持久化缓存，只有缺失的类型才会发请求
 * @param args 字典类型数组，末尾可传 { fresh: true } 实时获取
 * @returns 包含字典数据和辅助方法的对象
 * @example
 * const { sys_user_sex, sys_normal_disable } = useDict('sys_user_sex', 'sys_normal_disable')
 * const { sys_user_sex } = useDict('sys_user_sex', { fresh: true })
 */
export function useDict(...args: Array<string | UseDictOptions>) {
  const dictStore = useDictStore()

  const options = args.find((arg): arg is UseDictOptions => typeof arg === 'object' && arg !== null) || {}
  const fresh = options.fresh === true
  const dictTypes = args.filter((arg): arg is string => typeof arg === 'string')

  // 使用 reactive 创建响应式对象，确保所有属性都是响应式的
  const dictData = reactive<Record<string, any[]>>({})

  dictTypes.forEach((dictType) => {
    // 优先展示已有缓存，避免实时刷新时界面闪烁
    const cachedDict = dictStore.getDict(dictType)
    dictData[dictType] = cachedDict || []

    if (fresh || !cachedDict) {
      dictStore.loadDict(dictType, { fresh }).then((data) => {
        dictData[dictType] = data
      }).catch((error) => {
        console.error(`[字典] 加载失败 (${dictType}):`, error)
        dictData[dictType] = dictData[dictType] || [] // 失败时保持已有数据或空数组
      })
    }
  })

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
    ...toRefs(dictData),
    getDictLabel,
    getDictTagType
  }
}
