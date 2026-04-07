import { mergeRecursive } from '@/utils/ruoyi'
import dictConverter from './DictConverter'
import useDictStore from '@/store/modules/dict'

export const options = {
  metas: {
    '*': {
      /**
       * 字典请求，方法签名为 function(dictMeta: DictMeta): Promise
       */
      request: async (dictMeta) => {
        console.log(`load dict ${dictMeta.type}`)
        const dictStore = useDictStore()
        
        // 如果字典已加载，直接返回
        if (dictStore.isTypeLoaded(dictMeta.type)) {
          return { content: dictStore.getDict(dictMeta.type) }
        }
        
        // 否则异步加载
        try {
          const dictData = await dictStore.loadDict(dictMeta.type)
          return { content: dictData }
        } catch (error) {
          console.error(`加载字典 ${dictMeta.type} 失败:`, error)
          return { content: [] }
        }
      },
      /**
       * 字典响应数据转换器，方法签名为 function(response: Object, dictMeta: DictMeta): DictData
       */
      responseConverter,
      labelField: 'label',
      valueField: 'value'
    }
  },
  /**
   * 默认标签字段
   */
  DEFAULT_LABEL_FIELDS: ['label', 'name', 'title'],
  /**
   * 默认值字段
   */
  DEFAULT_VALUE_FIELDS: ['value', 'id', 'uid', 'key']
}

/**
 * 映射字典
 * @param {Object} response 字典数据
 * @param {DictMeta} dictMeta 字典元数据
 * @returns {DictData}
 */
function responseConverter(response, dictMeta) {
  const dicts = response.content instanceof Array ? response.content : response
  if (dicts === undefined) {
    console.warn(`no dict data of "${dictMeta.type}" found in the response`)
    return []
  }
  return dicts.map((d) => dictConverter(d, dictMeta))
}

export function mergeOptions(src) {
  mergeRecursive(options, src)
}

export default options
