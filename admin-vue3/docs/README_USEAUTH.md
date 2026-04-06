# useAuth - 权限验证 Composable

## 🚀 快速开始

### 1. 基本使用

```vue
<script setup lang="ts">
// ✅ 自动导入，无需手动 import
const { hasPermi, hasRole } = useAuth()
</script>

<template>
  <button v-if="hasPermi('system:user:add')">添加用户</button>
  <div v-if="hasRole('admin')">管理员面板</div>
</template>
```

### 2. 查看所有方法

```typescript
const { 
  hasPermi,      // 验证单个权限
  hasPermiOr,    // 验证多个权限（满足任一）
  hasPermiAnd,   // 验证多个权限（全部满足）
  hasRole,       // 验证单个角色
  hasRoleOr,     // 验证多个角色（满足任一）
  hasRoleAnd     // 验证多个角色（全部满足）
} = useAuth()
```

### 3. 查看示例

访问 `/test/auth-demo` 路由查看完整的示例页面。

## 📚 详细文档

- [完整使用文档](./USEAUTH_USAGE.md)
- [重构总结](./AUTH_REFACTOR_SUMMARY.md)
- [验证清单](./AUTH_VERIFICATION_CHECKLIST.md)
- [完成报告](./AUTH_REFACTOR_COMPLETE.md)

## 🔧 配置说明

### 自动导入配置

已在 `vite/plugins/auto-import.js` 中配置：

```javascript
{
  dirs: ['./src/composables'],
  presetImports: [
    { from: '@/composables/useAuth', imports: ['useAuth'] }
  ]
}
```

### 类型定义

类型定义在 `src/types/api.d.ts` 中：

```typescript
interface UserAuthInfo {
  permissions: string[]
  roles: string[]
}
```

## 💡 使用提示

1. **无需手动导入**: `useAuth` 已配置为自动导入
2. **类型安全**: 所有方法都有完整的 TypeScript 类型定义
3. **IDE 支持**: 享受完整的智能提示和类型检查
4. **响应式**: 权限和角色数据来自 Pinia store
5. **向后兼容**: 保持与原有 auth.js 插件的 API 兼容

## 🎯 常见用例

### 按钮权限控制

```vue
<template>
  <el-button v-if="hasPermi('system:user:add')" type="primary">
    新增
  </el-button>
  <el-button v-if="hasPermi('system:user:edit')" type="warning">
    编辑
  </el-button>
  <el-button v-if="hasPermi('system:user:delete')" type="danger">
    删除
  </el-button>
</template>
```

### 菜单权限控制

```vue
<template>
  <el-menu-item v-if="hasPermi('monitor:online:list')" index="/monitor/online">
    在线用户
  </el-menu-item>
</template>
```

### 复杂权限判断

```vue
<script setup>
const { hasPermiAnd, hasRoleOr } = useAuth()

// 需要同时具有查看和导出权限
const canExport = hasPermiAnd(['system:user:view', 'system:user:export'])

// 管理员或经理可以访问
const canAccess = hasRoleOr(['admin', 'manager'])
</script>
```

## 🔍 测试

在浏览器控制台中运行：

```javascript
// 运行自动化测试
testUseAuth()
```

## ❓ 常见问题

### Q: 为什么我的权限验证不生效？

A: 确保用户已经登录并且权限数据已经从后端获取。检查 `useUserStore().permissions` 是否有数据。

### Q: 如何调试权限问题？

A: 在浏览器控制台中检查：
```javascript
const userStore = useUserStore()
console.log('Permissions:', userStore.permissions)
console.log('Roles:', userStore.roles)
```

### Q: 可以继续使用旧的全局属性方式吗？

A: 可以，但推荐使用新的 composable 方式。如果需要使用全局属性：
```js
import auth from '@/composables/useAuth'
app.config.globalProperties.$auth = auth
```

## 📞 支持

如有问题，请查看完整文档或联系开发团队。
