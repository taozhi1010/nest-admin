# 优化更新日志

## v1.1.0 (2026-04-28)

### ✨ 新增功能

#### 合并 createArticle 和 updateArticle 为 saveArticle

**改进前**：
```typescript
// 需要分别调用两个方法
if (formData.id) {
  await articleManager.updateArticle(formData)
} else {
  await articleManager.createArticle(formData)
}
```

**改进后**：
```typescript
// 统一使用一个方法，自动判断
await articleManager.saveArticle(formData)
```

**优势**：
- ✅ 页面代码更简洁，不需要判断逻辑
- ✅ 减少代码重复
- ✅ 统一的错误处理
- ✅ 自动返回最新的文章数据

---

### 📝 API 变更

#### 移除的方法
- `createArticle()` - 创建文章
- `updateArticle()` - 更新文章

#### 新增的方法
- `saveArticle(data)` - 保存文章（自动判断新增或更新）

**参数**：
- `data`: Partial<Article> - 文章数据
  - 如果包含 `id` 或 `articleId` → 执行更新操作
  - 如果不包含 ID → 执行创建操作

**返回值**：
- `Promise<Article>` - 保存后的文章信息（包含最新的 ID）

**示例**：
```typescript
// 创建新文章
const newArticle = await articleManager.saveArticle({
  title: '新文章',
  content: '内容'
})
console.log('新ID:', newArticle.id)

// 更新文章
await articleManager.saveArticle({
  id: 123,
  title: '修改后的标题'
})
```

---

### 🔄 迁移指南

如果你的代码还在使用旧方法，可以快速替换：

#### 方式 1：直接替换（推荐）

```bash
# 全局搜索替换
createArticle( → saveArticle(
updateArticle( → saveArticle(
```

#### 方式 2：手动修改

```typescript
// 旧代码
if (formData.id) {
  await articleManager.updateArticle(formData)
} else {
  const result = await articleManager.createArticle(formData)
  formData.id = result.id
}

// 新代码
const result = await articleManager.saveArticle(formData)
if (!formData.id && result.id) {
  formData.id = result.id
}
```

---

### 📚 相关文档

- [saveArticle 优化说明](./saveArticle优化说明.md) - 详细说明和优化对比
- [useArticle 快速开始](./useArticle快速开始.md) - 已更新示例
- [useArticle 使用说明](./useArticle使用说明.md) - API 文档

---

### 💡 影响范围

**核心文件**：
- ✅ `src/composables/useArticle.ts` - 已更新
- ✅ `src/views/post/article/useArticleEditor.ts` - 已更新示例
- ✅ `docs/useArticle快速开始.md` - 已更新文档
- ✅ `docs/saveArticle优化说明.md` - 新增文档

**无需修改**：
- 类型定义（`Article`, `ArticleQueryParams` 等）保持不变
- 其他方法（`loadList`, `getDetail`, `deleteArticle` 等）保持不变

---

### 🎯 后续计划

- [ ] 更新所有示例代码
- [ ] 补充单元测试
- [ ] 在更多页面中应用

---

**版本**: v1.1.0  
**更新时间**: 2026-04-28  
**兼容性**: ⚠️ Breaking Change（需要迁移旧代码）
