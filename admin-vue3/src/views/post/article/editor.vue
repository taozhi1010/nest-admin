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
        <span class="auto-save-tip">{{ isEdit ? '编辑模式' : '新建文章' }}</span>
        <el-button @click="handleSaveDraft" :loading="loading">存草稿</el-button>
        <el-button type="primary" @click="handlePublish" :loading="loading">发布</el-button>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="editor-main">
      <!-- 左侧编辑器 -->
      <div class="editor-content" v-loading="loading">
        <MdEditor v-model="content" height="100%" :min-height="'100%'" />
      </div>

      <!-- 右侧属性面板 -->
      <div class="editor-sidebar" :class="{ 'collapsed': sidebarCollapsed }">
        <div class="sidebar-header">
          <span>文章属性</span>
          <el-button 
            class="collapse-btn" 
            :icon="sidebarCollapsed ? 'Expand' : 'Fold'" 
            circle 
            size="small"
            @click="toggleSidebar"
          />
        </div>
        <div class="sidebar-body">
          <el-form label-width="80px" size="small" class="sidebar-form">
            <el-form-item label="所属专栏">
              <el-select v-model="articleData.subjectId" clearable placeholder="请选择专栏" style="width: 100%">
                <el-option v-for="item in subjectList" :key="item.id" :label="item.title" :value="item.id" />
              </el-select>
            </el-form-item>
            
            <el-form-item label="文章简介">
              <el-input 
                v-model="articleData.desc" 
                type="textarea" 
                :rows="4" 
                placeholder="请输入文章简介"
                maxlength="500"
                show-word-limit
              />
            </el-form-item>
            
            <el-form-item label="封面图片">
              <ImageUploadCover 
                v-model="articleData.cover" 
                path="article" 
                :max-size="5" 
                :quality="0.85"
                width="100%"
                aspect-ratio="16 / 9"
              />
            </el-form-item>
            
            <el-form-item label="文章来源">
              <el-select v-model="articleData.source" clearable placeholder="请选择文章来源" style="width: 100%">
                <el-option v-for="dict in post_article_source" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
            
            <el-form-item label="定时发布">
              <el-date-picker 
                v-model="articleData.scheduledPublishTime" 
                type="datetime" 
                placeholder="选择定时发布时间" 
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
              />
            </el-form-item>
            
            <el-form-item label="排序">
              <el-input-number 
                v-model="articleData.sort" 
                :min="0" 
                controls-position="right"
                style="width: 100%"
              />
            </el-form-item>
            
            <el-form-item label="发布状态">
              <el-radio-group v-model="articleData.publishStatus">
                <el-radio label="0">草稿</el-radio>
                <el-radio label="1">已发布</el-radio>
              </el-radio-group>
            </el-form-item>
            
            <el-form-item label="审核状态">
              <el-radio-group v-model="articleData.auditStatus">
                <el-radio label="0">待审核</el-radio>
                <el-radio label="1">已通过</el-radio>
                <el-radio label="2">已拒绝</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-form>
        </div>
      </div>
      
      <!-- 收起状态的浮动按钮 -->
      <div v-if="sidebarCollapsed" class="sidebar-toggle-float" @click="toggleSidebar">
        <el-icon :size="20"><Expand /></el-icon>
      </div>
    </div>
  </div>
</template>

<script setup name="ArticleEditor">
import MdEditor from '@/components/MdEditor/index.vue'
import ImageUploadCover from '@/components/ImageUploadCover/index.vue'
import { useArticleEditor } from '@/composables/post/useArticleEditor'

// 使用组合函数
const {
  title,
  content,
  loading,
  isEdit,
  subjectList,
  sidebarCollapsed,
  articleData,
  post_article_source,
  handleTitleInput,
  toggleSidebar,
  handleSaveDraft,
  handlePublish
} = useArticleEditor()
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
    flex-shrink: 0;

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
      gap: 8px;
      flex-shrink: 0;

      .auto-save-tip {
        font-size: 13px;
        color: #909399;
        white-space: nowrap;
      }
    }
  }

  .editor-main {
    flex: 1;
    display: flex;
    overflow: hidden;
    position: relative;
    
    .editor-content {
      flex: 1;
      overflow: hidden;
      border-right: 1px solid #e8e8e8;
      transition: all 0.3s ease;
    }
    
    .editor-sidebar {
      width: 360px;
      background-color: #ffffff;
      overflow-y: auto;
      flex-shrink: 0;
      transition: all 0.3s ease;
      position: relative;
      
      &.collapsed {
        width: 0;
        overflow: hidden;
        border: none;
        
        .sidebar-header {
          opacity: 0;
        }
        
        .sidebar-body {
          opacity: 0;
        }
      }
      
      .sidebar-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 20px;
        font-size: 15px;
        font-weight: 600;
        color: #303133;
        border-bottom: 1px solid #e8e8e8;
        
        .collapse-btn {
          &:hover {
            color: #409eff;
          }
        }
      }
      
      .sidebar-body {
        transition: opacity 0.3s ease;
      }
      
      .sidebar-form {
        padding: 20px;
        
        :deep(.el-form-item) {
          margin-bottom: 20px;
        }
      }
    }
    
    .sidebar-toggle-float {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      width: 36px;
      height: 60px;
      background-color: #ffffff;
      border: 1px solid #e8e8e8;
      border-radius: 8px 0 0 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #409eff;
      transition: all 0.3s ease;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      z-index: 10;
      
      &:hover {
        background-color: #409eff;
        color: #ffffff;
        box-shadow: 0 2px 12px rgba(64, 158, 255, 0.3);
      }
    }
  }
}
</style>
