import { getDicts, getAllDicts } from '@/api/system/dict/data'
import { optionselect } from '@/api/system/dict/type'

// ==================== 工具函数 ====================

/**
 * 格式化字典数据
 * @param {Array} dictDataList - 原始字典数据列表
 * @returns {Array} 格式化后的字典数据
 */
function formatDictData(dictDataList) {
  return dictDataList.map((item) => ({
    label: item.dictLabel,
    value: item.dictValue,
    elTagType: item.listClass,
    elTagClass: item.cssClass
  }))
}

// ==================== Store 定义 ====================

const useDictStore = defineStore('dict', {
  state: () => ({
    dict: [], // 字典缓存数组 [{ key: dictType, value: dictData[] }]
    loadedTypes: new Set() // 已加载的字典类型集合
  }),
  actions: {
    /**
     * 获取字典数据
     * @param {string} key - 字典类型
     * @returns {Array|null} 字典数据数组
     */
    getDict(key) {
      if (!key) return null
      const item = this.dict.find((d) => d.key === key)
      return item ? item.value : null
    },
    /**
     * 设置字典数据
     * @param {string} key - 字典类型
     * @param {Array} value - 字典数据数组
     */
    setDict(key, value) {
      if (!key) return
      
      const existingIndex = this.dict.findIndex((item) => item.key === key)
      if (existingIndex !== -1) {
        // 更新已存在的字典
        this.dict[existingIndex].value = value
      } else {
        // 添加新字典
        this.dict.push({ key, value })
      }
    },
    /**
     * 删除字典
     * @param {string} key - 字典类型
     * @returns {boolean} 是否删除成功
     */
    removeDict(key) {
      const index = this.dict.findIndex((item) => item.key === key)
      if (index !== -1) {
        this.dict.splice(index, 1)
        return true
      }
      return false
    },
    /**
     * 清空所有字典
     */
    cleanDict() {
      this.dict = []
      this.loadedTypes.clear()
    },
    /**
     * 标记字典类型为已加载
     * @param {string} dictType - 字典类型
     */
    markTypeAsLoaded(dictType) {
      this.loadedTypes.add(dictType)
    },
    /**
     * 检查字典类型是否已加载
     * @param {string} dictType - 字典类型
     * @returns {boolean} 是否已加载
     */
    isTypeLoaded(dictType) {
      return this.loadedTypes.has(dictType)
    },
    /**
     * 异步加载单个字典
     * @param {string} dictType - 字典类型
     * @returns {Promise<Array>} 字典数据数组
     */
    async loadDict(dictType) {
      // 如果已加载，直接返回缓存
      if (this.isTypeLoaded(dictType)) {
        return this.getDict(dictType)
      }
      
      try {
        const resp = await getDicts(dictType)
        const dictData = formatDictData(resp.data)
        this.setDict(dictType, dictData)
        this.markTypeAsLoaded(dictType)
        return dictData
      } catch (error) {
        console.error(`[字典] 加载失败 (${dictType}):`, error)
        return []
      }
    },
    /**
     * 初始化字典 - 一次性加载所有字典
     */
    async initDict() {
      try {
        const response = await getAllDicts()
        const allDicts = response.data || {}
        
        // 处理不同的返回格式
        if (Array.isArray(allDicts)) {
          // 格式 A: 返回字典项数组 [{dictType, dictLabel, dictValue, ...}]
          this.processArrayDicts(allDicts)
        } else if (typeof allDicts === 'object') {
          // 格式 B: 返回对象 {dictType: [items]}
          this.processObjectDicts(allDicts)
        }
        
        console.log('[字典] 全量加载完成，已缓存', this.dict.length, '个字典类型')
      } catch (error) {
        // 如果新接口失败，回退到原有方式
        console.warn('[字典] 全量接口不可用，使用逐个加载方式')
        await this.initDictFallback()
      }
    },
    
    /**
     * 处理数组格式的字典数据
     */
    processArrayDicts(allDicts) {
      const groupedDicts = {}
      
      // 按 dictType 分组
      allDicts.forEach((item) => {
        const dictType = item.dictType
        if (dictType) {
          if (!groupedDicts[dictType]) {
            groupedDicts[dictType] = []
          }
          groupedDicts[dictType].push(item)
        }
      })
      
      // 处理每个字典类型
      Object.entries(groupedDicts).forEach(([dictType, dictDataList]) => {
        const formattedDictData = formatDictData(dictDataList)
        this.setDict(dictType, formattedDictData)
        this.markTypeAsLoaded(dictType)
      })
    },
    
    /**
     * 处理对象格式的字典数据
     */
    processObjectDicts(allDicts) {
      Object.entries(allDicts).forEach(([dictType, dictDataList]) => {
        if (dictType && Array.isArray(dictDataList)) {
          const formattedDictData = formatDictData(dictDataList)
          this.setDict(dictType, formattedDictData)
          this.markTypeAsLoaded(dictType)
        }
      })
    },
    
    /**
     * 回退方案：原有的字典加载方式
     */
    async initDictFallback() {
      try {
        const response = await optionselect()
        const dictTypes = response.data || []
        
        // 并发加载所有字典
        const promises = dictTypes.map(async (dictType) => {
          const type = dictType.dictType || dictType.type
          if (type) {
            await this.loadDict(type)
          }
        })
        
        await Promise.all(promises)
        console.log('[字典] 逐个加载完成，已缓存', this.dict.length, '个字典类型')
      } catch (error) {
        console.error('[字典] 加载失败:', error)
      }
    }
  }
})

export default useDictStore
