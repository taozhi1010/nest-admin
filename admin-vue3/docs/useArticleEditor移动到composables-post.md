# useArticleEditor 移动到 composables/post

## 📋 变更概述

将 `useArticleEditor.ts` 从 `src/views/post/article/` 移动到 `src/composables/post/`，统一文章模块的组合函数管理。

---

## 🔄 变更内容

### 1. 文件移动

**原位置：**
```
src/views/post/article/useArticleEditor.ts
```

**新位置：**
```
src/composables/post/useArticleEditor.ts
```

---

### 2. 导出配置更新

**文件：** `src/composables/post/index.ts`

**新增导出：**
```typescript
// 文章编辑器
export { useArticleEditor } from './useArticleEditor'
```

**完整导出列表：**
```typescript
/**
 * 文章模块组合函数统一导出
 * 
 * 包含文章和专栏相关的所有组合函数
 */

// 文章管理
export { useArticle } from './useArticle'
export type { UseArticleReturn } from './useArticle'

// 专栏管理
export { useSubject } from './useSubject'

// 文章编辑器
export { useArticleEditor } from './useArticleEditor'
```

---

### 3. 导入路径更新

**文件：** `src/views/post/article/editor.vue`

**变更前：**
```vue
<script setup name="ArticleEditor">
import MdEditor from '@/components/MdEditor/index.vue'
import ImageUploadCover from '@/components/ImageUploadCover/index.vue'
import { useArticleEditor } from './useArticleEditor'
```

**变更后：**
```vue
<script setup name="ArticleEditor">
import MdEditor from '@/components/MdEditor/index.vue'
import ImageUploadCover from '@/components/ImageUploadCover/index.vue'
import { useArticleEditor } from '@/composables/post'
```

---

## 📁 目录结构

移动后的 `composables/post/` 目录结构：

```
src/composables/post/
├── index.ts              # 统一导出文件
├── useArticle.ts         # 文章管理组合函数（CRUD）
├── useArticleEditor.ts   # 文章编辑器组合函数 ✨ 新增
└── useSubject.ts         # 专栏管理组合函数
```

---

## ✅ 优势

### 1. **统一的模块管理**
- 所有文章相关的组合函数集中在 `composables/post/` 目录
- 便于查找、维护和扩展

### 2. **清晰的职责划分**
- `useArticle`: 负责文章的 CRUD 操作
- `useArticleEditor`: 负责编辑器的业务逻辑
- `useSubject`: 负责专栏的 CRUD 操作

### 3. **一致的导入方式**
```typescript
// 之前：混合使用不同路径
import { useArticle } from '@/composables/post'
import { useArticleEditor } from './useArticleEditor'  // ❌ 不一致

// 之后：统一从 composables/post 导入
import { useArticle, useArticleEditor } from '@/composables/post'  // ✅ 一致
```

### 4. **便于复用**
- 如果其他页面需要使用文章编辑器逻辑，可以直接从 `@/composables/post` 导入
- 不需要关心具体文件位置

---

## 🔍 影响范围

### 受影响的文件

| 文件 | 变更类型 | 说明 |
|------|---------|------|
| `src/composables/post/index.ts` | 修改 | 新增导出 |
| `src/views/post/article/editor.vue` | 修改 | 更新导入路径 |
| `src/views/post/article/useArticleEditor.ts` | 删除 | 已移动到新位置 |
| `src/composables/post/useArticleEditor.ts` | 新增 | 从 views 移动过来 |

### 不受影响的文件

- 其他视图组件
- API 文件
- 其他组合函数

---

## 🧪 验证步骤

### 1. 检查文件是否存在

```bash
# 确认文件已移动
ls src/composables/post/useArticleEditor.ts  # ✅ 应该存在
ls src/views/post/article/useArticleEditor.ts  # ❌ 应该不存在
```

### 2. 检查导入是否正确

在 `editor.vue` 中：
```typescript
import { useArticleEditor } from '@/composables/post'
```

### 3. 运行项目测试

```bash
pnpm dev
```

访问文章编辑页面，确保功能正常：
- ✅ 新建文章
- ✅ 编辑文章
- ✅ 保存草稿
- ✅ 发布文章

---

## 📝 注意事项

### 1. **自动导入机制**
由于项目使用了 `unplugin-auto-import`，`composables` 目录下的文件会自动导入。

**配置位置：** `vite/plugins/auto-import.ts`
```typescript
autoImport({
  dirs: ['./src/composables'],  // composables 目录自动导入
  // ...
})
```

这意味着：
- ✅ 可以在组件中直接使用 `useArticleEditor()` 而不需要手动 import
- ⚠️ 但为了代码可读性，建议仍然显式导入

### 2. **TypeScript 类型支持**
移动后，TypeScript 类型定义仍然有效：
```typescript
// 自动推断返回类型
const { title, content, handleSaveDraft } = useArticleEditor()
```

### 3. **热更新**
Vite 的热更新机制会自动检测文件移动，无需重启开发服务器。

---

## 🎯 后续优化建议

### 1. **考虑拆分更大的组合函数**
如果 `useArticleEditor` 继续增长，可以考虑拆分为：
```typescript
// composables/post/
useArticleEditor/
├── index.ts          # 主入口
├── useForm.ts        # 表单逻辑
├── useSave.ts        # 保存逻辑
└── useValidation.ts  # 验证逻辑
```

### 2. **添加单元测试**
为 `useArticleEditor` 编写单元测试：
```typescript
// tests/composables/post/useArticleEditor.test.ts
import { describe, it, expect } from 'vitest'
import { useArticleEditor } from '@/composables/post'

describe('useArticleEditor', () => {
  it('should initialize with empty title', () => {
    const { title } = useArticleEditor()
    expect(title.value).toBe('')
  })
  
  it('should validate form correctly', () => {
    const { validateForm, title, content } = useArticleEditor()
    title.value = ''
    content.value = ''
    expect(validateForm()).toBe(false)
  })
})
```

### 3. **文档完善**
为每个组合函数添加 JSDoc 注释：
```typescript
/**
 * 文章编辑器组合函数
 * 
 * @description 提供文章编辑器的完整业务逻辑
 * @returns 编辑器状态和方法
 * 
 * @example
 * ```typescript
 * const { title, content, handleSaveDraft } = useArticleEditor()
 * ```
 */
export function useArticleEditor() {
  // ...
}
```

---

## 📊 统计信息

| 指标 | 数值 |
|------|------|
| 移动的文件数 | 1 |
| 修改的文件数 | 2 |
| 删除的文件数 | 1 |
| 新增的导出数 | 1 |
| 影响的组件数 | 1 |

---

## ✅ 完成清单

- [x] 移动 `useArticleEditor.ts` 到 `composables/post/`
- [x] 更新 `composables/post/index.ts` 导出
- [x] 更新 `editor.vue` 导入路径
- [x] 删除原位置的 `useArticleEditor.ts`
- [x] 验证文件移动成功
- [x] 创建迁移说明文档

---

**迁移完成时间：** 2026-04-28  
**迁移执行人：** AI Assistant  
**迁移状态：** ✅ 完成
