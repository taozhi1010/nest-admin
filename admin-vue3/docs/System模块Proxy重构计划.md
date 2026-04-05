# System 模块 Proxy 重构计划

## 📋 概述

本文档记录了 system 目录下 `proxy` 引用的重构工作进展。目前已完成大部分重构工作，包括 `proxy.$modal`、`proxy.$refs` 和 `proxy.$tab` 的替换。

## ✅ 已完成的重构

### 1. proxy.$modal 替换（全部完成）

以下模块已完全移除 `proxy.$modal` 并替换为 Element Plus 原生 API：

1. **通知公告模块** - `src/views/system/notice/index.vue`
2. **参数配置模块** - `src/views/system/config/index.vue`
3. **字典管理模块** - `src/views/system/dict/` (包含子组件)
4. **菜单管理模块** - `src/views/system/menu/index.vue`
5. **岗位管理模块** - `src/views/system/post/index.vue`
6. **角色管理模块** - `src/views/system/role/index.vue`
7. **部门管理模块** - `src/views/system/dept/index.vue`

### 2. proxy.$refs 和 proxy.$tab 替换（部分完成）

以下模块已完成 `proxy.$refs` 和 `proxy.$tab` 的重构：

1. ✅ **角色管理模块** - `src/views/system/role/` (所有文件)
   - `index.vue` - 已移除所有 proxy 引用
   - `selectUser.vue` - 已移除所有 proxy 引用
   - `authUser.vue` - 已移除所有 proxy 引用

2. ✅ **部门管理模块** - `src/views/system/dept/index.vue`
   - 已移除所有 proxy 引用

3. ⏸️ **用户个人资料模块** - `src/views/system/user/profile/` (部分完成)
   - `userAvatar.vue` - ✅ 已完成（无 proxy 引用）
   - `userInfo.vue` - ⏸️ 待处理（仍使用 `proxy.$refs.userInfoRef.validate()`）
   - `resetPwd.vue` - ⏸️ 待处理（仍使用 `proxy.$refs.pwdRef.validate()`）

4. ⏸️ **用户角色授权模块** - `src/views/system/user/authRole.vue`
   - ⏸️ 待处理（仍使用 `proxy.$refs['roleRef'].toggleRowSelection()`）

## ⏸️ 待重构的文件

以下文件仍使用了 `proxy.$refs`，需要进一步重构：

### 1. 用户个人资料模块

#### 文件列表
- `src/views/system/user/profile/userInfo.vue`
- `src/views/system/user/profile/resetPwd.vue`
- `src/views/system/user/profile/userAvatar.vue`

#### 当前使用的 Proxy API
```javascript
// userInfo.vue (第 71 行)
await proxy.$refs.userInfoRef.validate()

// resetPwd.vue (第 66 行)
await proxy.$refs.pwdRef.validate()
```

#### 重构方案
```javascript
// userInfo.vue
const userInfoRef = ref(null)
await userInfoRef.value.validate()

// resetPwd.vue
const pwdRef = ref(null)
await pwdRef.value.validate()

// 注意：这两个文件中的 proxy.$tab.closePage() 已在之前移除
// 如需关闭页面，可使用 router.back() 或 router.push()
```

---

### 2. 用户角色授权模块

#### 文件
- `src/views/system/user/authRole.vue`

#### 当前使用的 Proxy API
```javascript
// authRole.vue (第 82, 127 行)
proxy.$refs['roleRef'].toggleRowSelection(row)
```

#### 重构方案
```javascript
// 使用模板 ref
const roleRef = ref(null)
roleRef.value.toggleRowSelection(row)

// 注意：该文件中的 proxy.$tab.closeOpenPage() 已在之前移除
// 如需跳转，可使用 router.push('/system/user')
```

---

### 3. ~~角色管理模块~~ ✅ 已完成

**状态**: 已完成重构，所有文件已移除 proxy 引用

- ✅ `src/views/system/role/index.vue`
- ✅ `src/views/system/role/selectUser.vue`
- ✅ `src/views/system/role/authUser.vue`

---

### 4. ~~部门管理模块~~ ✅ 已完成

**状态**: 已完成重构，已移除 proxy 引用

- ✅ `src/views/system/dept/index.vue`

---

## 🎯 重构目标

### 短期目标
1. ✅ 移除所有 `proxy.$modal` 使用（已完成）
2. ✅ 移除角色管理和部门管理模块的 `proxy.$refs` 使用（已完成）
3. ⏸️ 移除用户个人资料模块的 `proxy.$refs` 使用（待处理）
4. ⏸️ 移除用户角色授权模块的 `proxy.$refs` 使用（待处理）
5. ⏸️ 移除不必要的 `getCurrentInstance()` 调用（待处理）

