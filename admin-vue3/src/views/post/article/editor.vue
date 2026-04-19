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
import { ref, reactive, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import MdEditor from '@/components/MdEditor/index.vue'
import ImageUploadCover from '@/components/ImageUploadCover/index.vue'
import { getArticle, addArticle, updateArticle } from '@/api/post/article'
import { useSubject } from '@/composables/useSubject'
import { useDynamicTitle } from '@/composables/useDynamicTitle'

const route = useRoute()
const router = useRouter()
const subject = useSubject()
const { setTitle } = useDynamicTitle()

const title = ref('')
const content = ref('')
const articleId = ref(null)
const loading = ref(false)
const isEdit = ref(false)
const subjectList = ref([])
const sidebarCollapsed = ref(false) // 侧面板收起状态

// 初始化默认标题
setTitle('文章新建 - 编辑器')

// 文章完整数据
const articleData = reactive({
  id: undefined,
  articleId: undefined,
  title: '',
  subjectId: undefined,
  desc: '',
  content: '',
  cover: '',
  author: '',
  publishTime: undefined,
  likeNum: 0,
  readNum: 0,
  commentNum: 0,
  publishStatus: '0',
  auditStatus: '0',
  scheduledPublishTime: undefined,
  sort: 0
})

// 初始化：从路由参数获取文章ID
onMounted(() => {
  // 加载专栏列表
  subject.getList().then(() => {
    subjectList.value = subject.state.list
  })
})

// 加载文章信息
const loadArticleInfo = async (id) => {
  loading.value = true
  try {
    const res = await getArticle(id)
    if (res.data) {
      // 填充所有字段
      Object.assign(articleData, res.data)
      // 同步到响应式变量
      title.value = res.data.title || ''
      content.value = res.data.content || ''
    }
  } catch (error) {
    console.error('加载文章失败:', error)
    ElMessage.error('加载文章失败')
  } finally {
    loading.value = false
  }
}

// 标题输入处理（同步到articleData）
const handleTitleInput = (value) => {
  articleData.title = value
  // 实时更新浏览器标题
  if (value && value.trim()) {
    setTitle(`${value} - 编辑器`)
  } else {
    setTitle(isEdit.value ? '文章编辑 - 编辑器' : '文章新建 - 编辑器')
  }
}

// 监听content变化，同步到articleData
watch(content, (newVal) => {
  articleData.content = newVal
})

// 监听路由参数变化，处理标题更新和数据加载
watch(() => route.query.id, (newId) => {
  const id = Number(newId)
  if (newId && !isNaN(id)) {
    // 如果路由参数有变化，加载文章信息
    if (articleId.value !== id) {
      articleId.value = id
      isEdit.value = true
      loadArticleInfo(id)
    }
  }
}, { immediate: true })

// 监听title变化，确保从接口加载后能更新标题
watch(title, (newVal) => {
  if (newVal && newVal.trim()) {
    setTitle(`${newVal} - 编辑器`)
  } else if (!newVal) {
    setTitle(isEdit.value ? '文章编辑 - 编辑器' : '文章新建 - 编辑器')
  }
})

// 切换侧面板展开/收起
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

// 验证表单
const validateForm = () => {
  if (!title.value || !title.value.trim()) {
    ElMessage.warning('请输入文章标题')
    return false
  }
  if (!content.value || !content.value.trim()) {
    ElMessage.warning('请输入文章内容')
    return false
  }
  return true
}

// 保存草稿
const handleSaveDraft = async () => {
  if (!validateForm()) {
    return
  }

  loading.value = true
  try {
    // 使用articleData保存所有字段
    const saveData = { ...articleData }
    saveData.publishStatus = '0' // 草稿状态
    
    // 确保数字类型字段正确转换
    if (saveData.id) saveData.id = Number(saveData.id)
    if (saveData.subjectId) saveData.subjectId = Number(saveData.subjectId)
    if (saveData.sort !== undefined) saveData.sort = Number(saveData.sort)
    if (saveData.likeNum !== undefined) saveData.likeNum = Number(saveData.likeNum)
    if (saveData.readNum !== undefined) saveData.readNum = Number(saveData.readNum)
    if (saveData.commentNum !== undefined) saveData.commentNum = Number(saveData.commentNum)

    let res
    if (isEdit.value && articleId.value) {
      // 编辑模式：更新文章
      saveData.id = Number(articleId.value)
      res = await updateArticle(saveData)
      ElMessage.success('草稿保存成功')
    } else {
      // 新增模式：创建文章
      res = await addArticle(saveData)
      // 保存成功后，获取新文章ID，切换到编辑模式
      if (res.data && res.data.id) {
        articleId.value = Number(res.data.id)
        isEdit.value = true
        // 更新articleData中的id
        articleData.id = Number(res.data.id)
        articleData.articleId = Number(res.data.id)
        // 更新URL，添加文章ID
        router.replace({ query: { id: res.data.id } })
      }
      ElMessage.success('草稿保存成功')
    }
  } catch (error) {
    console.error('保存草稿失败:', error)
    ElMessage.error('保存草稿失败')
  } finally {
    loading.value = false
  }
}

// 发布文章
const handlePublish = async () => {
  if (!validateForm()) {
    return
  }

  loading.value = true
  try {
    // 使用articleData保存所有字段
    const saveData = { ...articleData }
    saveData.publishStatus = '1' // 发布状态
    
    // 确保数字类型字段正确转换
    if (saveData.id) saveData.id = Number(saveData.id)
    if (saveData.subjectId) saveData.subjectId = Number(saveData.subjectId)
    if (saveData.sort !== undefined) saveData.sort = Number(saveData.sort)
    if (saveData.likeNum !== undefined) saveData.likeNum = Number(saveData.likeNum)
    if (saveData.readNum !== undefined) saveData.readNum = Number(saveData.readNum)
    if (saveData.commentNum !== undefined) saveData.commentNum = Number(saveData.commentNum)

    let res
    if (isEdit.value && articleId.value) {
      // 编辑模式：更新文章
      saveData.id = Number(articleId.value)
      res = await updateArticle(saveData)
      ElMessage.success('文章发布成功')
    } else {
      // 新增模式：创建文章
      res = await addArticle(saveData)
      // 保存成功后，获取新文章ID，切换到编辑模式
      if (res.data && res.data.id) {
        articleId.value = Number(res.data.id)
        isEdit.value = true
        // 更新articleData中的id
        articleData.id = Number(res.data.id)
        articleData.articleId = Number(res.data.id)
        // 更新URL，添加文章ID
        router.replace({ query: { id: res.data.id } })
      }
      ElMessage.success('文章发布成功')
    }

    // 发布成功后返回列表页
    setTimeout(() => {
      router.push('/post/article')
    }, 1500)
  } catch (error) {
    console.error('发布文章失败:', error)
    ElMessage.error('发布文章失败')
  } finally {
    loading.value = false
  }
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
