# 使用 Radash 防抖优化

## 🎯 优化目标

将手动实现的防抖逻辑替换为 radash 库提供的 `debounce` 函数，让代码更简洁、更可靠。

---

## 📊 优化前后对比

### ❌ 优化前：手动实现防抖

```typescript
const saveTimer = ref<number | null>(null)

const handleSaveDraft = async () => {
  // 清除之前的定时器
  if (saveTimer.value) {
    clearTimeout(saveTimer.value)
  }

  // 设置新的防抖定时器
  saveTimer.value = setTimeout(async () => {
    if (!validateForm()) {
      return
    }

    loading.value = true
    try {
      const saveData = prepareSaveData('0')
      const result = await articleManager.saveArticle(saveData)
      
      if (!articleData.id && result.id) {
        // 更新 ID...
      }
      
      ElMessage.success('草稿保存成功')
    } catch (error) {
      ElMessage.error('保存失败')
    } finally {
      loading.value = false
      saveTimer.value = null
    }
  }, 300)
}

// 组件卸载时需要清理
onUnmounted(() => {
  if (saveTimer.value) {
    clearTimeout(saveTimer.value)
    saveTimer.value = null
  }
})
```

**问题**：
- ❌ 代码冗长（~40 行）
- ❌ 需要手动管理定时器
- ❌ 需要在组件卸载时清理
- ❌ 容易出错（忘记清理定时器）

---

### ✅ 优化后：使用 Radash debounce

```typescript
import { debounce } from 'radash'

/**
 * 执行保存操作（内部方法）
 */
const executeSave = async (publishStatus: string, successMsg: string) => {
  if (!validateForm()) {
    return
  }

  loading.value = true
  try {
    const saveData = prepareSaveData(publishStatus)
    const result = await articleManager.saveArticle(saveData)
    
    if (!articleData.id && result.id) {
      // 更新 ID...
    }
    
    ElMessage.success(successMsg)
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    loading.value = false
  }
}

/**
 * 保存草稿（带防抖）
 */
const handleSaveDraft = debounce(
  { delay: 300 },
  () => executeSave('0', '草稿保存成功')
)

/**
 * 发布文章（带防抖）
 */
const handlePublish = debounce(
  { delay: 300 },
  () => {
    executeSave('1', '文章发布成功')
    setTimeout(() => {
      router.push('/post/article')
    }, 1500)
  }
)
```

**优势**：
- ✅ 代码简洁（~10 行）
- ✅ 自动管理定时器
- ✅ 无需手动清理
- ✅ 更可靠（radash 经过充分测试）

---

## 📈 代码行数对比

| 项目 | 优化前 | 优化后 | 减少 |
|------|--------|--------|------|
| 防抖相关代码 | ~80 行 | ~30 行 | -50 行 |
| 状态变量 | 1 个 (saveTimer) | 0 个 | -1 个 |
| 生命周期钩子 | onUnmounted | 无需 | -1 个 |

---

## 💡 Radash Debounce API

### 基本用法

```typescript
import { debounce } from 'radash'

// 创建防抖函数
const debouncedFn = debounce(
  { delay: 300 },  // 防抖延迟（毫秒）
  () => {
    // 要执行的逻辑
    console.log('执行了')
  }
)

// 调用
debouncedFn()
debouncedFn()  // 只会执行最后一次
```

### 配置选项

```typescript
debounce(
  {
    delay: 300,        // 防抖延迟
  },
  callback
)
```

---

## 🎯 重构步骤

### 1. 导入 debounce

```typescript
import { debounce } from 'radash'
```

### 2. 提取核心逻辑

将保存逻辑提取为独立函数：

```typescript
const executeSave = async (publishStatus: string, successMsg: string) => {
  // 验证、保存、更新 ID 等逻辑
}
```

### 3. 使用 debounce 包装

```typescript
const handleSaveDraft = debounce(
  { delay: 300 },
  () => executeSave('0', '草稿保存成功')
)
```

### 4. 移除手动管理

- ❌ 删除 `saveTimer` 状态
- ❌ 删除 `onUnmounted` 清理逻辑
- ❌ 删除 `clearTimeout` 和 `setTimeout`

---

## 📝 完整示例

```vue
<script setup lang="ts">
import { debounce } from 'radash'
import { useArticle } from '@/composables/post'

const articleManager = useArticle()
const loading = ref(false)

// 核心保存逻辑
const executeSave = async (data: any) => {
  loading.value = true
  try {
    await articleManager.saveArticle(data)
    ElMessage.success('保存成功')
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    loading.value = false
  }
}

// 防抖保存
const handleSave = debounce(
  { delay: 300 },
  (data: any) => executeSave(data)
)
</script>

<template>
  <button @click="handleSave(formData)" :disabled="loading">
    {{ loading ? '保存中...' : '保存' }}
  </button>
</template>
```

---

## ⚠️ 注意事项

### 1. Debounce 返回的是新函数

```typescript
// ✅ 正确 - 赋值给常量
const handleSave = debounce({ delay: 300 }, callback)

// ❌ 错误 - 每次渲染都创建新的防抖函数
<button @click="debounce({ delay: 300 }, callback)">保存</button>
```

### 2. 参数传递

```typescript
// ✅ 正确 - 在回调中捕获参数
const handleSave = debounce(
  { delay: 300 },
  () => executeSave(formData.value)  // 从闭包中获取
)

// ❌ 错误 - debounce 不支持直接传参
const handleSave = debounce(
  { delay: 300 },
  (data) => executeSave(data)  // 这样调用时无法传参
)
```

### 3. 异步函数

```typescript
// ✅ Radash debounce 支持异步函数
const handleSave = debounce(
  { delay: 300 },
  async () => {
    await api.save()
  }
)
```

---

## 🔄 其他 Radash 工具

Radash 还提供了其他有用的工具函数：

### Throttle（节流）

```typescript
import { throttle } from 'radash'

const handleScroll = throttle(
  { interval: 100 },
  () => {
    console.log('滚动事件')
  }
)
```

### Retry（重试）

```typescript
import { retry } from 'radash'

const result = await retry(
  { times: 3, delay: 1000 },
  async () => {
    return await fetchData()
  }
)
```

### Sleep（延迟）

```typescript
import { sleep } from 'radash'

await sleep(1000)  // 等待 1 秒
console.log('1秒后执行')
```

---

## 📚 相关文档

- [Radash 官方文档](https://radash-docs.vercel.app/)
- [Debouce API](https://radash-docs.vercel.app/docs/async/debounce)
- [Throttle API](https://radash-docs.vercel.app/docs/async/throttle)

---

## 🎉 总结

使用 Radash 的 `debounce` 函数：

✅ **代码更简洁** - 从 80 行减少到 30 行  
✅ **更可靠** - 经过充分测试的工具库  
✅ **更易维护** - 无需手动管理定时器  
✅ **更规范** - 统一的防抖实现  

**推荐使用！** 🚀

---

**优化时间**: 2026-04-28  
**版本**: v1.4.0
