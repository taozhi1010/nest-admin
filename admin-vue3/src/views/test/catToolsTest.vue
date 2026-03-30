<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>catTools 自动引入测试</span>
        </div>
      </template>

      <el-form :model="formData" label-width="120px">
        <el-form-item label="日期格式化">
          <div>{{ formattedDate }}</div>
        </el-form-item>

        <el-form-item label="深拷贝测试">
          <el-button @click="testDeepClone">点击测试深拷贝</el-button>
          <div>原始对象：{{ originalObj }}</div>
          <div>拷贝对象：{{ clonedObj }}</div>
        </el-form-item>

        <el-form-item label="防抖测试">
          <el-button @click="testDebounce">点击触发防抖函数</el-button>
          <div>触发次数：{{ debounceCount }}</div>
        </el-form-item>

        <el-form-item label="节流测试">
          <el-button @click="testThrottle">点击触发节流函数</el-button>
          <div>触发次数：{{ throttleCount }}</div>
        </el-form-item>

        <el-form-item label="全局方法测试">
          <el-button @click="testGlobalMethod">测试 devTools</el-button>
          <div v-if="globalTestResult">结果：{{ globalTestResult }}</div>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup name="CatToolsTest">
import { ref, computed, getCurrentInstance } from 'vue'
import dayjs from 'dayjs'

// 测试 1: 直接使用 devTools (通过 getCurrentInstance)
const { proxy } = getCurrentInstance()

const formData = ref({})
const testDate = ref(new Date())

// 日期格式化
const formattedDate = computed(() => {
  // 方式 1: 使用 devTools
  return proxy.devTools.dateFormat(testDate.value, 'YYYY-MM-DD HH:mm:ss')
})

// 深拷贝测试
const originalObj = ref({ name: 'test', value: 123, nested: { a: 1 } })
const clonedObj = ref(null)

const testDeepClone = () => {
  clonedObj.value = proxy.devTools.deepClone(originalObj.value)
  // 修改原始对象，验证是否真正深拷贝
  originalObj.value.name = 'modified'
  console.log('深拷贝测试:', {
    original: originalObj.value,
    cloned: clonedObj.value
  })
}

// 防抖测试
const debounceCount = ref(0)
const debouncedFn = proxy.devTools.debounce(() => {
  debounceCount.value++
  console.log('防抖函数执行')
}, 500)

const testDebounce = () => {
  debouncedFn()
}

// 节流测试
const throttleCount = ref(0)
const throttledFn = proxy.devTools.throttle(() => {
  throttleCount.value++
  console.log('节流函数执行')
}, 1000)

const testThrottle = () => {
  throttledFn()
}

// 全局方法测试
const globalTestResult = ref(null)

const testGlobalMethod = () => {
  try {
    const result = proxy.devTools.uuid()
    globalTestResult.value = result
    console.log('UUID 生成:', result)
  } catch (error) {
    globalTestResult.value = '错误：' + error.message
  }
}
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
