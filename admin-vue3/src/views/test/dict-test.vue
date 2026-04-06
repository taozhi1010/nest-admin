<template>
  <div class="dict-test-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>字典数据测试页面</span>
          <el-button type="primary" @click="refreshDicts">刷新字典</el-button>
        </div>
      </template>
      
      <div class="test-section">
        <h3>当前加载的字典类型数量: {{ dictCount }}</h3>
        
        <h4>sys_normal_disable 字典数据:</h4>
        <el-table :data="sys_normal_disable || []" border style="width: 100%; margin-bottom: 20px;">
          <el-table-column prop="label" label="标签" />
          <el-table-column prop="value" label="值" />
          <el-table-column prop="elTagType" label="标签类型" />
        </el-table>
        
        <h4>sys_user_sex 字典数据:</h4>
        <el-table :data="sys_user_sex || []" border style="width: 100%;">
          <el-table-column prop="label" label="标签" />
          <el-table-column prop="value" label="值" />
          <el-table-column prop="elTagType" label="标签类型" />
        </el-table>
        
        <h4>所有已加载的字典类型:</h4>
        <el-tag v-for="(dict, key) in allDicts" :key="key" style="margin: 5px;">
          {{ key }}
        </el-tag>
      </div>
    </el-card>
  </div>
</template>

<script setup name="DictTest">
import { ref, computed, onMounted } from 'vue'
import useDictStore from '@/store/modules/dict'
import { useDict } from '@/composables/useDict'

const dictStore = useDictStore()

// 使用 useDict 获取特定字典
const { sys_normal_disable, sys_user_sex } = useDict('sys_normal_disable', 'sys_user_sex')

// 计算所有已加载的字典
const allDicts = computed(() => {
  const dicts = {}
  dictStore.dict.forEach(item => {
    dicts[item.key] = item.value
  })
  return dicts
})

// 字典类型数量
const dictCount = computed(() => {
  return Object.keys(allDicts.value).length
})

// 刷新字典
const refreshDicts = async () => {
  await dictStore.initDict()
}

onMounted(() => {
  console.log('测试页面 - 所有字典:', allDicts.value)
  console.log('测试页面 - sys_normal_disable:', sys_normal_disable)
  console.log('测试页面 - sys_user_sex:', sys_user_sex)
})
</script>

<style scoped>
.dict-test-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.test-section h3,
.test-section h4 {
  margin: 15px 0 10px 0;
  color: #303133;
}
</style>
