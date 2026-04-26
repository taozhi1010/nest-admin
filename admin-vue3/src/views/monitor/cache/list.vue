<template>
  <div class="app-container">
    <el-row :gutter="10">
      <el-col :span="8">
        <el-card style="height: calc(100vh - 125px)">
          <template #header>
            <collection style="width: 1em; height: 1em; vertical-align: middle" />
            <span style="vertical-align: middle">缓存列表</span>
            <el-button icon="Refresh" link style="float: right; padding: 3px 0" type="primary" @click="refreshCacheNames()" />
          </template>
          <el-table v-loading="loading" :data="cacheNames" :height="tableHeight" highlight-current-row style="width: 100%" @row-click="getCacheKeys">
            <el-table-column label="序号" type="index" width="60" />

            <el-table-column align="center" :formatter="nameFormatter" label="缓存名称" prop="cacheName" :show-overflow-tooltip="true" />

            <el-table-column align="center" label="备注" prop="remark" :show-overflow-tooltip="true" />
            <el-table-column align="center" class-name="small-padding fixed-width" label="操作" width="60">
              <template #default="scope">
                <el-button icon="Delete" link type="primary" @click="handleClearCacheName(scope.row)" />
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card style="height: calc(100vh - 125px)">
          <template #header>
            <key style="width: 1em; height: 1em; vertical-align: middle" />
            <span style="vertical-align: middle">键名列表</span>
            <el-button icon="Refresh" link style="float: right; padding: 3px 0" type="primary" @click="refreshCacheKeys()" />
          </template>
          <el-table v-loading="subLoading" :data="cacheKeys" :height="tableHeight" highlight-current-row style="width: 100%" @row-click="handleCacheValue">
            <el-table-column label="序号" type="index" width="60" />
            <el-table-column align="center" :formatter="keyFormatter" label="缓存键名" :show-overflow-tooltip="true" />
            <el-table-column align="center" class-name="small-padding fixed-width" label="操作" width="60">
              <template #default="scope">
                <el-button icon="Delete" link type="primary" @click="handleClearCacheKey(scope.row)" />
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card :bordered="false" style="height: calc(100vh - 125px)">
          <template #header>
            <document style="width: 1em; height: 1em; vertical-align: middle" />
            <span style="vertical-align: middle">缓存内容</span>
            <el-button icon="Refresh" link style="float: right; padding: 3px 0" type="primary" @click="handleClearCacheAll()">清理全部</el-button>
          </template>
          <el-form :model="cacheForm">
            <el-row :gutter="32">
              <el-col :offset="1" :span="22">
                <el-form-item label="缓存名称:" prop="cacheName">
                  <el-input v-model="cacheForm.cacheName" :read-only="true" />
                </el-form-item>
              </el-col>
              <el-col :offset="1" :span="22">
                <el-form-item label="缓存键名:" prop="cacheKey">
                  <el-input v-model="cacheForm.cacheKey" :read-only="true" />
                </el-form-item>
              </el-col>
              <el-col :offset="1" :span="22">
                <el-form-item label="缓存内容:" prop="cacheValue">
                  <el-input v-model="cacheForm.cacheValue" :read-only="true" :rows="8" type="textarea" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup name="CacheList">
import { listCacheName, listCacheKey, getCacheValue, clearCacheName, clearCacheKey, clearCacheAll } from '@/api/monitor/cache'

const cacheNames = ref([])
const cacheKeys = ref([])
const cacheForm = ref({})
const loading = ref(true)
const subLoading = ref(false)
const nowCacheName = ref('')
const tableHeight = ref(window.innerHeight - 200)

// 监听窗口大小变化，动态调整表格高度
function handleResize() {
  tableHeight.value = window.innerHeight - 200
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

/** 查询缓存名称列表 */
function getCacheNames() {
  loading.value = true
  listCacheName().then((response) => {
    cacheNames.value = response.data
    loading.value = false
  })
}

/** 刷新缓存名称列表 */
function refreshCacheNames() {
  getCacheNames()
  ElMessage.success('刷新缓存列表成功')
}

/** 清理指定名称缓存 */
function handleClearCacheName(row) {
  clearCacheName(row.cacheName).then((response) => {
    ElMessage.success(`清理缓存名称[${row.cacheName}]成功`)
    getCacheKeys()
  })
}

/** 查询缓存键名列表 */
function getCacheKeys(row) {
  const cacheName = row !== undefined ? row.cacheName : nowCacheName.value
  if (cacheName === '') {
    return
  }
  subLoading.value = true
  listCacheKey(cacheName).then((response) => {
    cacheKeys.value = response.data
    subLoading.value = false
    nowCacheName.value = cacheName
  })
}

/** 刷新缓存键名列表 */
function refreshCacheKeys() {
  getCacheKeys()
  ElMessage.success('刷新键名列表成功')
}

/** 清理指定键名缓存 */
function handleClearCacheKey(cacheKey) {
  clearCacheKey(cacheKey).then((response) => {
    ElMessage.success(`清理缓存键名[${cacheKey}]成功`)
    getCacheKeys()
  })
}

/** 列表前缀去除 */
function nameFormatter(row) {
  return row.cacheName.replace(':', '')
}

/** 键名前缀去除 */
function keyFormatter(cacheKey) {
  return cacheKey.replace(nowCacheName.value, '')
}

/** 查询缓存内容详细 */
function handleCacheValue(cacheKey) {
  getCacheValue(nowCacheName.value, cacheKey).then((response) => {
    cacheForm.value = response.data
  })
}

/** 清理全部缓存 */
function handleClearCacheAll() {
  clearCacheAll().then((response) => {
    ElMessage.success('清理全部缓存成功')
  })
}

getCacheNames()

// 组件卸载时清理
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>
