# 错误页面路由配置说明

## 📍 路由位置

**系统工具 → 错误页面** 目录下

访问路径：`/tool/error-page`

---

## 🎯 新增路由

### 1. 401 未授权页面
- **路由**: `/tool/error-page/401`
- **组件**: `@/views/error/401.vue`
- **权限**: `tool:gen:list`
- **图标**: `error`

### 2. 404 未找到页面
- **路由**: `/tool/error-page/404`
- **组件**: `@/views/error/404.vue`
- **权限**: `tool:gen:list`
- **图标**: `error`

---

## 📋 配置详情

```javascript
{
  path: '/tool/error-page',
  component: Layout,
  hidden: false,
  alwaysShow: true,
  permissions: ['tool:gen:list'],
  meta: { title: '错误页面', icon: 'error' },
  children: [
    {
      path: '401',
      component: () => import('@/views/error/401'),
      name: 'Error401',
      meta: { title: '401 未授权', icon: 'error' }
    },
    {
      path: '404',
      component: () => import('@/views/error/404'),
      name: 'Error404',
      meta: { title: '404 未找到', icon: 'error' }
    }
  ]
}
```

---

## 🔍 功能特性

### 401 页面
- ✅ 显示未授权提示
- ✅ 提供返回按钮
- ✅ 支持重新登录跳转
- ✅ 响应式设计

### 404 页面
- ✅ 显示页面未找到提示
- ✅ 提供返回首页按钮
- ✅ 友好的错误提示
- ✅ 美观的插图设计

---

## 🧪 测试方法

### 方式 1：通过菜单访问
1. 登录系统
2. 进入 **系统工具** 菜单
3. 点击 **错误页面** 展开子菜单
4. 分别点击 **401 未授权** 和 **404 未找到**

### 方式 2：直接访问 URL
- 401: http://localhost:8889/tool/error-page/401
- 404: http://localhost:8889/tool/error-page/404

---

## 📸 效果预览

访问以下地址查看实际效果：

**本地环境：**
- 主应用：http://localhost:8889
- 错误页面菜单：系统工具 → 错误页面

---

## 💡 使用说明

### 权限要求
需要拥有 `tool:gen:list` 权限才能看到此菜单。

### 适用场景
- 开发调试：快速查看错误页面效果
- 演示展示：向客户展示错误处理
- 测试验证：测试错误页面的交互逻辑

---

## 🔗 相关文件

- 路由配置：`src/router/index.js`
- 401 组件：`src/views/error/401.vue`
- 404 组件：`src/views/error/404.vue`

---

## 📝 注意事项

1. **权限控制**：确保当前用户有 `tool:gen:list` 权限
2. **菜单显示**：路由配置在 `dynamicRoutes` 中，需要登录后才能看到
3. **隐藏路由**：原有的 `/401` 和 `/:pathMatch(.*)*` 保持 `hidden: true`，用于实际错误处理

---

*添加时间：2026-03-29*  
*位置：系统工具 → 错误页面*
