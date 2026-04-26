<template>
  <Teleport to="body">
    <Transition name="search-modal">
      <div v-if="show" class="search-modal-overlay" @click.self="closeModal">
        <div class="search-modal" role="dialog" aria-modal="true" aria-label="路由搜索">
          <!-- 搜索输入框 -->
          <div class="search-input-wrapper">
            <el-icon class="search-icon"><Search /></el-icon>
            <input
              ref="searchInputRef"
              v-model="search.query.value"
              type="text"
              class="search-input"
              placeholder="搜索路由"
              @input="handleInput"
              @keydown="handleKeydown"
            />
            <kbd class="kbd">ESC</kbd>
          </div>
          
          <!-- 搜索结果列表 -->
          <div v-if="search.hasResults.value" class="search-results">
            <div
              v-for="(result, index) in search.results.value"
              :key="index"
              :class="['result-item', { active: index === search.activeIndex.value }]"
              @click="selectResult(result.item)"
              @mouseenter="search.activeIndex.value = index"
            >
              <div class="result-content">
                <!-- 面包屑路径 -->
                <div class="result-breadcrumb">
                  <span v-for="(title, i) in result.item.title" :key="i" class="breadcrumb-item">
                    {{ title }}
                    <span v-if="i < result.item.title.length - 1" class="breadcrumb-separator"> &gt; </span>
                  </span>
                </div>
                <!-- 路由路径 -->
                <div v-if="result.item.path" class="result-path">{{ result.item.path }}</div>
              </div>
              <!-- 路由图标 -->
              <SvgIcon v-if="result.item.icon" :icon-class="result.item.icon" class="result-icon" />
              <el-icon v-else class="result-icon"><Guide /></el-icon>
            </div>
          </div>
          
          <!-- 空状态 -->
          <div v-else-if="search.isEmptySearch.value" class="search-empty">
            <div class="empty-icon">
              <el-icon :size="48"><Search /></el-icon>
            </div>
            <p class="empty-text">未找到相关路由</p>
          </div>
          
          <!-- 页脚提示 -->
          <div class="search-footer">
            <div class="footer-hints">
              <span class="hint-item">
                <kbd class="kbd">↑↓</kbd>
                <span class="hint-text">导航</span>
              </span>
              <span class="hint-item">
                <kbd class="kbd">↵</kbd>
                <span class="hint-text">选择</span>
              </span>
              <span class="hint-item">
                <kbd class="kbd">ESC</kbd>
                <span class="hint-text">关闭</span>
              </span>
            </div>
            <div class="footer-brand">
              <span class="brand-text">由路由搜索提供支持</span>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useRouteSearch } from '@/composables/useRouteSearch'
import { Search, Guide } from '@element-plus/icons-vue'
import { isHttp } from '@/composables/useValidator'
import { useRouter } from 'vue-router'

// 使用搜索 composable
const search = useRouteSearch()

// 组件状态
const show = ref(false)
const searchInputRef = ref<HTMLInputElement | null>(null)

// 获取路由实例
const router = useRouter()

// 暴露方法给父组件
defineExpose({
  open: openModal,
  close: closeModal
})

/**
 * 打开搜索模态框
 */
function openModal() {
  show.value = true
  // 等待 DOM 更新后聚焦输入框
  nextTick(() => {
    searchInputRef.value?.focus()
  })
  // 锁定背景滚动
  document.body.style.overflow = 'hidden'
}

/**
 * 关闭搜索模态框
 */
function closeModal() {
  show.value = false
  search.resetSearch()
  // 恢复背景滚动
  document.body.style.overflow = ''
}

/**
 * 处理输入事件
 */
function handleInput() {
  search.handleSearch()
}

/**
 * 处理键盘事件
 */
function handleKeydown(event: KeyboardEvent) {
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      search.navigateDown()
      break
    case 'ArrowUp':
      event.preventDefault()
      search.navigateUp()
      break
    case 'Enter':
      event.preventDefault()
      const selectedItem = search.selectCurrentResult()
      if (selectedItem) {
        selectResult(selectedItem)
      }
      break
    case 'Escape':
      event.preventDefault()
      closeModal()
      break
  }
}

/**
 * 选择搜索结果
 */
function selectResult(item: any) {
  const path = item.path
  if (!path) {
    // 搜索历史记录，重新搜索
    search.query.value = item.title[0]
    search.handleSearch()
    return
  }
  
  if (isHttp(path)) {
    // 外部链接，新窗口打开
    const pindex = path.indexOf('http')
    window.open(path.substr(pindex, path.length), '_blank')
  } else {
    // 内部路由跳转
    router.push(path)
  }
  
  closeModal()
}

// 监听全局键盘快捷键 Ctrl+K / Cmd+K
onMounted(() => {
  const handleGlobalKeydown = (event: KeyboardEvent) => {
    // 检测 Ctrl+K 或 Cmd+K
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault()
      if (show.value) {
        closeModal()
      } else {
        openModal()
      }
    }
  }
  
  window.addEventListener('keydown', handleGlobalKeydown)
  
  // 清理函数
  onUnmounted(() => {
    window.removeEventListener('keydown', handleGlobalKeydown)
  })
})
</script>

<style lang="scss" src="./SearchModal.scss" scoped></style>
