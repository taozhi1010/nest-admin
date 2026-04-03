import { getDicts } from '@/api/system/dict/data'
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
        // 获取所有字典类型
        const response = await optionselect()
        const dictTypes = response.data || []
        
        console.log('开始加载字典，共', dictTypes.length, '个类型')
        
        // 并发加载所有字典
        const promises = dictTypes.map(async (dictType) => {
          const type = dictType.dictType || dictType.type
          if (type) {
            await this.loadDict(type)
          }
        })
        
        await Promise.all(promises)
        console.log('字典加载完成，已缓存', this.dict.length, '个字典类型')
      } catch (error) {
        console.error('初始化字典失败:', error)
      }
    }
  }
})

export default useDictStore
