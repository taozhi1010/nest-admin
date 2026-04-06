<template>
  <div class="use-cat-tools-demo">
    <h2>useCatTools Composable 使用示例</h2>
    
    <el-card class="demo-card">
      <template #header>
        <div class="card-header">
          <span>整合版工具函数测试</span>
        </div>
      </template>
      
      <el-space direction="vertical" style="width: 100%">
        <div>
          <strong>本地工具函数 - dateFormat:</strong><br>
          当前时间: {{ formattedDate }}
        </div>
        
        <div>
          <strong>npm cat-tools - isNullorUndefined:</strong><br>
          null: {{ checkNull(null) }}<br>
          undefined: {{ checkNull(undefined) }}<br>
          'test': {{ checkNull('test') }}
        </div>
        
        <div>
          <strong>npm cat-tools - deepCopy:</strong><br>
          原始对象: {{ originalObj }}<br>
          深拷贝: {{ copiedObj }}<br>
          是否相同引用: {{ originalObj === copiedObj }}
        </div>
        
        <div>
          <strong>npm cat-tools - uniqueArr:</strong><br>
          原始数组: [1, 2, 2, 3, 3, 4]<br>
          去重后: {{ uniqueArray }}
        </div>
        
        <div>
          <strong>npm cat-tools - isNumber:</strong><br>
          123: {{ checkNumber(123) }}<br>
          '123': {{ checkNumber('123') }}<br>
          NaN: {{ checkNumber(NaN) }}
        </div>
        
        <div>
          <strong>本地工具函数 - debounce (点击测试):</strong><br>
          <el-button @click="debouncedClick">点击我（防抖）</el-button>
          <div>点击次数: {{ clickCount }}</div>
        </div>
      </el-space>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useCatTools } from '@/composables/useCatTools'

// 使用 useCatTools composable
const { 
  dateFormat, 
  isNullorUndefined, 
  deepCopy, 
  uniqueArr, 
  isNumber,
  debounce 
} = useCatTools()

// 响应式数据
const formattedDate = ref('')
const originalObj = ref({ a: 1, b: { c: 2 }, d: [1, 2, 3] })
const copiedObj = ref({})
const uniqueArray = ref([])
const clickCount = ref(0)

// 方法
const checkNull = (val) => isNullorUndefined(val)
const checkNumber = (val) => isNumber(val)

// 防抖点击处理
const handleDebouncedClick = () => {
  clickCount.value++
  console.log('防抖点击触发，次数:', clickCount.value)
}

const debouncedClick = debounce(handleDebouncedClick, 500)

onMounted(() => {
  // 格式化当前日期
  formattedDate.value = dateFormat(new Date())
  
  // 执行深拷贝测试
  copiedObj.value = deepCopy(originalObj.value)
  
  // 执行数组去重测试
  uniqueArray.value = uniqueArr([1, 2, 2, 3, 3, 4])
})
</script>

<style scoped>
.use-cat-tools-demo {
  padding: 20px;
}

.demo-card {
  margin-top: 20px;
}

.card-header {
  font-weight: bold;
}
</style>