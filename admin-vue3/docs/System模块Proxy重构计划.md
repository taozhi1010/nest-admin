# System 模块 Proxy 重构计划

## 📋 概述

本文档记录了 system 目录下尚未完成的 `proxy` 引用重构工作。目前已将 `proxy.$modal` 全部替换为 Element Plus 原生 API（`ElMessage`、`ElMessageBox`），但部分文件仍使用了 `proxy.$refs` 和 `proxy.$tab`，需要进一步重构。

## ✅ 已完成的重构

以下模块已完全移除 `proxy.$modal` 并提交：

1. **通知公告模块** - `src/views/system/notice/index.vue`
2. **参数配置模块** - `src/views/system/config/index.vue`
3. **字典管理模块** - `src/views/system/dict/` (包含子组件)
4. **菜单管理模块** - `src/views/system/menu/index.vue`
5. **岗位管理模块** - `src/views/system/post/index.vue`

## ⏸️ 待重构的文件

以下文件仍使用了 `proxy.$refs` 或 `proxy.$tab`，需要进一步重构：

### 1. 用户个人资料模块

#### 文件列表
- `src/views/system/user/profile/userInfo.vue`
- `src/views/system/user/profile/resetPwd.vue`
- `src/views/system/user/profile/userAvatar.vue`

#### 当前使用的 Proxy API
```javascript
// userInfo.vue
proxy.$refs.userInfoRef.validate()
proxy.$tab.closePage()

// resetPwd.vue
proxy.$refs.pwdRef.validate()
proxy.$tab.closePage()
```

#### 重构方案
```javascript
// 使用模板 ref 替代 proxy.$refs
const userInfoRef = ref(null)
await userInfoRef.value.validate()

// 使用 router 替代 proxy.$tab
import { useRouter } from 'vue-router'
const router = useRouter()
router.push('/system/user')
```

---

### 2. 用户角色授权模块

#### 文件
- `src/views/system/user/authRole.vue`

#### 当前使用的 Proxy API
```javascript
proxy.$refs['roleRef'].toggleRowSelection(row)
proxy.$tab.closeOpenPage(obj)
```

#### 重构方案
```javascript
// 使用模板 ref
const roleRef = ref(null)
roleRef.value.toggleRowSelection(row)

// 使用 router
import { useRouter } from 'vue-router'
const router = useRouter()
router.push('/system/user')
```

---

### 3. 角色管理模块

#### 文件列表
- `src/views/system/role/index.vue`
- `src/views/system/role/selectUser.vue`
- `src/views/system/role/authUser.vue`

#### 当前使用的 Proxy API
```javascript
// selectUser.vue
proxy.$refs['refTable'].toggleRowSelection(row)

// authUser.vue
proxy.$refs['selectRef'].show()
proxy.$tab.closeOpenPage(obj)

// index.vue
// (已移除 proxy.$modal，但可能还有其他 proxy 使用)
```

#### 重构方案
```javascript
// 使用模板 ref
const refTable = ref(null)
refTable.value.toggleRowSelection(row)

const selectRef = ref(null)
selectRef.value.show()

// 使用 router
import { useRouter } from 'vue-router'
const router = useRouter()
router.push('/system/role')
```

---

### 4. 部门管理模块

#### 文件
- `src/views/system/dept/index.vue`

#### 当前使用的 Proxy API
```javascript
proxy.$refs['deptRef'].validate((valid) => {
  // ...
})
```

#### 重构方案
```javascript
// 使用模板 ref
const deptRef = ref(null)
deptRef.value.validate((valid) => {
  // ...
})
```

---

## 🎯 重构目标

### 短期目标（本次重构）
1. ✅ 移除所有 `proxy.$modal` 使用
2. ⏸️ 移除所有 `proxy.$refs` 使用
3. ⏸️ 移除所有 `proxy.$tab` 使用
4. ⏸️ 移除不必要的 `getCurrentInstance()` 调用

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

### 第一步：用户个人资料模块
1. 修改 `userInfo.vue`
2. 修改 `resetPwd.vue`
3. 修改 `userAvatar.vue`
4. 测试验证
5. 提交

### 第二步：用户角色授权模块
1. 修改 `authRole.vue`
2. 测试验证
3. 提交

### 第三步：角色管理模块
1. 修改 `selectUser.vue`
2. 修改 `authUser.vue`
3. 检查 `index.vue` 是否还有其他 proxy 使用
4. 测试验证
5. 提交

### 第四步：部门管理模块
1. 修改 `dept/index.vue`
2. 测试验证
3. 提交

---

## ⚠️ 注意事项

1. **保持向后兼容**：确保重构后的功能与原来完全一致
2. **充分测试**：每个模块重构后都要进行完整的功能测试
3. **分模块提交**：按照模块逐个提交，便于回滚和审查
4. **更新文档**：重构完成后更新相关文档
5. **代码审查**：提交前进行代码审查，确保符合规范

---

## 📊 进度追踪

| 模块 | 状态 | 文件数 | 备注 |
|------|------|--------|------|
| 通知公告 | ✅ 完成 | 1 | 已提交 |
| 参数配置 | ✅ 完成 | 1 | 已提交 |
| 字典管理 | ✅ 完成 | 3 | 已提交 |
| 菜单管理 | ✅ 完成 | 1 | 已提交 |
| 岗位管理 | ✅ 完成 | 1 | 已提交 |
| 用户个人资料 | ⏸️ 待处理 | 3 | 需移除 proxy.$refs 和 proxy.$tab |
| 用户角色授权 | ⏸️ 待处理 | 1 | 需移除 proxy.$refs 和 proxy.$tab |
| 角色管理 | ⏸️ 待处理 | 3 | 需移除 proxy.$refs 和 proxy.$tab |
| 部门管理 | ⏸️ 待处理 | 1 | 需移除 proxy.$refs |

**总计**: 9 个模块，5 个已完成，4 个待处理

---

## 📅 更新时间

- **创建时间**: 2026-04-06
- **最后更新**: 2026-04-06
- **负责人**: AI Assistant

---

## 🔗 相关文档

- [Element Plus 自动导入使用说明](./ELEMENT_PLUS_AUTO_IMPORT.md)
- [Vue 3 Composition API 最佳实践](https://cn.vuejs.org/guide/extras/composition-api-faq.html)
