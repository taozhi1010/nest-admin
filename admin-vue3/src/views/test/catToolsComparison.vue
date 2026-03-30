<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!-- 左侧：Composable 方式 -->
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <el-tag type="success">推荐</el-tag>
              <span style="margin-left: 10px">Composable 方式 (useCatTools)</span>
            </div>
          </template>
          
          <el-form label-width="100px" size="default">
            <el-form-item label="日期格式化">
              <div>{{ composableFormattedDate }}</div>
            </el-form-item>
            
            <el-form-item label="深拷贝">
              <el-button @click="composableDeepClone">执行深拷贝</el-button>
              <div v-if="composableCloned" style="margin-top: 5px">
                结果：{{ JSON.stringify(composableCloned) }}
              </div>
            </el-form-item>
            
            <el-form-item label="UUID 生成">
              <el-button @click="composableUuid">生成 UUID</el-button>
              <div v-if="composableUuidResult" style="margin-top: 5px">
                {{ composableUuidResult }}
              </div>
            </el-form-item>
            
            <el-form-item label="防抖测试">
              <el-button @click="composableDebounceTest">触发防抖</el-button>
              <div>次数：{{ composableDebounceCount }}</div>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <!-- 右侧：全局属性方式 -->
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <el-tag type="info">传统</el-tag>
              <span style="margin-left: 10px">全局属性方式 (devTools)</span>
            </div>
          </template>
          
          <el-form label-width="100px" size="default">
            <el-form-item label="日期格式化">
              <div>{{ globalFormattedDate }}</div>
            </el-form-item>
            
            <el-form-item label="深拷贝">
              <el-button @click="globalDeepClone">执行深拷贝</el-button>
              <div v-if="globalCloned" style="margin-top: 5px">
                结果：{{ JSON.stringify(globalCloned) }}
              </div>
            </el-form-item>
            
            <el-form-item label="UUID 生成">
              <el-button @click="globalUuid">生成 UUID</el-button>
              <div v-if="globalUuidResult" style="margin-top: 5px">
                {{ globalUuidResult }}
              </div>
            </el-form-item>
            
            <el-form-item label="防抖测试">
              <el-button @click="globalDebounceTest">触发防抖</el-button>
              <div>次数：{{ globalDebounceCount }}</div>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>

    <!-- 底部对比说明 -->
    <el-card style="margin-top: 20px">
      <template #header>
        <span>📊 两种方案对比</span>
      </template>
      
      <el-table :data="comparisonData" stripe border>
        <el-table-column prop="feature" label="特性" width="150" />
        <el-table-column prop="composable" label="Composable 方式" />
        <el-table-column prop="global" label="全局属性方式" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup name="CatToolsComparison">
import { ref, computed } from 'vue'
import { useCatTools } from '@/composables/useCatTools'
import dayjs from 'dayjs'

// ==================== Composable 方式 ====================
const { dateFormat, deepClone, uuid, debounce } = useCatTools()

const testObj = { name: 'test', value: 123 }
const composableCloned = ref(null)
const composableUuidResult = ref('')
const composableDebounceCount = ref(0)

const composableFormattedDate = computed(() => {
  return dateFormat(new Date(), 'YYYY-MM-DD HH:mm:ss')
})

const composableDeepClone = () => {
  composableCloned.value = deepClone(testObj)
  console.log('Composable 深拷贝:', composableCloned.value)
}

const composableUuid = () => {
  composableUuidResult.value = uuid()
  console.log('Composable UUID:', composableUuidResult.value)
}

const debouncedFn = debounce(() => {
  composableDebounceCount.value++
}, 500)

const composableDebounceTest = () => {
  debouncedFn()
}

// ==================== 全局属性方式 ====================
import { getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()

const globalCloned = ref(null)
const globalUuidResult = ref('')
const globalDebounceCount = ref(0)

const globalFormattedDate = computed(() => {
  return proxy.devTools.dateFormat(new Date(), 'YYYY-MM-DD HH:mm:ss')
})

const globalDeepClone = () => {
  globalCloned.value = proxy.devTools.deepClone(testObj)
  console.log('Global 深拷贝:', globalCloned.value)
}

const globalUuid = () => {
  globalUuidResult.value = proxy.devTools.uuid()
  console.log('Global UUID:', globalUuidResult.value)
}

const globalDebouncedFn = proxy.devTools.debounce(() => {
  globalDebounceCount.value++
}, 500)

const globalDebounceTest = () => {
  globalDebouncedFn()
}

// ==================== 对比数据 ====================
const comparisonData = [
  {
    feature: '导入方式',
    composable: '按需导入（推荐）',
    global: '通过 this.$proxy 访问'
  },
  {
    feature: 'TypeScript 支持',
    composable: '✅ 完整的类型推断',
    global: '⚠️ 需要额外类型声明'
  },
  {
    feature: '代码可读性',
    composable: '✅ 清晰明确',
    global: '✅ 简洁'
  },
  {
    feature: 'Tree Shaking',
    composable: '✅ 支持',
    global: '❌ 不支持'
  },
  {
    feature: '单元测试',
    composable: '✅ 易于测试',
    global: '⚠️ 需要 mock'
  },
  {
    feature: 'Vue 3 规范',
    composable: '✅ 完全符合',
    global: '⚠️ Vue 2 风格'
  }
]
</script>

<style scoped>
.card-header {
  display: flex;
  align-items: center;
}
</style>
