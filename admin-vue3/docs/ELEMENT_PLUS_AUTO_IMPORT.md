# Element Plus 自动导入使用说明

## 配置说明

已在 `vite/plugins/auto-import.js` 中配置了 Element Plus 常用方法的自动导入，无需手动 import。

## 可用的自动导入方法

### 1. ElMessage - 消息提示

```vue
<script setup>
// 无需 import，直接使用

// 成功消息
ElMessage.success('操作成功')

// 错误消息
ElMessage.error('操作失败')

// 警告消息
ElMessage.warning('请注意')

// 信息消息
ElMessage.info('提示信息')

// 自定义配置
ElMessage({
  message: '自定义消息',
  type: 'success',
  duration: 5000,
  showClose: true
})
</script>
```

### 2. ElMessageBox - 消息框

```vue
<script setup>
// 确认对话框
const handleDelete = async () => {
  try {
    await ElMessageBox.confirm('确定要删除吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    // 用户点击确定后的逻辑
    console.log('删除成功')
  } catch {
    // 用户点击取消
    console.log('取消删除')
  }
}

// 提示输入框
const handleInput = async () => {
  try {
    const { value } = await ElMessageBox.prompt('请输入内容', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })
    console.log('输入的内容:', value)
  } catch {
    console.log('取消输入')
  }
}

// 警告框
ElMessageBox.alert('这是一段提示信息', '标题', {
  confirmButtonText: '确定'
})
</script>
```

### 3. ElNotification - 通知

```vue
<script setup>
// 成功通知
ElNotification.success({
  title: '成功',
  message: '这是一条成功的提示消息',
  duration: 3000
})

// 错误通知
ElNotification.error({
  title: '错误',
  message: '这是一条错误的提示消息'
})

// 警告通知
ElNotification.warning('这是一条警告的提示消息')

// 信息通知
ElNotification.info('这是一条信息的提示消息')
</script>
```

### 4. ElLoading - 加载服务

```vue
<script setup>
// 打开全屏加载
const loadingInstance = ElLoading.service({
  lock: true,
  text: '加载中...',
  background: 'rgba(0, 0, 0, 0.7)'
})

// 关闭加载
loadingInstance.close()

// 或者使用 try-finally 确保关闭
const handleSubmit = async () => {
  const loading = ElLoading.service({ text: '提交中...' })
  try {
    await api.submit()
    ElMessage.success('提交成功')
  } catch (error) {
    ElMessage.error('提交失败')
  } finally {
    loading.close()
  }
}
</script>
```

## 迁移指南

### 从 proxy.$modal 迁移

**旧代码：**
```vue
<script setup>
const { proxy } = getCurrentInstance()

const handleSubmit = async () => {
  proxy.$modal.msgSuccess('操作成功')
  proxy.$modal.msgError('操作失败')
  await proxy.$modal.confirm('确定要删除吗？')
}
</script>
```

**新代码：**
```vue
<script setup>
// 无需 getCurrentInstance 和 proxy

const handleSubmit = async () => {
  ElMessage.success('操作成功')
  ElMessage.error('操作失败')
  await ElMessageBox.confirm('确定要删除吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
}
</script>
```

### 从 useMessage 迁移（可选）

如果你之前使用了 `useMessage()` composable，现在可以直接使用原生方法：

**旧代码：**
```vue
<script setup>
import { useMessage } from '@/composables/useMessage'

const { success, error, confirm } = useMessage()

const handleSubmit = () => {
  success('操作成功')
}
</script>
```

**新代码：**
```vue
<script setup>
// 直接使用，无需导入
const handleSubmit = () => {
  ElMessage.success('操作成功')
}
</script>
```

> **注意**: `useMessage()` composable 仍然保留，如果你更喜欢简洁的方法名（如 `success` 而不是 `ElMessage.success`），可以继续使用。

## 优势

1. ✅ **无需手动导入** - 在任何 Vue 文件中直接使用
2. ✅ **类型支持** - 自动生成 TypeScript 类型声明
3. ✅ **按需加载** - unplugin-auto-import 会自动处理 tree-shaking
4. ✅ **统一标准** - 直接使用 Element Plus 官方 API，减少封装层
5. ✅ **更好的 IDE 支持** - 自动补全和类型提示

## 注意事项

1. 修改配置后需要重启开发服务器
2. 首次使用时，`auto-imports.d.ts` 文件会自动生成类型声明
3. 如果 IDE 没有提示，可以尝试重启 TypeScript 服务
