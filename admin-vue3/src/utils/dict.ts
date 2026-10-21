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
  const result = reactive<Record<string, any[]>>({})

  dictTypes.forEach((dictType) => {
    // 优先展示已有缓存，避免实时刷新时界面闪烁
    const cachedDict = dictStore.getDict(dictType)
    result[dictType] = cachedDict || []

    if (fresh || !cachedDict) {
      dictStore.loadDict(dictType, { fresh }).then((data) => {
        result[dictType] = data
      }).catch((error) => {
        console.error(`[字典] 加载失败 (${dictType}):`, error)
        result[dictType] = result[dictType] || [] // 失败时保持已有数据或空数组
      })
    }
  })

  // 返回响应式引用，保持与原有 API 兼容
  return toRefs(result)
}
