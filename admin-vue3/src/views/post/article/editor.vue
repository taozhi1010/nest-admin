<template>
  <div class="article-editor-container">
    <!-- 顶部标题栏 -->
    <div class="editor-header">
      <el-input
        v-model="title"
        class="title-input"
        placeholder="输入文章标题..."
        @input="handleTitleInput"
      />
      <div class="header-actions">
        <span class="auto-save-tip">文章将自动保存至草稿箱</span>
        <el-button @click="handleSaveDraft">草稿箱</el-button>
        <el-button type="primary" @click="handlePublish">发布</el-button>
      </div>
    </div>

    <!-- MD 编辑器 -->
    <div class="editor-content">
      <MdEditor v-model="content" height="calc(100vh - 60px)" :min-height="'calc(100vh - 60px)'" />
    </div>
  </div>
</template>

<script setup name="ArticleEditor">
import { ref } from 'vue'
import MdEditor from '@/components/MdEditor/index.vue'

const title = ref('')
const content = ref('')

// 标题输入处理
const handleTitleInput = (value) => {
  console.log('标题:', value)
}

// 保存草稿
const handleSaveDraft = () => {
  console.log('保存到草稿箱')
  // TODO: 实现草稿保存逻辑
}

// 发布文章
const handlePublish = () => {
  console.log('发布文章')
  // TODO: 实现发布逻辑
}
</script>

<style lang="scss" scoped>
.article-editor-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .editor-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 20px;
    background-color: #ffffff;
    border-bottom: 1px solid #e8e8e8;
    gap: 16px;

    .title-input {
      flex: 1;
      
      :deep(.el-input__wrapper) {
        box-shadow: none !important;
        border: none !important;
        padding: 0 !important;
      }
      
      :deep(.el-input__inner) {
        font-size: 20px;
        font-weight: 500;
        color: #303133;
        
        &::placeholder {
          color: #c0c4cc;
        }
      }
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-shrink: 0;

      .auto-save-tip {
        font-size: 13px;
        color: #909399;
        white-space: nowrap;
      }
    }
  }

  .editor-content {
    flex: 1;
    overflow: hidden;
  }
}
</style>
