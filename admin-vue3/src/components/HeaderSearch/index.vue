<template>
  <div class="header-search">
    <el-input
      class="search-input"
      readonly
      placeholder="搜索路由..."
      :prefix-icon="Search"
      @click="openSearch"
    >
      <template #suffix>
        <span class="kbd">Ctrl K</span>
      </template>
    </el-input>
    <SearchModal ref="searchModalRef" />
  </div>
</template>

<script setup>
import { Search } from '@element-plus/icons-vue'
import SearchModal from './components/SearchModal'

const searchModalRef = ref(null)

function openSearch() {
  searchModalRef.value?.open()
}
</script>

<style lang="scss" scoped>
.header-search {
  .search-input {
    width: 200px;
    cursor: pointer;

    :deep(.el-input__wrapper) {
      cursor: pointer;
      background-color: #f5f7fa;
      
      &:hover {
        background-color: #e4e7ed;
      }
    }

    :deep(.el-input__inner) {
      cursor: pointer;
    }

    .kbd {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 48px;
      height: 24px;
      padding: 0 6px;
      font-size: 12px;
      font-family: inherit;
      color: #909399;
      background: #fff;
      border: 1px solid #dcdfe6;
      border-radius: 6px;
      box-shadow: 0 1px 0 rgba(0, 0, 0, 0.05);
    }
  }
}
</style>
