# useArticle 组合函数使用说明

## 概述

`useArticle` 是一个语义化清晰、平台无关的文章管理组合函数，封装了所有文章相关的 API 调用和业务逻辑。

### 设计目标

1. **语义化**：方法名清晰表达意图，易于理解
2. **平台无关**：不依赖 Vue 特定 API，可在 Nuxt 等其他框架中复用
3. **类型安全**：完整的 TypeScript 类型定义
4. **统一错误处理**：所有方法都有统一的错误日志记录

## 基本用法

```typescript
import { useArticle } from '@/composables/useArticle'

const articleManager = useArticle()
```

## API 方法

### 1. loadList - 加载文章列表

获取文章列表，支持分页和筛选。

**参数：**
- `params`: 查询参数对象
  - `pageNum`: 页码
  - `pageSize`: 每页数量
  - `title?`: 标题筛选
  - `subjectId?`: 专栏 ID
  - `author?`: 作者筛选
  - `publishStatus?`: 发布状态
  - `auditStatus?`: 审核状态
  - `isAsc?`: 排序方式 ('ascending' | 'descending')
  - `orderByColumn?`: 排序字段

**返回：**
```typescript
Promise<{ list: Article[]; total: number }>
```

**示例：**
```typescript
const { list, total } = await articleManager.loadList({
  pageNum: 1,
  pageSize: 10,
  subjectId: 123,
  publishStatus: '1'
})

console.log(`共 ${total} 篇文章`)
list.forEach(article => {
  console.log(article.title)
})
```

---

### 2. getDetail - 获取文章详情

根据 ID 获取文章的完整信息。

**参数：**
- `id`: 文章 ID (number | string)

**返回：**
```typescript
Promise<Article>
```

**示例：**
```typescript
const article = await articleManager.getDetail(123)
console.log(article.title)
console.log(article.content)
```

---

### 3. createArticle - 创建文章

创建一篇新文章。

**参数：**
- `data`: 文章数据（Partial<Article>）

**返回：**
```typescript
Promise<Article>
```

**示例：**
```typescript
const newArticle = await articleManager.createArticle({
  title: '我的第一篇文章',
  content: '# Hello World\n\n这是文章内容',
  subjectId: 1,
  desc: '这是一篇测试文章',
  source: '0' // 原创
})

console.log(`新文章 ID: ${newArticle.id}`)
```

---

### 4. updateArticle - 更新文章

更新已有文章的信息。

**参数：**
- `data`: 文章数据（必须包含 id 或 articleId）

**返回：**
```typescript
Promise<Article>
```

**示例：**
```typescript
const updated = await articleManager.updateArticle({
  id: 123,
  title: '修改后的标题',
  content: '更新的内容',
  desc: '更新的简介'
})

console.log('文章已更新')
```

---

### 5. deleteArticle - 删除文章

删除单个或多个文章。

**参数：**
- `id`: 文章 ID 或 ID 数组

**返回：**
```typescript
Promise<void>
```

**示例：**
```typescript
// 删除单个文章
await articleManager.deleteArticle(123)

// 批量删除
await articleManager.deleteArticle([123, 456, 789])

console.log('文章已删除')
```

---

### 6. submitForAudit - 提交审核

将文章提交审核。

**参数：**
- `id`: 文章 ID

**返回：**
```typescript
Promise<void>
```

**示例：**
```typescript
await articleManager.submitForAudit(123)
console.log('已提交审核')
```

---

### 7. performAudit - 审核文章

管理员审核文章（通过或拒绝）。

**参数：**
- `params`: 审核参数
  - `id`: 文章 ID
  - `auditStatus`: 审核状态 ('1' - 通过, '2' - 拒绝)
  - `auditRemark?`: 审核意见

**返回：**
```typescript
Promise<void>
```

**示例：**
```typescript
// 通过审核
await articleManager.performAudit({
  id: 123,
  auditStatus: '1',
  auditRemark: '内容质量优秀，符合发布标准'
})

// 拒绝审核
await articleManager.performAudit({
  id: 123,
  auditStatus: '2',
  auditRemark: '内容需要进一步完善'
})
```

---

### 8. publishArticle - 发布文章

正式发布文章。

**参数：**
- `id`: 文章 ID

**返回：**
```typescript
Promise<void>
```

**示例：**
```typescript
await articleManager.publishArticle(123)
console.log('文章已发布')
```

---

## 完整示例

### 在 Vue 组件中使用

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useArticle } from '@/composables/useArticle'
import type { Article } from '@/types/api'

const articleManager = useArticle()
const articles = ref<Article[]>([])
const loading = ref(false)

