import { getDicts, getAllDicts } from '@/api/system/dict/data'
import { optionselect } from '@/api/system/dict/type'

const useDictStore = defineStore('dict', {
  state: () => ({
    dict: new Array(),
    loadedTypes: new Set() // 记录已加载的字典类型
  }),
  actions: {
    // 获取字典
    getDict(_key) {
      if (_key == null && _key == '') {
        return null
      }
      try {
        for (let i = 0; i < this.dict.length; i++) {
          if (this.dict[i].key == _key) {
            return this.dict[i].value
          }
        }
      } catch (e) {
        return null
      }
    },
    // 设置字典
    setDict(_key, value) {
      if (_key !== null && _key !== '') {
        // 检查是否已存在，如果存在则更新
        const existingIndex = this.dict.findIndex(item => item.key === _key)
        if (existingIndex !== -1) {
          this.dict[existingIndex].value = value
        } else {
          this.dict.push({
            key: _key,
            value: value
          })
        }
      }
    },
    // 删除字典
    removeDict(_key) {
      var bln = false
      try {
        for (let i = 0; i < this.dict.length; i++) {
          if (this.dict[i].key == _key) {
            this.dict.splice(i, 1)
            return true
          }
        }
      } catch (e) {
        bln = false
      }
      return bln
    },
    // 清空字典
    cleanDict() {
      this.dict = new Array()
      this.loadedTypes.clear()
    },
    // 标记字典类型为已加载
    markTypeAsLoaded(dictType) {
      this.loadedTypes.add(dictType)
    },
    // 检查字典类型是否已加载
    isTypeLoaded(dictType) {
      return this.loadedTypes.has(dictType)
    },
    // 异步加载单个字典
    async loadDict(dictType) {
      if (this.isTypeLoaded(dictType)) {
        return this.getDict(dictType)
      }
      
      try {
        const resp = await getDicts(dictType)
        const dictData = resp.data.map((p) => ({ 
          label: p.dictLabel, 
          value: p.dictValue, 
          elTagType: p.listClass, 
          elTagClass: p.cssClass 
        }))
        this.setDict(dictType, dictData)
        this.markTypeAsLoaded(dictType)
        return dictData
      } catch (error) {
        console.error(`加载字典 ${dictType} 失败:`, error)
        return []
      }
    },
    // 初始字典 - 一次性加载所有字典
    async initDict() {
      try {
        // 调用新接口一次性获取所有字典数据
        const response = await getAllDicts()
        const allDicts = response.data || {}
        
        // 处理不同的返回格式
        if (Array.isArray(allDicts)) {
          // 格式 A: 返回的是字典项数组 [{dictType, dictLabel, dictValue, ...}]
          const groupedDicts = {}
          allDicts.forEach(item => {
            const dictType = item.dictType
            if (dictType) {
              if (!groupedDicts[dictType]) {
                groupedDicts[dictType] = []
              }
              groupedDicts[dictType].push(item)
            }
          })
          
          // 处理分组后的数据
          for (const [dictType, dictDataList] of Object.entries(groupedDicts)) {
            const formattedDictData = dictDataList.map((p) => ({ 
              label: p.dictLabel, 
              value: p.dictValue, 
              elTagType: p.listClass, 
              elTagClass: p.cssClass 
            }))
            this.setDict(dictType, formattedDictData)
            this.markTypeAsLoaded(dictType)
          }
        } else if (typeof allDicts === 'object') {
          // 格式 B: 返回的是对象 {dictType: [items]}
          for (const [dictType, dictDataList] of Object.entries(allDicts)) {
            if (dictType && Array.isArray(dictDataList)) {
              const formattedDictData = dictDataList.map((p) => ({ 
                label: p.dictLabel, 
                value: p.dictValue, 
                elTagType: p.listClass, 
                elTagClass: p.cssClass 
              }))
              this.setDict(dictType, formattedDictData)
              this.markTypeAsLoaded(dictType)
            }
          }
        }
        
        console.log('[字典] 全量加载完成，已缓存', this.dict.length, '个字典类型')
      } catch (error) {
        // 如果新接口失败，回退到原有方式
        console.warn('[字典] 全量接口不可用，使用逐个加载方式')
        await this.initDictFallback()
      }
    },
    
    // 回退方案：原有的字典加载方式
    async initDictFallback() {
      try {
        // 获取所有字典类型
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
