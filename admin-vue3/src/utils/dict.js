import useDictStore from '@/store/modules/dict'

/**
 * 获取字典数据
 */
export function useDict(...args) {
  const res = ref({})
  const dictStore = useDictStore()
  
  return (() => {
    args.forEach((dictType, index) => {
      res.value[dictType] = []
      // 尝试从 store 中获取已缓存的字典
      const dicts = dictStore.getDict(dictType)
      if (dicts) {
        res.value[dictType] = dicts
      } else {
        // 如果未缓存，异步加载
        dictStore.loadDict(dictType).then((data) => {
          res.value[dictType] = data
        })
      }
    })
    return toRefs(res.value)
  })()
}
