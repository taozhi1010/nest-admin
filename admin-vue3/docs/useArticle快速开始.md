# useArticle 快速开始指南

## 🚀 5分钟上手

### 第一步：导入组合函数

```typescript
import { useArticle } from '@/composables/useArticle'
```

### 第二步：创建实例

```typescript
const articleManager = useArticle()
```

### 第三步：调用方法

#### 1️⃣ 加载文章列表

```typescript
const loadArticles = async () => {
  const { list, total } = await articleManager.loadList({
    pageNum: 1,
    pageSize: 10,
    subjectId: 123 // 可选：按专栏筛选
  })
  
  console.log(`共 ${total} 篇文章`)
  console.log(list) // 文章数组
}
```

#### 2️⃣ 获取文章详情

```typescript
const getArticleDetail = async (id: number) => {
  const article = await articleManager.getDetail(id)
  
  console.log(article.title)
  console.log(article.content)
}
```

#### 3️⃣ 保存文章（自动判断新增或更新）

```typescript
// 创建新文章（没有 ID）
const newArticle = await articleManager.saveArticle({
  title: '我的第一篇文章',
  content: '# Hello World\n\n这是文章内容',
  subjectId: 1,
  desc: '这是一篇测试文章',
  source: '0' // 0-原创, 1-转载, 2-翻译
})

console.log('创建成功，ID:', newArticle.id)

// 更新文章（有 ID）
const updated = await articleManager.saveArticle({
  id: 123,  // 有 ID 就是更新
  title: '修改后的标题',
  content: '更新的内容'
})

console.log('更新成功')
```

**优势**：
- ✅ 不需要在页面中判断是新增还是编辑
- ✅ 统一的方法调用，代码更简洁
- ✅ 自动根据是否有 ID 来判断操作类型
```

#### 5️⃣ 删除文章

```typescript
// 删除单个
await articleManager.deleteArticle(123)

// 批量删除
await articleManager.deleteArticle([123, 456, 789])

console.log('删除成功')
```

#### 6️⃣ 审核流程

```typescript
// 提交审核
await articleManager.submitForAudit(123)

// 审核通过（管理员）
await articleManager.performAudit({
  id: 123,
  auditStatus: '1', // 1-通过, 2-拒绝
  auditRemark: '内容质量优秀'
})

// 发布文章
await articleManager.publishArticle(123)
```

## 📋 完整示例：文章管理页面

```vue
<template>
  <div class="article-page">
    <!-- 加载状态 -->
    <el-skeleton v-if="loading" :rows="5" animated />
    
    <!-- 文章列表 -->
    <el-table v-else :data="articles">
      <el-table-column prop="title" label="标题" />
      <el-table-column prop="author" label="作者" />
      <el-table-column label="操作">
        <template #default="{ row }">
          <el-button @click="editArticle(row)">编辑</el-button>
          <el-button type="danger" @click="deleteArticle(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <!-- 分页 -->
    <el-pagination
      v-model:current-page="pageNum"
      v-model:page-size="pageSize"
      :total="total"
      @current-change="loadArticles"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useArticle } from '@/composables/useArticle'
import type { Article } from '@/types/api'

const articleManager = useArticle()

