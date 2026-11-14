# Editor 组件重构为使用 Composable

## 🎯 重构目标

将 `editor.vue` 组件中的业务逻辑抽取到 `useArticleEditor.ts` 组合函数中，让组件更简洁、更易维护。

---

## 📊 重构前后对比

### ❌ 重构前：所有逻辑在组件中

```vue
<script setup name="ArticleEditor">
import { getArticle, addArticle, updateArticle } from '@/api/post/article'

const route = useRoute()
const router = useRouter()
const subject = useSubject()
// ... 更多导入

// 200+ 行的业务逻辑
const title = ref('')
const content = ref('')
const handleSaveDraft = async () => { /* ... */ }
const handlePublish = async () => { /* ... */ }
// ... 更多代码
</script>
```

**问题**：
- ❌ 组件文件过大（534 行）
- ❌ 业务逻辑和 UI 混在一起
- ❌ 难以测试
- ❌ 难以复用

---

### ✅ 重构后：使用 Composable

```vue
<script setup name="ArticleEditor">
import MdEditor from '@/components/MdEditor/index.vue'
import ImageUploadCover from '@/components/ImageUploadCover/index.vue'
import { useArticleEditor } from './useArticleEditor'

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
```

**优势**：
- ✅ 组件文件小巧（140 行）
- ✅ 业务逻辑分离
- ✅ 易于测试
- ✅ 易于复用

---

## 📈 代码行数对比

| 项目 | 重构前 | 重构后 | 减少 |
|------|--------|--------|------|
| editor.vue | 534 行 | 140 行 | ⬇️ 74% |
| script 部分 | 264 行 | 20 行 | ⬇️ 92% |
| 业务逻辑 | 全部在组件 | 移到 composable | ✅ 完全分离 |

---

## 💡 核心改进

### 1. 导入简化

#### 之前
```typescript
import { getArticle, addArticle, updateArticle } from '@/api/post/article'
import { useSubject } from '@/composables/post'
import { useDynamicTitle } from '@/composables/useDynamicTitle'
import { useDict } from '@/composables/useDict'
// ... 更多导入
```

#### 现在
```typescript
import { useArticleEditor } from './useArticleEditor'
```

### 2. 状态管理

#### 之前
```typescript
const title = ref('')
const content = ref('')
const loading = ref(false)
const isEdit = ref(false)
// ... 10+ 个状态变量
```

#### 现在
```typescript
const { title, content, loading, isEdit } = useArticleEditor()
```

### 3. 方法调用

#### 之前
```typescript
const handleSaveDraft = async () => {
  // 100+ 行的保存逻辑
}
```

#### 现在
```typescript
const { handleSaveDraft } = useArticleEditor()
```

---

## 🎯 使用方式

### 模板中使用

```vue
<template>
  <div class="article-editor-container">
    <!-- 标题输入 -->
    <el-input
      v-model="title"
      @input="handleTitleInput"
    />
    
    <!-- 内容编辑器 -->
    <MdEditor v-model="content" />
    
    <!-- 操作按钮 -->
    <el-button @click="handleSaveDraft" :loading="loading">
      存草稿
    </el-button>
    <el-button @click="handlePublish" :loading="loading">
      发布
    </el-button>
    
    <!-- 侧边栏 -->
    <div :class="{ 'collapsed': sidebarCollapsed }">
      <el-button @click="toggleSidebar">
        切换
      </el-button>
    </div>
  </div>
</template>
```

### Script 中使用

```vue
<script setup name="ArticleEditor">
import { useArticleEditor } from './useArticleEditor'

const {
  // 状态
  title,
  content,
  loading,
  isEdit,
  subjectList,
  sidebarCollapsed,
  articleData,
  post_article_source,
  
  // 方法
  handleTitleInput,
  toggleSidebar,
  handleSaveDraft,
  handlePublish
} = useArticleEditor()
</script>
```

---

## 📦 Composable 提供的功能

### 状态

| 属性 | 类型 | 说明 |
|------|------|------|
| `title` | Ref\<string\> | 文章标题 |
| `content` | Ref\<string\> | 文章内容 |
| `loading` | Ref\<boolean\> | 加载状态 |
| `isEdit` | Ref\<boolean\> | 是否编辑模式 |
| `subjectList` | Ref\<Array\> | 专栏列表 |
| `sidebarCollapsed` | Ref\<boolean\> | 侧边栏是否收起 |
| `articleData` | Reactive\<Article\> | 文章完整数据 |
| `post_article_source` | Ref\<Array\> | 文章来源字典 |