// 加载文章列表
const loadArticles = async () => {
  loading.value = true
  try {
    const { list, total } = await articleManager.loadList({
      pageNum: 1,
      pageSize: 10
    })
    articles.value = list
    console.log(`加载了 ${total} 篇文章`)
  } catch (error) {
    console.error('加载失败:', error)
  } finally {
    loading.value = false
  }
}

// 创建新文章
const createNewArticle = async () => {
  try {
    const newArticle = await articleManager.createArticle({
      title: '新文章',
      content: '# 内容',
      subjectId: 1
    })
    console.log('创建成功，ID:', newArticle.id)
    await loadArticles() // 刷新列表
  } catch (error) {
    console.error('创建失败:', error)
  }
}

onMounted(() => {
  loadArticles()
})
</script>
```

### 在 Nuxt 中使用（未来）

```typescript
// composables/useArticle.ts (Nuxt)
import { useArticle as useArticleBase } from '@shared/composables/useArticle'

export function useArticle() {
  return useArticleBase()
}

// pages/articles/[id].vue
<script setup lang="ts">
const route = useRoute()
const articleManager = useArticle()
const article = ref(null)

const { data } = await useAsyncData('article', () => 
  articleManager.getDetail(route.params.id)
)

article.value = data.value
</script>
```

---

## 类型定义

### Article 类型

```typescript
interface Article {
  id?: number | string
  articleId?: number | string
  title: string
  subjectId?: number | string
  desc?: string
  content?: string
  cover?: string
  author?: string
  source?: string // 0-原创, 1-转载, 2-翻译
  publishTime?: string
  likeNum?: number
  readNum?: number
  commentNum?: number
  publishStatus?: string // 0-草稿, 1-已发布
  auditStatus?: string // 0-待审核, 1-已通过, 2-已拒绝
  scheduledPublishTime?: string
  sort?: number
  createTime?: string
  updateTime?: string
  userInfo?: {
    userName?: string
    nickName?: string
  }
}
```

---

## 最佳实践

### 1. 错误处理

所有方法都会抛出错误，建议使用 try-catch 包裹：

```typescript
try {
  await articleManager.createArticle(data)
  ElMessage.success('创建成功')
} catch (error) {
  ElMessage.error('创建失败')
  console.error(error)
}
```

### 2. 加载状态管理

在异步操作期间显示加载状态：

```typescript
const loading = ref(false)

const handleSubmit = async () => {
  loading.value = true
  try {
    await articleManager.updateArticle(formData)
    ElMessage.success('更新成功')
  } finally {
    loading.value = false
  }
}
```

### 3. 列表刷新

在增删改操作后刷新列表：

```typescript
const handleDelete = async (id: number) => {
  await articleManager.deleteArticle(id)
  ElMessage.success('删除成功')
  await loadArticles() // 刷新列表
}
```

---

## 迁移指南

### 从旧代码迁移

**旧代码：**
```javascript
import { listArticle, addArticle, updateArticle } from '@/api/post/article'

const getList = () => {
  listArticle(query).then(res => {
    list.value = res.data.list
  })
}
```

**新代码：**
```typescript
import { useArticle } from '@/composables/useArticle'

const articleManager = useArticle()

const getList = async () => {
  const { list } = await articleManager.loadList(query)
  articles.value = list
}
```

---

## 注意事项

1. **ID 字段兼容性**：文章数据可能同时包含 `id` 和 `articleId` 字段，组合函数会自动处理
2. **数字类型转换**：确保传递给 API 的数字字段是 Number 类型
3. **防抖处理**：对于频繁调用的操作（如自动保存），建议在调用层添加防抖
4. **平台适配**：在 Nuxt 中使用时，可能需要调整导入路径和 SSR 相关配置

---

## 常见问题

### Q: 如何在多个组件间共享文章数据？

A: 可以使用 Pinia store 或在父组件中管理状态，通过 props 传递给子组件。

### Q: 如何处理并发请求？

A: 每个方法都是独立的 Promise，可以并行调用：

```typescript
const [articles, detail] = await Promise.all([
  articleManager.loadList({ pageNum: 1, pageSize: 10 }),
  articleManager.getDetail(123)
])
```

### Q: 如何自定义错误处理？

A: 在调用时捕获错误并进行自定义处理：

```typescript
try {
  await articleManager.deleteArticle(id)
} catch (error) {
  if (error.response?.status === 403) {
    ElMessage.error('没有权限删除此文章')
  } else {
    ElMessage.error('删除失败')
  }
}
```

---

## 更新日志

- **v1.0.0** (2026-04-28): 初始版本，提供完整的文章管理功能
