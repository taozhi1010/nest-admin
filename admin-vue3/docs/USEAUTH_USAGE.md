# useAuth 权限验证 Composable

## 概述

`useAuth` 是一个基于 TypeScript 的权限验证组合式函数，提供了完整的权限和角色验证功能。它替代了原有的 `auth.js` 插件，采用了更符合 Vue 3 组合式 API 的设计模式。

## 特性

- ✅ TypeScript 支持，提供完整的类型定义
- ✅ 自动导入，无需手动 import
- ✅ 详细的 JSDoc 注释
- ✅ 兼容原有 API
- ✅ 支持权限和角色验证

## 使用方法

### 基本用法

```vue
<script setup>
// useAuth 会自动导入，无需手动 import
const { hasPermi, hasRole } = useAuth()
</script>

<template>
  <!-- 权限验证 -->
  <button v-if="hasPermi('system:user:add')">添加用户</button>
  
  <!-- 角色验证 -->
  <div v-if="hasRole('admin')">管理员面板</div>
</template>
```

### 高级用法

```vue
<script setup>
const { 
  hasPermi,      // 验证单个权限
  hasPermiOr,    // 验证多个权限（满足任一）
  hasPermiAnd,   // 验证多个权限（全部满足）
  hasRole,       // 验证单个角色
  hasRoleOr,     // 验证多个角色（满足任一）
  hasRoleAnd     // 验证多个角色（全部满足）
} = useAuth()

// 权限验证示例
const canAddUser = hasPermi('system:user:add')
const canEditOrDelete = hasPermiOr(['system:user:edit', 'system:user:delete'])
const canFullAccess = hasPermiAnd(['system:user:view', 'system:user:edit'])

// 角色验证示例
const isAdmin = hasRole('admin')
const isManagerOrSupervisor = hasRoleOr(['manager', 'supervisor'])
const isSuperAdmin = hasRoleAnd(['admin', 'superuser'])
</script>
```

## API 参考

### hasPermi(permission: string): boolean

验证用户是否具备指定权限

**参数:**
- `permission` - 权限标识符，如 `'system:user:add'`

**返回值:**
- `boolean` - 是否具有该权限

**示例:**
```ts
const canAdd = hasPermi('system:user:add')
```

### hasPermiOr(permissions: string[]): boolean

验证用户是否含有指定权限，只需包含其中一个

**参数:**
- `permissions` - 权限标识符数组

**返回值:**
- `boolean` - 是否具有任一权限

**示例:**
```ts
const canEdit = hasPermiOr(['system:user:edit', 'system:user:update'])
```

### hasPermiAnd(permissions: string[]): boolean

验证用户是否含有指定权限，必须全部拥有

**参数:**
- `permissions` - 权限标识符数组

**返回值:**
- `boolean` - 是否具有所有权限

**示例:**
```ts
const canFullAccess = hasPermiAnd(['system:user:view', 'system:user:edit'])
```

### hasRole(role: string): boolean

验证用户是否具备指定角色

**参数:**
- `role` - 角色标识符，如 `'admin'`

**返回值:**
- `boolean` - 是否具有该角色

**示例:**
```ts
const isAdmin = hasRole('admin')
```

### hasRoleOr(roles: string[]): boolean

验证用户是否含有指定角色，只需包含其中一个

**参数:**
- `roles` - 角色标识符数组

**返回值:**
- `boolean` - 是否具有任一角色

**示例:**
```ts
const isManager = hasRoleOr(['manager', 'supervisor'])
```

### hasRoleAnd(roles: string[]): boolean

验证用户是否含有指定角色，必须全部拥有

**参数:**
- `roles` - 角色标识符数组

**返回值:**
- `boolean` - 是否具有所有角色

**示例:**
```ts
const isSuperAdmin = hasRoleAnd(['admin', 'superuser'])
```

## 特殊权限和角色

### 通配符权限

系统支持通配符权限 `*:*:*`，拥有此权限的用户可以访问所有功能。

```ts
// 如果用户权限包含 '*:*:*'，则任何权限验证都会返回 true
hasPermi('any:permission:here') // true
```

### 超级管理员角色

系统内置超级管理员角色 `'admin'`，拥有此角色的用户可以访问所有功能。

```ts
// 如果用户角色包含 'admin'，则任何角色验证都会返回 true
hasRole('any-role') // true (当用户是 admin 时)
```

## 迁移指南

### 从旧版 auth 插件迁移

**旧版用法:**
```js
// 在 main.js 中注册
import auth from '@/plugins/auth'
app.config.globalProperties.$auth = auth

// 在组件中使用
this.$auth.hasPermi('system:user:add')
```

**新版用法:**
```vue
<script setup>
// 自动导入，无需手动 import
const { hasPermi } = useAuth()
</script>

<template>
  <button v-if="hasPermi('system:user:add')">添加用户</button>
</template>
```

### 兼容性

为了保持向后兼容，新的 composable 仍然提供了默认导出，可以用于全局属性注册：

```js
// 如果需要保持全局属性方式，可以这样注册
import auth from '@/composables/useAuth'
app.config.globalProperties.$auth = auth
```

但推荐使用组合式 API 的方式，更加符合 Vue 3 的最佳实践。

## 注意事项

1. **自动导入**: `useAuth` 已配置为自动导入，无需手动 import
2. **响应式**: 权限和角色数据来自 Pinia store，具有响应式特性
3. **类型安全**: 所有方法都有完整的 TypeScript 类型定义
4. **性能**: 权限验证是同步操作，性能开销很小

## 相关文件

- [useAuth.ts](../src/composables/useAuth.ts) - 主要实现文件
- [auto-import.js](../vite/plugins/auto-import.js) - 自动导入配置
- [user.js](../src/store/modules/user.js) - 用户状态管理