// 响应式数据
const loading = ref(false)
const articles = ref<Article[]>([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)

// 加载文章列表
const loadArticles = async () => {
  loading.value = true
  try {
    const { list, total: totalCount } = await articleManager.loadList({
      pageNum: pageNum.value,
      pageSize: pageSize.value
    })
    
    articles.value = list
    total.value = totalCount
  } catch (error) {
    ElMessage.error('加载失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 编辑文章
const editArticle = (article: Article) => {
  console.log('编辑文章:', article)
  // 跳转到编辑页面或打开弹窗
}

// 删除文章
const deleteArticle = async (article: Article) => {
  try {
    await ElMessageBox.confirm('确认删除？', '提示', { type: 'warning' })
    await articleManager.deleteArticle(article.id!)
    ElMessage.success('删除成功')
    await loadArticles() // 刷新列表
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadArticles()
})
</script>
```

## 🎯 常用场景速查

### 场景1：搜索文章

```typescript
const searchArticles = async (keyword: string) => {
  const { list } = await articleManager.loadList({
    pageNum: 1,
    pageSize: 10,
    title: keyword // 按标题搜索
  })
  
  return list
}
```

### 场景2：按专栏筛选

```typescript
const getArticlesBySubject = async (subjectId: number) => {
  const { list } = await articleManager.loadList({
    pageNum: 1,
    pageSize: 20,
    subjectId: subjectId
  })
  
  return list
}
```

### 场景3：获取已发布的文章

```typescript
const getPublishedArticles = async () => {
  const { list } = await articleManager.loadList({
    pageNum: 1,
    pageSize: 10,
    publishStatus: '1' // 1-已发布
  })
  
  return list
}
```

### 场景4：草稿箱功能

```typescript
const getDrafts = async () => {
  const { list } = await articleManager.loadList({
    pageNum: 1,
    pageSize: 10,
    publishStatus: '0' // 0-草稿
  })
  
  return list
}
```

### 场景5：自动保存草稿

```typescript
import { debounce } from 'lodash-es'

const autoSave = debounce(async (articleData: Partial<Article>) => {
  try {
    if (articleData.id) {
      await articleManager.updateArticle(articleData)
      console.log('自动保存成功')
    } else {
      const newArticle = await articleManager.createArticle(articleData)
      // 保存成功后更新 ID
      articleData.id = newArticle.id
    }
  } catch (error) {
    console.error('自动保存失败:', error)
  }
}, 1000) // 1秒防抖

// 在输入时调用
watch(content, (newContent) => {
  autoSave({ ...articleData, content: newContent })
})
```

## ⚡ 高级用法

### 并行请求

```typescript
// 同时加载多个数据
const [articles, detail] = await Promise.all([
  articleManager.loadList({ pageNum: 1, pageSize: 10 }),
  articleManager.getDetail(123)
])
```

### 错误处理封装

```typescript
const safeExecute = async <T>(
  fn: () => Promise<T>,
  errorMsg: string
): Promise<T | null> => {
  try {
    return await fn()
  } catch (error) {
    ElMessage.error(errorMsg)
    console.error(error)
    return null
  }
}

// 使用
const article = await safeExecute(
  () => articleManager.getDetail(123),
  '获取文章详情失败'
)
```

### 加载状态管理

```typescript
const useLoading = () => {
  const loadingMap = ref<Record<string, boolean>>({})
  
  const withLoading = async <T>(
    key: string,
    fn: () => Promise<T>
  ): Promise<T> => {
    loadingMap.value[key] = true
    try {
      return await fn()
    } finally {
      loadingMap.value[key] = false
    }
  }
  
  return { loadingMap, withLoading }
}

// 使用
const { loadingMap, withLoading } = useLoading()

const loadArticles = () => 
  withLoading('articles', () => articleManager.loadList(query))

const deleteArticle = (id: number) => 
  withLoading(`delete-${id}`, () => articleManager.deleteArticle(id))
```

## 🔍 常见问题

### Q1: 如何处理 TypeScript 类型错误？

确保导入了正确的类型：

```typescript
import type { Article, ArticleQueryParams } from '@/types/api'

const query: ArticleQueryParams = {
  pageNum: 1,
  pageSize: 10
}
```

### Q2: 如何在 Composition API 中使用？

```typescript
setup() {
  const articleManager = useArticle()
  
  const handleCreate = async () => {
    await articleManager.createArticle({...})
  }
  
  return { handleCreate }
}
```

### Q3: 如何配合 Pinia 使用？

```typescript
// stores/article.ts
import { defineStore } from 'pinia'
import { useArticle } from '@/composables/useArticle'

export const useArticleStore = defineStore('article', {
  state: () => ({
    articles: [],
    total: 0
  }),
  
  actions: {
    async loadArticles(params: ArticleQueryParams) {
      const articleManager = useArticle()
      const { list, total } = await articleManager.loadList(params)
      
      this.articles = list
      this.total = total
    }
  }
})
```

## 📚 更多资源

- 📖 [完整 API 文档](./useArticle使用说明.md)
- 📝 [重构报告](./文章模块组合函数重构完成报告.md)
- 💻 [使用示例代码](../src/views/post/article/useArticleList.ts)

## 💬 需要帮助？

如果遇到问题：
1. 查看控制台错误信息
2. 检查类型定义是否正确
3. 参考完整使用文档
4. 查看示例代码

---

**祝使用愉快！** 🎉
