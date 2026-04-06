# Permission Store 更新记录

## 📅 更新时间
2026-04-06

## 🎯 更新内容

将 `src/store/modules/permission.js` 中的 auth 插件引用替换为新的 useAuth composable。

## 📝 修改详情

### 修改前
```javascript
import auth from '@/plugins/auth'

// 动态路由遍历，验证是否具备权限
export function filterDynamicRoutes(routes) {
  const res = []
  routes.forEach((route) => {
    if (route.permissions) {
      if (auth.hasPermiOr(route.permissions)) {
        res.push(route)
      }
    } else if (route.roles) {
      if (auth.hasRoleOr(route.roles)) {
        res.push(route)
      }
    }
  })
  return res
}
```

### 修改后
```javascript
import { useAuth } from '@/composables/useAuth'

// 动态路由遍历，验证是否具备权限
export function filterDynamicRoutes(routes) {
  const res = []
  const { hasPermiOr, hasRoleOr } = useAuth()
  routes.forEach((route) => {
    if (route.permissions) {
      if (hasPermiOr(route.permissions)) {
        res.push(route)
      }
    } else if (route.roles) {
      if (hasRoleOr(route.roles)) {
        res.push(route)
      }
    }
  })
  return res
}
```

## 🔧 技术要点

### 1. 导入方式变更
- **旧**: `import auth from '@/plugins/auth'`
- **新**: `import { useAuth } from '@/composables/useAuth'`

### 2. 使用方式变更
- **旧**: 直接使用 `auth.hasPermiOr()` 和 `auth.hasRoleOr()`
- **新**: 先解构 `const { hasPermiOr, hasRoleOr } = useAuth()`，然后直接调用

### 3. 为什么在 Store 中可以使用 Composable？

虽然 composable 通常用于 Vue 组件中，但在这个场景下：
- `useAuth()` 内部只是调用了 `useUserStore()`
- Pinia store 可以在任何地方使用，不仅限于组件
- 因此这个用法是安全且有效的

## ✅ 验证清单

- [x] 导入语句已更新
- [x] 函数调用已更新
- [x] 功能保持一致
- [x] 无语法错误
- [x] 类型安全（TypeScript 支持）

## 🔗 相关文件

- [permission.js](../src/store/modules/permission.js) - 更新的文件
- [useAuth.ts](../src/composables/useAuth.ts) - 新的 composable
- [AUTH_REFACTOR_COMPLETE.md](./AUTH_REFACTOR_COMPLETE.md) - 完整重构报告

## 📊 影响范围

- **模块**: 权限路由过滤
- **功能**: 动态路由的权限验证
- **影响**: 无功能性变化，仅代码实现方式更新
- **兼容性**: 完全兼容，行为一致

## 💡 注意事项

1. **Store 中使用 Composable**: 虽然不常见，但在这个场景下是合理的，因为 `useAuth` 内部只依赖 Pinia store
2. **性能**: 每次调用 `filterDynamicRoutes` 都会调用 `useAuth()`，但由于只是解构操作，性能开销极小
3. **响应式**: 权限数据来自 Pinia store，具有响应式特性

## 🚀 后续优化建议

如果未来需要进一步优化，可以考虑：
1. 将 `hasPermiOr` 和 `hasRoleOr` 作为参数传入，避免重复调用 `useAuth()`
2. 或者在模块级别调用一次 `useAuth()` 并缓存结果

但目前的实现已经足够好，保持了代码的清晰性和可维护性。
