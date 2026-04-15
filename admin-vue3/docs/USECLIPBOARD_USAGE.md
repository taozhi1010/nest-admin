# useClipboard 剪贴板 Composable

## 概述

`useClipboard` 是一个用于处理剪贴板操作的 Vue3 Composable，提供了现代化的剪贴板 API 支持，并包含降级方案以兼容旧版浏览器。

## 特性

- ✅ 使用现代 `navigator.clipboard` API
- ✅ 自动降级到传统 `document.execCommand` 方法
- ✅ TypeScript 支持
- ✅ 响应式状态管理
- ✅ 完善的错误处理
- ✅ 移动端兼容

## 使用方法

### 基础用法

```vue
<script setup>
import { useClipboard } from '@/composables/useClipboard'

const { copy, copied, error } = useClipboard()

const handleCopy = async () => {
  try {
    await copy('要复制的文本')
    console.log('复制成功')
  } catch (err) {
    console.error('复制失败:', err)
  }
}
</script>

<template>
  <div>
    <button @click="handleCopy">复制文本</button>
    <p v-if="copied" style="color: green">已复制到剪贴板!</p>
    <p v-if="error" style="color: red">{{ error }}</p>
  </div>
</template>
```

### 在表单中使用

```vue
<script setup>
import { ref } from 'vue'
import { useClipboard } from '@/composables/useClipboard'

const inputText = ref('')
const { copy, copied } = useClipboard()

const copyInput = async () => {
  if (!inputText.value) return
  
  try {
    await copy(inputText.value)
  } catch (err) {
    console.error('复制失败:', err)
  }
}
</script>

<template>
  <div>
    <input v-model.trim="inputText" placeholder="输入要复制的文本" />
    <button @click="copyInput" :disabled="!inputText">
      {{ copied ? '已复制!' : '复制' }}
    </button>
  </div>
</template>
```

### 带回调的使用

```vue
<script setup>
import { useClipboard } from '@/composables/useClipboard'

const { copy } = useClipboard()

const copyWithFeedback = async (text) => {
  try {
    await copy(text)
    // 显示成功提示
    ElMessage.success('复制成功')
  } catch (err) {
    // 显示错误提示
    ElMessage.error('复制失败')
  }
}
</script>
```

## API

### 返回值

| 属性 | 类型 | 说明 |
|------|------|------|
| `copy` | `(text: string) => Promise<void>` | 复制文本到剪贴板的函数 |
| `copied` | `Ref<boolean>` | 是否刚刚完成复制操作（2秒后自动重置） |
| `error` | `Ref<string \| null>` | 错误信息，无错误时为 `null` |

### 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `text` | `string` | 是 | 要复制到剪贴板的文本内容 |

## 注意事项

1. **HTTPS 要求**: `navigator.clipboard` API 只在 HTTPS 环境下可用（localhost 除外）
2. **用户交互**: 某些浏览器要求复制操作必须由用户交互触发（如点击事件）
3. **权限**: 第一次使用时浏览器可能会请求剪贴板权限
4. **兼容性**: 对于不支持 Clipboard API 的浏览器，会自动降级到传统方法

## 迁移指南

### 从指令方式迁移

**之前（指令方式）:**
```vue
<template>
  <span v-copyText="textToCopy">点击复制</span>
</template>
```

**现在（Composable 方式）:**
```vue
<script setup>
import { useClipboard } from '@/composables/useClipboard'

const textToCopy = ref('要复制的文本')
const { copy } = useClipboard()

const handleCopy = () => {
  copy(textToCopy.value)
}
</script>

<template>
  <span @click="handleCopy" style="cursor: pointer">点击复制</span>
</template>
```

### 优势对比

| 特性 | 指令方式 | Composable 方式 |
|------|----------|-----------------|
| TypeScript 支持 | ❌ | ✅ |
| 错误处理 | 有限 | 完善 |
| 状态管理 | 无 | 响应式状态 |
| 可测试性 | 困难 | 容易 |
| 组合使用 | 困难 | 容易 |
| 代码复用 | 一般 | 优秀 |

## 最佳实践

1. **总是处理错误**: 使用 try-catch 包裹 copy 调用
2. **提供用户反馈**: 利用 `copied` 状态或自定义消息提示
3. **验证输入**: 在复制前检查文本是否为空
4. **用户交互**: 确保复制操作由用户主动触发

## 示例项目

查看项目中的实际使用示例，了解更多高级用法。
