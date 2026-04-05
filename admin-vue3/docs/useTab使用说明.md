# useTab Composable 使用说明

## 📋 简介

`useTab` 是一个用于操作标签页的 Composable 函数，提供了关闭、刷新、切换标签页等功能。它替代了原来的 `proxy.$tab` 插件方式，符合 Vue 3 Composition API 规范。

**文件位置**: `src/composables/useTab.ts`

**自动导入**: ✅ 已配置，无需手动 import

---

## 🚀 基本用法

```vue
<script setup>
// 自动导入，无需手动 import
const { closePage, refreshPage, openPage } = useTab()

// 直接使用
const handleClose = () => {
  closePage()
}
</script>
```

---

## 📚 API 文档

### 1. refreshPage - 刷新当前页签

刷新当前的标签页，会清除缓存并重新加载。

**参数**:
- `obj` (Object, 可选) - 指定要刷新的页签对象，不传则刷新当前页

**示例**:
```javascript
const { refreshPage } = useTab()

// 刷新当前页
refreshPage()

// 刷新指定页
refreshPage({ name: 'User', path: '/system/user', query: { id: 1 } })
```

---

### 2. closePage - 关闭指定页签

关闭指定的标签页，如果不传参数则关闭当前页。

**参数**:
- `obj` (Object, 可选) - 要关闭的页签对象

**示例**:
```javascript
const { closePage } = useTab()

// 关闭当前页
closePage()

// 关闭指定页
closePage({ path: '/system/user' })
```

---

### 3. closeOpenPage - 关闭当前页并打开新页

先关闭当前标签页，然后打开一个新的标签页。

**参数**:
- `obj` (Object) - 要打开的新页签对象

**示例**:
```javascript
const { closeOpenPage } = useTab()

// 关闭当前页并打开用户管理页
closeOpenPage({ path: '/system/user' })
```

---

### 4. closeAllPage - 关闭所有页签

关闭所有标签页（通常会保留首页）。

**示例**:
```javascript
const { closeAllPage } = useTab()

closeAllPage()
```

---

### 5. closeLeftPage - 关闭左侧页签

关闭当前页签左侧的所有页签。

**参数**:
- `obj` (Object, 可选) - 参考页签对象，默认为当前页

**示例**:
```javascript
const { closeLeftPage } = useTab()

// 关闭当前页左侧的所有页
closeLeftPage()

// 关闭指定页左侧的所有页
closeLeftPage({ path: '/system/user' })
```

---

### 6. closeRightPage - 关闭右侧页签

关闭当前页签右侧的所有页签。

**参数**:
- `obj` (Object, 可选) - 参考页签对象，默认为当前页

**示例**:
```javascript
const { closeRightPage } = useTab()

// 关闭当前页右侧的所有页
closeRightPage()
```

---

### 7. closeOtherPage - 关闭其他页签

关闭除指定页签外的所有页签。

**参数**:
- `obj` (Object, 可选) - 要保留的页签对象，默认为当前页

**示例**:
```javascript
const { closeOtherPage } = useTab()

// 只保留当前页，关闭其他所有页
closeOtherPage()

// 只保留指定页，关闭其他所有页
closeOtherPage({ path: '/system/user' })
```

---

### 8. openPage - 打开页签

打开一个新的标签页。

**参数**:
- `url` (String) - 要打开的路由地址

**示例**:
```javascript
const { openPage } = useTab()

// 打开用户管理页
openPage('/system/user')

// 带参数打开
openPage('/system/user/detail?id=1')
```

---

### 9. updatePage - 更新页签

更新标签页的信息（如标题等）。

**参数**:
- `obj` (Object) - 要更新的页签对象

**示例**:
```javascript
const { updatePage } = useTab()

updatePage({
  path: '/system/user',
  meta: { title: '用户管理（已更新）' }
})
```

---

## 💡 使用场景示例

### 场景 1: 表单提交后关闭当前页

```vue
<script setup>
const { closePage } = useTab()

const handleSubmit = async () => {
  await saveData()
  ElMessage.success('保存成功')
  closePage() // 关闭当前编辑页
}
</script>
```

### 场景 2: 删除成功后刷新列表

```vue
<script setup>
const { refreshPage } = useTab()

const handleDelete = async (id) => {
  await deleteItem(id)
  ElMessage.success('删除成功')
  refreshPage() // 刷新当前列表页
}
</script>
```

### 场景 3: 跳转到详情页并关闭当前页

```vue
<script setup>
const { closeOpenPage } = useTab()

const handleViewDetail = (id) => {
  closeOpenPage({ 
    path: '/system/user/detail',
    query: { id }
  })
}
</script>
```

### 场景 4: 批量操作后关闭其他页

```vue
<script setup>
const { closeOtherPage } = useTab()

const handleBatchOperation = async () => {
  await batchProcess()
  ElMessage.success('批量处理完成')
  closeOtherPage() // 只保留当前结果页
}
</script>
```

---

## 🔄 迁移指南

### 从 proxy.$tab 迁移到 useTab

**❌ 旧写法**:
```vue
<script setup>
const { proxy } = getCurrentInstance()

const handleClose = () => {
  proxy.$tab.closePage()
}

const handleRefresh = () => {
  proxy.$tab.refreshPage()
}
</script>
```

**✅ 新写法**:
```vue
<script setup>
// 自动导入，无需 import
const { closePage, refreshPage } = useTab()

const handleClose = () => {
  closePage()
}

const handleRefresh = () => {
  refreshPage()
}
</script>
```

---

## ⚠️ 注意事项

1. **自动导入**: `useTab` 已通过 auto-import 配置，无需手动 import
2. **类型支持**: TypeScript 类型已自动生成，IDE 会有完整的类型提示
3. **响应式**: 所有方法都是普通函数，不涉及响应式数据
4. **路由依赖**: 内部使用了 vue-router，确保在路由环境中使用

---

## 📝 完整示例

```vue
<template>
  <div class="user-management">
    <el-button @click="handleRefresh">刷新</el-button>
    <el-button @click="handleClose">关闭</el-button>
    <el-button @click="handleCloseAll">关闭全部</el-button>
    <el-button @click="handleGoToRole">前往角色管理</el-button>
  </div>
</template>

<script setup>
// 自动导入 useTab
const { refreshPage, closePage, closeAllPage, openPage } = useTab()

const handleRefresh = () => {
  refreshPage()
}

const handleClose = () => {
  closePage()
}

const handleCloseAll = () => {
  closeAllPage()
}

const handleGoToRole = () => {
  openPage('/system/role')
}
</script>
```

---

## 🔗 相关文档

- [Vue 3 Composition API](https://cn.vuejs.org/guide/extras/composition-api-faq.html)
- [unplugin-auto-import](https://github.com/unplugin/unplugin-auto-import)
- [System 模块 Proxy 重构计划](./System模块Proxy重构计划.md)

---

**更新时间**: 2026-04-06  
**维护者**: AI Assistant
