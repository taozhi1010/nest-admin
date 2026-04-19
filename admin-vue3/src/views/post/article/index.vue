<template>
  <div class="app-container article">
    <el-card v-loading="loading" class="article-subject" shadow="never">
      <div class="article-subject-header">
        <el-input v-model="subject.query.title" class="search-input" placeholder="请输入专栏名称筛选" clearable @keyup.enter="subject.handleSearch" @blur="subject.handleSearchBlur" />
      </div>

      <div class="article-subject-body">
        <el-scrollbar height="100%" @scroll="subject.handleScroll">
          <div class="subject-list">
            <div 
              v-for="item in subject.state.list" 
              :key="item.id" 
              class="subject-item"
              :class="{ 'is-active': subject.state.selectNode.id === item.id }"
              @click="handleSubjectRowClick(item)"
            >
              <div class="subject-item-content">
                <div class="subject-item-name">{{ item.title || '未命名专栏' }}</div>
                <div class="subject-item-info">
                  <span class="subject-item-count">{{ item.articleCount || 0 }} 篇</span>
                  <el-tag v-if="item.publishStatus" :type="getDictTagType('post_subject_publish_status', item.publishStatus)" effect="light" size="small">
                    {{ getDictLabel('post_subject_publish_status', item.publishStatus) }}
                  </el-tag>
                </div>
              </div>
            </div>
            <!-- 加载中 -->
            <div v-show="subject.state.loading" class="subject-loading">
              <el-icon class="is-loading"><loading /></el-icon>
              <span>加载中...</span>
            </div>
            <!-- 暂无数据 -->
            <div v-show="!subject.state.loading && subject.state.list.length === 0" class="subject-loading">
              <span>暂无专栏数据</span>
            </div>
            <!-- 没有更多数据（有数据时才显示） -->
            <div v-show="!subject.state.loading && !subject.state.hasMore && subject.state.list.length > 0" class="subject-loading">
              <span>没有更多了</span>
            </div>
            <!-- 可以加载更多 -->
            <div v-show="!subject.state.loading && subject.state.hasMore && subject.state.list.length > 0" class="subject-loading" style="opacity: 0.5;">
              <span>滚动加载更多</span>
            </div>
          </div>
        </el-scrollbar>
      </div>
    </el-card>

    <el-card v-loading="loading" class="article-table" shadow="never">
      <!-- 专栏信息描述（仅在选择专栏时显示） -->
      <el-descriptions v-if="subject.state.selectNode.id && subject.state.selectNode.id !== 0" border :column="4">
        <el-descriptions-item label="专栏名称">{{ subject.state.selectNode.title }}</el-descriptions-item>
        <el-descriptions-item label="发布状态">
          <el-tag :type="getDictTagType('post_subject_publish_status', subject.state.selectNode.publishStatus)" effect="light">
            {{ getDictLabel('post_subject_publish_status', subject.state.selectNode.publishStatus) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="审核状态">
          <el-tag :type="getDictTagType('post_subject_audit_status', subject.state.selectNode.auditStatus)" effect="light">
            {{ getDictLabel('post_subject_audit_status', subject.state.selectNode.auditStatus) }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>

      <el-divider v-if="subject.state.selectNode.id && subject.state.selectNode.id !== 0" content-position="left">文章列表</el-divider>

      <!-- 搜索表单 -->
      <el-form ref="queryArticleRef" v-no-enter :inline="true" :model="article.query">
        <el-form-item label="标题" prop="title">
          <el-input v-model="article.query.title" clearable placeholder="请输入文章标题" style="width: 200px" @keyup.enter="article.handleQuery" @blur="article.handleQueryBlur" />
        </el-form-item>
        <el-form-item label="作者" prop="author">
          <el-input v-model="article.query.author" clearable placeholder="请输入作者" style="width: 150px" @keyup.enter="article.handleQuery" @blur="article.handleQueryBlur" />
        </el-form-item>
        <el-form-item label="发布" prop="publishStatus">
          <el-select v-model="article.query.publishStatus" clearable placeholder="请选择发布状态" style="width: 150px">
            <el-option v-for="dict in post_article_publish_status" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="审核" prop="auditStatus">
          <el-select v-model="article.query.auditStatus" clearable placeholder="请选择审核状态" style="width: 150px">
            <el-option v-for="dict in post_article_audit_status" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button icon="Search" type="primary" @click="article.handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="article.handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 操作按钮 -->
      <el-row class="mb8" :gutter="10">
        <el-col :span="1.5">
          <el-button v-hasPermi="['post:Article:add']" icon="Plus" plain type="primary" @click="article.handleNewEditor">新增</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button v-hasPermi="['post:Article:remove']" :disabled="article.multiple" icon="Delete" plain type="danger" @click="article.handleDelete">删除</el-button>
        </el-col>
        <right-toolbar v-model:show-search="article.showSearch" @query-table="article.getList" />
      </el-row>

      <!-- 数据表格 -->
      <el-table v-loading="article.loading" :data="article.list" @selection-change="article.handleSelectionChange">
        <el-table-column align="center" type="selection" width="55" />
        <el-table-column align="left" label="文章标题" prop="title" show-overflow-tooltip min-width="200" />
        <el-table-column align="center" label="文章简介" prop="desc" show-overflow-tooltip min-width="200" />
        <el-table-column align="center" label="作者" prop="author" width="100" />
        <el-table-column align="center" label="发布状态" prop="publishStatus" width="100">
          <template #default="scope">
            <el-tag :type="getDictTagType('post_article_publish_status', scope.row.publishStatus)" effect="light" size="small">
              {{ getDictLabel('post_article_publish_status', scope.row.publishStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="审核状态" prop="auditStatus" width="100">
          <template #default="scope">
            <el-tag :type="getDictTagType('post_article_audit_status', scope.row.auditStatus)" effect="light" size="small">
              {{ getDictLabel('post_article_audit_status', scope.row.auditStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="点赞" prop="likeNum" width="80" />
        <el-table-column align="center" label="阅读" prop="readNum" width="80" />
        <el-table-column align="center" label="评论" prop="commentNum" width="80" />
        <el-table-column align="center" label="发布时间" prop="publishTime" width="180" />
        <el-table-column align="center" label="创建时间" prop="createTime" width="180" />
        <el-table-column align="center" class-name="small-padding fixed-width" fixed="right" label="操作" width="300">
          <template #default="scope">
            <el-button icon="View" link type="primary" @click="article.handlePreview(scope.row)">预览</el-button>
            <el-button v-hasPermi="['post:Article:edit']" icon="Edit" link type="primary" @click="article.form.handleUpdate(scope.row)">修改</el-button>
            <el-button v-hasPermi="['post:Article:edit']" icon="EditPen" link type="success" @click="article.handleOpenEditor(scope.row)">编辑器</el-button>
            <el-button v-hasPermi="['post:Article:remove']" icon="Delete" link type="danger" @click="article.handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <pagination v-show="article.total > 0" v-model:limit="article.query.pageSize" v-model:page="article.query.pageNum" :total="article.total" @pagination="article.getList" />
    </el-card>

    <article-form 
      v-model="article.form.open" 
      :title="article.form.title" 
      :initial-data="article.form.data" 
      :subject-list="subject.state.list"
      @success="article.getList"
    />

    <preview ref="previewRef" />
  </div>
</template>

<script setup name="Article">
import { listArticle, delArticle, getArticle } from '@/api/post/article'
import Preview from './components/Preview'
import ArticleForm from './components/ArticleForm'
import { useDict } from '@/composables/useDict'
import { resetForm } from '@/composables/useCommon'
import { useSubject } from '@/composables/useSubject'
import { useRouter } from 'vue-router'

const router = useRouter()

const { post_article_publish_status, post_article_audit_status, post_subject_publish_status, post_subject_audit_status, getDictLabel, getDictTagType } = useDict('post_article_publish_status', 'post_article_audit_status', 'post_subject_publish_status', 'post_subject_audit_status')

// 使用专栏管理 composable
const subject = useSubject()

const formRef = ref(null)
const previewRef = ref()
const queryArticleRef = ref(null)
const loading = ref(false)

const article = reactive({
  loading: true,
  showSearch: true,
  query: {
    pageNum: 1,
    pageSize: 10,
    title: undefined,
    subjectId: undefined,
    author: undefined,
    publishStatus: undefined,
    auditStatus: undefined,
    isAsc: 'descending',
    orderByColumn: 'createTime'
  },
  list: [],
  total: 0,
  single: true,
  multiple: true,
  ids: [],
  getList: () => {
    article.loading = true
    listArticle(article.query).then((res) => {
      article.list = res.data.list || []
      if (article.list && article.list.length > 0) {
        article.list.forEach((item) => {
          if (item.updateTime) item.updateTime = dayjs(item.updateTime).format('YYYY-MM-DD HH:mm:ss')
          if (item.createTime) item.createTime = dayjs(item.createTime).format('YYYY-MM-DD HH:mm:ss')
          if (item.publishTime) item.publishTime = dayjs(item.publishTime).format('YYYY-MM-DD HH:mm:ss')
          if (item.scheduledPublishTime) item.scheduledPublishTime = dayjs(item.scheduledPublishTime).format('YYYY-MM-DD HH:mm:ss')
        })
      }
      article.total = res.data.total || 0
      article.loading = false
    }).catch(() => {
      article.loading = false
    })
  },
  handleSelectionChange: (selection) => {
    article.ids = selection.map((item) => item.id)
    article.single = selection.length != 1
    article.multiple = !selection.length
  },
  handleDelete: (row) => {
    const articleIds = row.id || row.articleId || article.ids
    const titles = row.title ? `"${row.title}"` : `选中的 ${article.ids.length} 篇文章`
    ElMessageBox.confirm(`是否确认删除文章${titles}？`, '系统提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(function () {
        return delArticle(articleIds)
      })
      .then(() => {
        article.getList()
        ElMessage.success('删除成功')
      })
      .catch(() => {})
  },
  handleQuery: () => {
    article.query.pageNum = 1
    article.getList()
  },
  handleQueryBlur: () => {
    article.query.title = article.query.title.trim()
    article.query.author = article.query.author.trim()
  },
  handleReset: () => {
    resetForm(queryArticleRef)
    article.handleQuery()
  },
  form: {
    open: false,
    title: '',
    data: {},
    handleUpdate: (row) => {
      const articleId = row.id || row.articleId || article.ids
      getArticle(articleId).then((res) => {
        article.form.data = res.data
        article.form.open = true
        article.form.title = '修改文章'
      })
    }
  },
  handlePreview: (row) => {
    previewRef.value.handleOpen(row)
  },
  handleOpenEditor: (row) => {
    const articleId = row.id || row.articleId
    if (!articleId) {
      ElMessage.warning('文章ID不存在')
      return
    }
    // 在新窗口打开编辑器页面
    const routeUrl = router.resolve({
      path: '/post/article-editor',
      query: { id: articleId }
    })
    window.open(routeUrl.href, '_blank')
  },
  handleNewEditor: () => {
    // 在新窗口打开编辑器页面（新建模式）
    const routeUrl = router.resolve({
      path: '/post/article-editor'
    })
    window.open(routeUrl.href, '_blank')
  }
})

subject.getList()
article.getList()

// 处理专栏行点击
const handleSubjectRowClick = (row) => {
  subject.handleRowClick(row, (subjectId) => {
    article.query.subjectId = subjectId
    article.getList()
  })
}
</script>

<style lang="scss" scoped>
.article {
  width: 100%;
  height: 100%;
  display: flex;

  &-subject {
    background-color: #ffffff;
    width: 300px;
    height: calc(100vh - 200px);
    margin-right: 20px;

    &-header {
      margin-bottom: 10px;

      .search-input {
        width: 100%;
      }
    }

    &-body {
      height: calc(100vh - 320px);
      padding-right: 0;
    }
  }

  .subject-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .subject-item {
    padding: 12px 16px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s;
    border: 1px solid #e4e7ed;
    background-color: #ffffff;
    width: 100%;
    box-sizing: border-box;

    &:hover {
      background-color: #f5f7fa;
      border-color: #c6e2ff;
    }

    &.is-active {
      background-color: #ecf5ff;
      border-color: #409eff;
    }

    &-content {
      margin-bottom: 8px;
    }

    &-name {
      font-size: 14px;
      font-weight: 500;
      color: #303133;
      margin-bottom: 6px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &-info {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: #909399;
    }

    &-count {
      background-color: #f0f2f5;
      padding: 2px 8px;
      border-radius: 4px;
    }
  }

  &-table {
    position: relative;
    width: calc(100% - 300px);
    height: calc(100vh - 200px);
  }
}

.subject.subject-item:hover .subject-item-actions {
  opacity: 1;
}

.subject-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: #909399;
  font-size: 14px;
  gap: 8px;

  .is-loading {
    font-size: 18px;
  }
}

// 加载图标动画
:deep(.is-loading) {
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

// 自定义 tooltip 宽度，使其更窄更易于阅读
:deep(.el-tooltip__popper) {
  max-width: 300px !important;
}

:deep(.el-popper.is-light) {
  max-width: 300px !important;
}
</style>
