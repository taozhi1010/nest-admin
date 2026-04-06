<template>
  <div class="cat-tools-demo">
    <h2>Cat-Tools 工具库使用示例</h2>
    
    <el-card class="demo-card">
      <template #header>
        <div class="card-header">
          <span>基本工具函数测试</span>
        </div>
      </template>
      
      <el-space direction="vertical" style="width: 100%">
        <div>
          <strong>isNullorUndefined 测试:</strong><br>
          null: {{ catTools.isNullorUndefined(null) }}<br>
          undefined: {{ catTools.isNullorUndefined(undefined) }}<br>
          'test': {{ catTools.isNullorUndefined('test') }}<br>
          0: {{ catTools.isNullorUndefined(0) }}
        </div>
        
        <div>
          <strong>deepCopy 测试:</strong><br>
          原始对象: {{ originalObj }}<br>
          深拷贝: {{ copiedObj }}<br>
          是否相同引用: {{ originalObj === copiedObj }}
        </div>
        
        <div>
          <strong>isNumber 测试:</strong><br>
          123: {{ catTools.isNumber(123) }}<br>
          '123': {{ catTools.isNumber('123') }}<br>
          NaN: {{ catTools.isNumber(NaN) }}<br>
          Infinity: {{ catTools.isNumber(Infinity) }}
        </div>
        
        <div>
          <strong>uniqueArr 测试:</strong><br>
          原始数组: [1, 2, 2, 3, 3, 4]<br>
          去重后: {{ uniqueArray }}
        </div>
        
        <div>
          <strong>toThousandFilter 测试:</strong><br>
          1234567.89: {{ catTools.toThousandFilter(1234567.89) }}
        </div>
      </el-space>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { catTools } from 'cat-tools'

// 响应式数据
const originalObj = ref({ a: 1, b: { c: 2 }, d: [1, 2, 3] })
const copiedObj = ref({})
const uniqueArray = ref([])

onMounted(() => {
  // 执行深拷贝测试
  copiedObj.value = catTools.deepCopy(originalObj.value)
  
  // 执行数组去重测试
  uniqueArray.value = catTools.uniqueArr([1, 2, 2, 3, 3, 4])
})
</script>

<style scoped>
.cat-tools-demo {
  padding: 20px;
}

.demo-card {
  margin-top: 20px;
}

.card-header {
  font-weight: bold;
}
</style>