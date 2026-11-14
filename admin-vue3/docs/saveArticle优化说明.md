# saveArticle 方法优化说明

## 🎯 优化内容

将 `createArticle` 和 `updateArticle` 两个方法合并为一个 `saveArticle` 方法，自动判断是新增还是更新。

---

## 📊 优化前后对比

### ❌ 优化前：需要分别调用两个方法

```typescript
// 页面中需要判断是新增还是编辑
const handleSubmit = async () => {
  if (formData.id) {
    // 编辑模式
    await articleManager.updateArticle(formData)
    ElMessage.success('更新成功')
  } else {
    // 新增模式
    const newArticle = await articleManager.createArticle(formData)
    formData.id = newArticle.id
    ElMessage.success('创建成功')
  }
}
```

**问题**：
- ❌ 每个页面都要写判断逻辑
- ❌ 代码重复
- ❌ 容易出错（忘记处理 ID）

---

### ✅ 优化后：统一使用 saveArticle

```typescript
// 页面中直接调用，无需判断
const handleSubmit = async () => {
  const result = await articleManager.saveArticle(formData)
  
  // 如果是新建，保存成功后会返回新的 ID
  if (!formData.id && result.id) {
    formData.id = result.id
  }
  
  ElMessage.success(formData.id ? '更新成功' : '创建成功')
}
```

**优势**：
- ✅ 不需要在页面中判断
- ✅ 代码更简洁
- ✅ 统一的错误处理
- ✅ 自动返回最新的文章数据

---

## 💡 工作原理

`saveArticle` 方法会自动检查数据中是否有 `id` 或 `articleId`：

```typescript
const saveArticle = async (data: Partial<Article>): Promise<Article> => {
  // 判断是新增还是更新
  const hasId = !!(data.id || data.articleId)
  
  if (hasId) {
    // 有 ID → 调用更新接口
    return await updateArticle(data)
  } else {
    // 无 ID → 调用创建接口
    return await addArticle(data)
  }
}
```

---

## 📝 使用示例

### 示例 1：创建新文章

```typescript
// 没有 ID，自动调用创建接口
const newArticle = await articleManager.saveArticle({
  title: '新文章',
  content: '文章内容',
  subjectId: 1
})

console.log('新文章 ID:', newArticle.id)
```

### 示例 2：更新文章

```typescript
// 有 ID，自动调用更新接口
await articleManager.saveArticle({
  id: 123,
  title: '修改后的标题',
  content: '更新的内容'
})

console.log('更新成功')
```

### 示例 3：在表单中使用

```vue
<script setup lang="ts">
import { useArticle } from '@/composables/useArticle'

const articleManager = useArticle()
const formData = reactive({
  id: undefined,
  title: '',
  content: ''
})

const handleSubmit = async () => {
  try {
    const result = await articleManager.saveArticle(formData)
    
    // 如果是新建，更新 ID
    if (!formData.id && result.id) {
      formData.id = result.id
    }
    
    ElMessage.success('保存成功')
  } catch (error) {
    ElMessage.error('保存失败')
  }
}
</script>
```

---

## 🔄 迁移指南

### 如果你的代码还在使用旧方法

#### 方式 1：直接使用新方法（推荐）

```typescript
// 旧代码
if (formData.id) {
  await articleManager.updateArticle(formData)
} else {
  await articleManager.createArticle(formData)
}

// 新代码
await articleManager.saveArticle(formData)
```

#### 方式 2：暂时保留兼容（不推荐）

如果需要过渡期，可以在组合函数中添加别名：

```typescript
export function useArticle() {
  const saveArticle = async (data: Partial<Article>) => {
    // ... 实现
  }
  
  return {
    saveArticle,
    // 兼容旧代码（后续可删除）
    createArticle: saveArticle,
    updateArticle: saveArticle
  }
}
```

---

## ✨ 核心优势

### 1. 简化页面逻辑

**优化前**：
```typescript
// 每个页面都要写
if (formData.id) {
  await updateArticle(formData)
} else {
  await createArticle(formData)
}
```

**优化后**：
```typescript
// 一行搞定
await saveArticle(formData)
```

### 2. 减少代码重复

不再需要在多个页面中重复相同的判断逻辑。

### 3. 统一的错误处理

所有保存操作都有统一的错误日志：
```typescript
try {
  await articleManager.saveArticle(data)
} catch (error) {
  // 自动输出："创建文章失败" 或 "更新文章失败"
}
```

### 4. 更好的类型安全

```typescript
// TypeScript 会提示返回的是 Article 类型
const result = await articleManager.saveArticle(data)
// result.id, result.title 等都有智能提示
```

---

## 🎓 最佳实践

### 1. 保存后获取新 ID

```typescript
const handleSubmit = async () => {
  const result = await articleManager.saveArticle(formData)
  
  // 如果是新建，更新本地 ID
  if (!formData.id && result.id) {
    formData.id = result.id
    
    // 可以更新 URL
    router.replace({ query: { id: result.id } })
  }
}
```

### 2. 保存后刷新列表

```typescript
const handleSave = async () => {
  await articleManager.saveArticle(formData)
  
  // 刷新列表
  await loadList()
  
  ElMessage.success('保存成功')
}
```

### 3. 防抖处理（编辑器场景）

```typescript
import { debounce } from 'lodash-es'

const autoSave = debounce(async () => {
  try {
    const result = await articleManager.saveArticle(formData)
    
    if (!formData.id && result.id) {
      formData.id = result.id
    }
    
    console.log('自动保存成功')
  } catch (error) {
    console.error('自动保存失败:', error)
  }
}, 1000)

// 监听内容变化
watch(content, () => {
  autoSave()
})
```

---

## ❓ 常见问题

### Q: 如果我想明确知道是创建还是更新怎么办？

A: 可以根据是否有 ID 来判断：

```typescript
const isUpdate = !!formData.id
const result = await articleManager.saveArticle(formData)

if (isUpdate) {
  console.log('更新成功')
} else {
  console.log('创建成功，ID:', result.id)
}
```

### Q: 旧的 createArticle 和 updateArticle 还能用吗？

A: 在新版本中已经移除，建议迁移到 `saveArticle`。如果项目中还有旧代码，可以快速替换：

```bash
# 全局替换
createArticle( → saveArticle(
updateArticle( → saveArticle(
```

### Q: 性能有影响吗？

A: 没有影响。只是在内部多了一个简单的判断（检查是否有 ID），性能开销可以忽略不计。

---

## 📈 总结

| 维度 | 优化前 | 优化后 |
|------|--------|--------|
| 方法数量 | 2 个 | 1 个 |
| 页面代码 | 需要判断 | 直接调用 |
| 代码重复 | 高 | 低 |
| 维护成本 | 高 | 低 |
| 易用性 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

**推荐使用 `saveArticle`！** 🚀

---

**优化时间**: 2026-04-28  
**版本**: v1.1.0