### 方法

| 方法 | 说明 |
|------|------|
| `handleTitleInput(value)` | 标题输入处理 |
| `toggleSidebar()` | 切换侧边栏 |
| `handleSaveDraft()` | 保存草稿（防抖） |
| `handlePublish()` | 发布文章（防抖） |

---

## 🔧 内部实现

`useArticleEditor` 内部使用了：

1. **useArticle** - 文章管理
   ```typescript
   const articleManager = useArticle()
   await articleManager.saveArticle(data)
   ```

2. **useSubject** - 专栏管理
   ```typescript
   const subject = useSubject()
   await subject.getList()
   ```

3. **useDynamicTitle** - 动态标题
   ```typescript
   const { setTitle } = useDynamicTitle()
   setTitle('文章编辑 - 编辑器')
   ```

4. **useDict** - 字典管理
   ```typescript
   const { post_article_source } = useDict('post_article_source')
   ```

5. **Radash Debounce** - 防抖
   ```typescript
   import { debounce } from 'radash'
   
   const handleSaveDraft = debounce(
     { delay: 300 },
     () => executeSave('0', '草稿保存成功')
   )
   ```

---

## ✨ 优势总结

### 1. 代码组织

```
✅ 清晰的职责分离
   - editor.vue: 只负责 UI
   - useArticleEditor.ts: 只负责业务逻辑

✅ 易于理解
   - 组件代码简洁明了
   - 业务逻辑集中在一个地方
```

### 2. 可维护性

```
✅ 修改业务逻辑
   - 只需修改 useArticleEditor.ts
   - 不影响组件结构

✅ 修改 UI
   - 只需修改 editor.vue
   - 不影响业务逻辑
```

### 3. 可测试性

```typescript
// 可以轻松测试业务逻辑
import { useArticleEditor } from './useArticleEditor'

test('should save draft', async () => {
  const { handleSaveDraft } = useArticleEditor()
  await handleSaveDraft()
  // 断言...
})
```

### 4. 可复用性

```vue
<!-- 可以在其他组件中复用 -->
<script setup>
import { useArticleEditor } from './useArticleEditor'

const { handleSaveDraft } = useArticleEditor()
</script>
```

---

## 📝 迁移步骤

如果你有其他类似的组件需要重构：

### 步骤 1：创建 Composable

```typescript
// useXxx.ts
export function useXxx() {
  // 移动业务逻辑到这里
  return {
    // 返回状态和方法
  }
}
```

### 步骤 2：更新组件

```vue
<script setup>
import { useXxx } from './useXxx'

const { /* 解构需要的内容 */ } = useXxx()
</script>
```

### 步骤 3：删除旧代码

- 删除组件中的业务逻辑
- 保留模板和样式

### 步骤 4：测试

确保功能正常工作。

---

## ⚠️ 注意事项

### 1. 响应式数据

Composable 返回的响应式数据可以直接在模板中使用：

```vue
<template>
  <!-- ✅ 正确 - 直接使用 -->
  <div>{{ title }}</div>
  
  <!-- ❌ 错误 - 不需要 .value -->
  <div>{{ title.value }}</div>
</template>
```

### 2. 方法调用

```vue
<template>
  <!-- ✅ 正确 - 直接调用 -->
  <button @click="handleSaveDraft">保存</button>
</template>
```

### 3. 生命周期

Composable 内部已经处理了生命周期，组件无需关心：

```typescript
// useArticleEditor.ts 内部
onMounted(() => {
  // 初始化逻辑
})

onUnmounted(() => {
  // 清理逻辑
})
```

---

## 📚 相关文档

- [useArticleEditor 使用指南](./README_useArticleEditor.md)
- [使用 Radash 防抖优化](./使用Radash防抖优化.md)
- [清理自动导入的冗余 import](./清理自动导入的冗余import.md)

---

## 🎉 总结

通过将业务逻辑抽取到 Composable：

✅ **组件更简洁** - 从 534 行减少到 140 行  
✅ **逻辑更清晰** - 业务和 UI 完全分离  
✅ **更易维护** - 修改一处，影响明确  
✅ **更易测试** - 可以独立测试业务逻辑  
✅ **更易复用** - 其他组件也可以使用  

**推荐使用 Composable 模式！** 🚀

---

**重构时间**: 2026-04-28  
**版本**: v2.0.0
