import useDictStore from '@/store/modules/dict'
import { ref, toRefs } from 'vue'

/**
 * 获取字典数据
 * @param args 字典类型数组
 * @example
 * const { sys_user_sex, sys_normal_disable } = useDict('sys_user_sex', 'sys_normal_disable')
 */
export function useDict(...args: string[]) {
  const res = ref<Record<string, any[]>>({})
  const dictStore = useDictStore()
  
  args.forEach((dictType) => {
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
}
