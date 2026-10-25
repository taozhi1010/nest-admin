import useDictStore from '@/store/modules/dict'

/**
 * 获取字典数据
 * 默认使用本地持久化缓存，只有缺失的类型才会发请求
 * 末尾可传 { fresh: true } 绕过本地缓存与后端缓存
 */
export function useDict(...args) {
  const dictStore = useDictStore()

  const options = args.find((arg) => typeof arg === 'object' && arg !== null) || {}
  const fresh = options.fresh === true
  const dictTypes = args.filter((arg) => typeof arg === 'string')

  const res = ref({})

  dictTypes.forEach((dictType) => {
    // 优先展示已有缓存，避免实时刷新时界面闪烁
    const cachedDict = dictStore.getDict(dictType)
    res.value[dictType] = cachedDict || []

    if (fresh || !cachedDict) {
      dictStore
        .loadDict(dictType, { fresh })
        .then((data) => {
          res.value[dictType] = data
        })
        .catch((error) => {
          console.error(`[字典] 加载失败 (${dictType}):`, error)
        })
    }
  })

  return toRefs(res.value)
}