### 长期目标
1. 完全消除对 `proxy` 的依赖
2. 统一使用 Vue 3 Composition API
3. 提高代码可测试性和可维护性

---

## 📝 重构规范

### 1. 表单验证重构

**❌ 旧写法**
```javascript
const { proxy } = getCurrentInstance()

proxy.$refs['formRef'].validate((valid) => {
  if (valid) {
    // 提交逻辑
  }
})
```

**✅ 新写法**
```javascript
const formRef = ref(null)

formRef.value.validate((valid) => {
  if (valid) {
    // 提交逻辑
  }
})
```

---

### 2. 表格操作重构

**❌ 旧写法**
```javascript
const { proxy } = getCurrentInstance()

proxy.$refs['tableRef'].toggleRowSelection(row)
```

**✅ 新写法**
```javascript
const tableRef = ref(null)

tableRef.value.toggleRowSelection(row)
```

---

### 3. 页面跳转重构

**❌ 旧写法**
```javascript
const { proxy } = getCurrentInstance()

proxy.$tab.closePage()
proxy.$tab.closeOpenPage({ path: '/system/user' })
```

**✅ 新写法**
```javascript
import { useRouter } from 'vue-router'

const router = useRouter()

// 关闭当前页并返回
router.back()

// 跳转到指定页面
router.push('/system/user')
```

---

## 🔧 实施步骤

### ~~第一步：用户个人资料模块~~ ⏸️ 待处理
1. ⏸️ 修改 `userInfo.vue` - 替换 `proxy.$refs.userInfoRef` 为模板 ref
2. ⏸️ 修改 `resetPwd.vue` - 替换 `proxy.$refs.pwdRef` 为模板 ref
3. ✅ `userAvatar.vue` - 已完成（无 proxy 引用）
4. 测试验证
5. 提交

### ~~第二步：用户角色授权模块~~ ⏸️ 待处理
1. ⏸️ 修改 `authRole.vue` - 替换 `proxy.$refs['roleRef']` 为模板 ref
2. 测试验证
3. 提交

### ~~第三步：角色管理模块~~ ✅ 已完成
- 所有文件已完成重构

### ~~第四步：部门管理模块~~ ✅ 已完成
- 文件已完成重构

---

## ⚠️ 注意事项

1. **保持向后兼容**：确保重构后的功能与原来完全一致
2. **充分测试**：每个模块重构后都要进行完整的功能测试
3. **分模块提交**：按照模块逐个提交，便于回滚和审查
4. **更新文档**：重构完成后更新相关文档
5. **代码审查**：提交前进行代码审查，确保符合规范

---

## 📊 进度追踪

| 模块 | proxy.$modal | proxy.$refs | proxy.$tab | 状态 |
|------|-------------|-------------|------------|------|
| 通知公告 | ✅ 完成 | - | - | ✅ 已完成 |
| 参数配置 | ✅ 完成 | - | - | ✅ 已完成 |
| 字典管理 | ✅ 完成 | - | - | ✅ 已完成 |
| 菜单管理 | ✅ 完成 | - | - | ✅ 已完成 |
| 岗位管理 | ✅ 完成 | - | - | ✅ 已完成 |
| 角色管理 | ✅ 完成 | ✅ 完成 | ✅ 完成 | ✅ 已完成 |
| 部门管理 | ✅ 完成 | ✅ 完成 | - | ✅ 已完成 |
| 用户个人资料 | ✅ 完成 | ⏸️ 2个文件 | ✅ 完成 | ⏸️ 部分完成 |
| 用户角色授权 | ✅ 完成 | ⏸️ 待处理 | ✅ 完成 | ⏸️ 待处理 |

**总计**: 9 个模块
- ✅ **完全完成**: 7 个模块
- ⏸️ **部分完成**: 2 个模块（仅剩少量 proxy.$refs 待处理）

### 待处理文件清单（仅 3 个文件）

1. `src/views/system/user/profile/userInfo.vue` - 第 71 行
2. `src/views/system/user/profile/resetPwd.vue` - 第 66 行
3. `src/views/system/user/authRole.vue` - 第 82, 127 行

---

## 📅 更新时间

- **创建时间**: 2026-04-06
- **最后更新**: 2026-04-06
- **最新更新内容**: 
  - ✅ 完成角色管理模块重构（3个文件）
  - ✅ 完成部门管理模块重构（1个文件）
  - ✅ 清理未使用的 getCurrentInstance 引用（7个文件）
  - ⏸️ 剩余 3 个文件待处理（用户个人资料和用户角色授权）
- **负责人**: AI Assistant

---

## 🔗 相关文档

- [Element Plus 自动导入使用说明](./ELEMENT_PLUS_AUTO_IMPORT.md)
- [Vue 3 Composition API 最佳实践](https://cn.vuejs.org/guide/extras/composition-api-faq.html)
