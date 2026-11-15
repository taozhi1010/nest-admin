<template>
  <div class="app-container article">
    <el-card class="article-subject fill-card" shadow="never">
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
              @click="handleSubjectRowClick(item)">
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
            <div v-show="!subject.state.loading && subject.state.hasMore && subject.state.list.length > 0" class="subject-loading" style="opacity: 0.5">
              <span>滚动加载更多</span>
            </div>
          </div>
        </el-scrollbar>
      </div>
    </el-card>

    <el-card class="article-table fill-card" shadow="never">
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
      <el-form ref="queryArticleRef" v-no-enter :inline="true" :model="article.queryParams">
        <el-form-item label="标题" prop="title">
          <el-input v-model="article.queryParams.title" clearable placeholder="请输入文章标题" style="width: 200px" @keyup.enter="article.handleQuery" @blur="handleQueryBlur" />
        </el-form-item>
        <el-form-item label="作者" prop="author">
          <el-input v-model="article.queryParams.author" clearable placeholder="请输入作者" style="width: 150px" @keyup.enter="article.handleQuery" @blur="handleQueryBlur" />
        </el-form-item>
        <el-form-item label="发布" prop="publishStatus">
          <el-select v-model="article.queryParams.publishStatus" clearable placeholder="请选择发布状态" style="width: 150px">
            <el-option v-for="dict in post_article_publish_status" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="审核" prop="auditStatus">
          <el-select v-model="article.queryParams.auditStatus" clearable placeholder="请选择审核状态" style="width: 150px">
            <el-option v-for="dict in post_article_audit_status" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button icon="Search" type="primary" @click="article.handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="article.resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 操作按钮 -->
      <el-row class="mb8" :gutter="10">
        <el-col :span="1.5">
          <el-button v-hasPermi="['post:Article:add']" icon="Plus" plain type="primary" @click="handleNewEditor">新增</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button v-hasPermi="['post:Article:remove']" :disabled="article.multiple" icon="Delete" plain type="danger" @click="article.handleDelete">删除</el-button>
        </el-col>
        <right-toolbar v-model:show-search="article.showSearch" @query-table="article.getList" />
      </el-row>

      <!-- 数据表格 -->
      <el-table v-loading="article.loading" :data="article.list" @selection-change="article.handleSelectionChange">
        <el-table-column align="center" type="selection" width="55" />
        <el-table-column align="left" label="文章标题" min-width="350">
          <template #default="scope">
            <el-tooltip :content="'双击打开编辑器'" placement="top" effect="light">
              <div style="display: flex; align-items: center; gap: 8px">
                <el-tag v-if="scope.row.source" :type="getSourceTagType(scope.row.source)" effect="light" size="small">
                  {{ getDictLabel('post_article_source', scope.row.source) }}
                </el-tag>
                <el-link
                  type="primary"
                  :underline="false"
                  @dblclick="article.handleOpenEditor(scope.row)"
                  style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: block; text-align: left; width: 100%">
                  {{ scope.row.title }}
                </el-link>
              </div>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column align="left" label="作者" width="120">
          <template #default="scope">
            <span>{{ scope.row.userInfo?.nickName || '未知' }}</span>
          </template>
        </el-table-column>
        <el-table-column align="left" label="发布状态" prop="publishStatus" width="100">
          <template #default="scope">
            <el-tag :type="getDictTagType('post_article_publish_status', scope.row.publishStatus)" effect="light" size="small">
              {{ getDictLabel('post_article_publish_status', scope.row.publishStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column align="left" label="审核状态" prop="auditStatus" width="100">
          <template #default="scope">
            <el-tag :type="getDictTagType('post_article_audit_status', scope.row.auditStatus)" effect="light" size="small">
              {{ getDictLabel('post_article_audit_status', scope.row.auditStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column align="left" label="点赞" prop="likeNum" width="80" />
        <el-table-column align="left" label="阅读" prop="readNum" width="80" />
        <el-table-column align="left" label="评论" prop="commentNum" width="80" />
        <el-table-column align="left" label="发布时间" prop="publishTime" width="170" />
        <el-table-column align="left" label="创建时间" prop="createTime" width="170" />
        <el-table-column align="center" class-name="small-padding fixed-width" fixed="right" label="操作" width="220">
          <template #default="scope">
            <el-button icon="View" link type="primary" @click="handlePreview(scope.row)">预览</el-button>
            <el-button v-hasPermi="['post:Article:edit']" icon="Edit" link type="primary" @click="article.handleUpdate(scope.row)">修改</el-button>
            <el-button v-hasPermi="['post:Article:remove']" icon="Delete" link type="danger" @click="article.handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <pagination v-show="article.total > 0" v-model:limit="article.queryParams.pageSize" v-model:page="article.queryParams.pageNum" :total="article.total" @pagination="article.getList" />
    </el-card>

    <article-form v-model="article.open" :title="article.title" :initial-data="article.form" :subject-list="subject.state.list" @success="handleArticleSuccess" />

    <preview ref="previewRef" />
  </div>
</template>

<script setup name="Article">
import { listArticle, delArticle, getArticle } from '@/api/post/article';
import Preview from './components/Preview';
import ArticleForm from './components/ArticleForm';
import { useSubject } from '@/composables/post/useSubject';
import { useCrud } from '@/composables/useCrud';

const router = useRouter();

const { post_article_publish_status, post_article_audit_status, post_article_source, post_subject_publish_status, post_subject_audit_status, getDictLabel, getDictTagType } = useDict(
  'post_article_publish_status',
  'post_article_audit_status',
  'post_article_source',
  'post_subject_publish_status',
  'post_subject_audit_status'
);

// 获取来源标签类型
const getSourceTagType = (source) => {
  const typeMap = {
    0: '', // 原创
    1: 'success', // 转载
    2: 'warning' // 翻译
  };
  return typeMap[source] || '';
};

// 使用专栏管理 composable
const subject = useSubject();

const previewRef = ref();
const queryArticleRef = ref(null);

// 文章管理（编辑对话框复用 ArticleForm 子组件，绑定 open/title/form）
const article = useCrud({
  api: {
    list: async (params) => {
      const res = await listArticle(params);
      res.data.list = res.data.list || [];
      res.data.total = res.data.total || 0;
      // 格式化时间字段
      res.data.list.forEach((item) => {
        if (item.updateTime) item.updateTime = dayjs(item.updateTime).format('YYYY-MM-DD HH:mm:ss');
        if (item.createTime) item.createTime = dayjs(item.createTime).format('YYYY-MM-DD HH:mm:ss');
        if (item.publishTime) item.publishTime = dayjs(item.publishTime).format('YYYY-MM-DD HH:mm:ss');
        if (item.scheduledPublishTime) item.scheduledPublishTime = dayjs(item.scheduledPublishTime).format('YYYY-MM-DD HH:mm:ss');
      });
      return res;
    },
    get: getArticle,
    del: delArticle
  },
  idKey: 'id',
  name: '文章',
  query: { title: undefined, subjectId: undefined, author: undefined, publishStatus: undefined, auditStatus: undefined, isAsc: 'descending', orderByColumn: 'createTime' },
  texts: {
    // 单行删除带文章标题，批量删除带选中篇数
    deleteConfirm: (ids, row) => `是否确认删除文章${row?.title ? `"${row.title}"` : `选中的 ${Array.isArray(ids) ? ids.length : 1} 篇文章`}？`
  },
  queryRef: queryArticleRef
});

subject.getList();
article.getList();

// 搜索框失焦处理（去除空格）
const handleQueryBlur = () => {
  article.queryParams.title = article.queryParams.title?.trim();
  article.queryParams.author = article.queryParams.author?.trim();
};

// 处理专栏行点击
const handleSubjectRowClick = (row) => {
  subject.handleRowClick(row, (subjectId) => {
    article.queryParams.subjectId = subjectId;
    article.getList();
  });
};

// 预览文章
const handlePreview = (row) => {
  previewRef.value.handleOpen(row);
};

// 打开编辑器（新窗口）
const handleOpenEditor = (row) => {
  const articleId = row.id || row.articleId;
  if (!articleId) {
    ElMessage.warning('文章ID不存在');
    return;
  }
  // 在新窗口打开编辑器页面
  const routeUrl = router.resolve({
    path: '/post/article-editor',
    query: { id: articleId }
  });
  window.open(routeUrl.href, '_blank');
};

// 新建文章（新窗口打开编辑器）
const handleNewEditor = () => {
  const routeUrl = router.resolve({
    path: '/post/article-editor'
  });
  window.open(routeUrl.href, '_blank');
};

// 处理文章操作成功后的回调
const handleArticleSuccess = () => {
  // 刷新文章列表
  article.getList();
  // 刷新左侧专栏列表，保持选中状态
  const currentSelectNode = { ...subject.state.selectNode };
  subject.getList().then(() => {
    // 恢复之前选中的专栏
    if (currentSelectNode.id && currentSelectNode.id !== 0) {
      const found = subject.state.list.find((item) => item.id === currentSelectNode.id);
      if (found) {
        subject.state.selectNode = found;
      }
    }
  });
};
</script>

<style lang="scss" scoped>
.article {
  width: 100%;
  height: 100%;
  display: flex;

  &-subject {
    background-color: #ffffff;
    width: 300px;
    // 高度与内部滚动由全局 .fill-card 统一处理
    margin-right: 20px;

    &-header {
      flex-shrink: 0;
      margin-bottom: 10px;

      .search-input {
        width: 100%;
      }
    }

    &-body {
      // 占满卡片剩余空间，独立滚动
      flex: 1;
      min-height: 0;
      padding-right: 0;
      overflow-y: auto;
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
