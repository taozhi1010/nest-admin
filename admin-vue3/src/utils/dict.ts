import useDictStore from '@/store/modules/dict'

/**
 * 获取字典数据（优化版）
 * @param args 字典类型数组
 * @returns 包含字典数据和辅助方法的对象
 * @example
 * const { sys_user_sex, sys_normal_disable } = useDict('sys_user_sex', 'sys_normal_disable')
 */
export function useDict(...args: string[]) {
  const dictStore = useDictStore()
  
  // 使用 reactive 创建响应式对象，确保所有属性都是响应式的
  const result = reactive<Record<string, any[]>>({})
  
  // 初始化所有请求的字典类型为空数组
  args.forEach((dictType) => {
    result[dictType] = []
    
    // 尝试从 store 中获取已缓存的字典
    const cachedDict = dictStore.getDict(dictType)
    if (cachedDict) {
      // 如果已有缓存，直接使用
      result[dictType] = cachedDict
    } else {
      // 如果未缓存，异步加载并更新响应式数据
      dictStore.loadDict(dictType).then((data) => {
        result[dictType] = data
      }).catch((error) => {
        console.error(`[字典] 加载失败 (${dictType}):`, error)
        result[dictType] = [] // 失败时保持空数组
      })
    }
  })
  
  // 返回响应式引用，保持与原有 API 兼容
  return toRefs(result)
}
