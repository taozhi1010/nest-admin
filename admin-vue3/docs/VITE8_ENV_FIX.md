# Vite 8 环境变量问题修复

## 🐛 问题描述

在升级到 Vite 8 并移除 `.env` 文件中的 `NODE_ENV` 后，发现 Logo 旁边的标题无法正确显示。

## 🔍 问题原因

1. **Vite 8 环境变量加载机制变化**
   - Vite 8 对环境变量的处理更加严格
   - `import.meta.env.VITE_APP_TITLE` 在某些情况下可能返回 `undefined`

2. **Settings Store 初始化问题**
   - `settings.js` store 中的 `title` 字段初始化为空字符串 `''`
   - 没有从 `defaultSettings` 中获取默认标题

3. **缺少默认值保护**
   - 直接使用 `import.meta.env.VITE_APP_TITLE` 没有提供 fallback

## ✅ 修复方案

### 1. 为环境变量添加默认值

**文件**: `src/layout/components/Sidebar/Logo.vue`

```javascript
// 修复前
const title = import.meta.env.VITE_APP_TITLE

// 修复后
const title = import.meta.env.VITE_APP_TITLE || 'nest-admin 后台管理系统'
```

**文件**: `src/settings.js`

```javascript
// 修复前
title: import.meta.env.VITE_APP_TITLE,

// 修复后
title: import.meta.env.VITE_APP_TITLE || 'nest-admin 后台管理系统',
```

### 2. 修复 Settings Store 初始化

**文件**: `src/store/modules/settings.js`

```javascript
// 修复前
const { sideTheme, showSettings, topNav, tagsView, fixedHeader, sidebarLogo, dynamicTitle } = defaultSettings

const useSettingsStore = defineStore('settings', {
  state: () => ({
    title: '',  // ❌ 空字符串
    // ...
  })
})

// 修复后
const { sideTheme, showSettings, topNav, tagsView, fixedHeader, sidebarLogo, dynamicTitle, title: defaultTitle } = defaultSettings

const useSettingsStore = defineStore('settings', {
  state: () => ({
    title: defaultTitle || 'nest-admin 后台管理系统',  // ✅ 使用默认标题
    // ...
  })
})
```

### 3. 添加调试日志（可选）

**文件**: `vite.config.js`

```javascript
console.log('🔥 mode:', mode)
console.log('🔥 VITE_APP_BASE_API:', env.VITE_APP_BASE_API)
console.log('🔥 VITE_APP_TITLE:', env.VITE_APP_TITLE)  // 添加这行
```

## 📋 验证修复

1. **重启开发服务器**
   ```bash
   pnpm run dev
   ```

2. **检查控制台输出**
   ```
   🔥 mode: development
   🔥 VITE_APP_BASE_API: /dev-api
   🔥 VITE_APP_TITLE: nest-admin 后台管理系统-开发环境
   ```

3. **检查页面标题**
   - Logo 旁边应该显示：`nest-admin 后台管理系统-开发环境`
   - 浏览器标签页标题也应该正确显示

## 🎯 最佳实践

### 1. 始终提供默认值

```javascript
// ✅ 好的做法
const title = import.meta.env.VITE_APP_TITLE || '默认标题'

// ❌ 不好的做法
const title = import.meta.env.VITE_APP_TITLE
```

### 2. 在 Store 中使用默认配置

```javascript
// ✅ 好的做法
const { title: defaultTitle } = defaultSettings
state: () => ({
  title: defaultTitle || '默认标题'
})

// ❌ 不好的做法
state: () => ({
  title: ''  // 空值可能导致问题
})
```

### 3. 环境变量命名规范

- 所有暴露给客户端的环境变量必须以 `VITE_` 开头
- 使用大写字母和下划线命名
- 提供清晰的注释说明

## ⚠️ 注意事项

1. **Vite 8 的变化**
   - 不再支持在 `.env` 文件中设置 `NODE_ENV`
   - `NODE_ENV` 由 Vite 根据运行命令自动设置
   - `development` 模式 → `NODE_ENV=development`
   - `production` 模式 → `NODE_ENV=production`

2. **环境变量加载顺序**
   - `.env.[mode]` (最高优先级)
   - `.env` (基础配置)
   - 系统环境变量

3. **修改后需要重启**
   - 修改 `.env` 文件后必须重启开发服务器
   - 修改 `vite.config.js` 后也需要重启

## 📚 相关文档

- [Vite 环境变量指南](https://cn.vitejs.dev/guide/env-and-mode.html)
- [Vite 8 迁移指南](https://vite.dev/guide/migration.html)
