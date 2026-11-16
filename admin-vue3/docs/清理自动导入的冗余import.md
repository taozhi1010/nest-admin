# 清理自动导入的冗余 import

## 🎯 优化目标

移除 Vue3 项目中通过 `unplugin-auto-import` 自动导入的冗余 `import` 语句，让代码更简洁。

---

## 📋 自动导入配置

根据 `vite/plugins/auto-import.ts` 配置，以下内容已自动导入，**无需手动 import**：

### 1. Vue API
```typescript
// ✅ 自动导入，无需 import
ref, reactive, computed, watch, onMounted, onUnmounted, ...
```

### 2. Vue Router
```typescript
// ✅ 自动导入，无需 import
useRoute, useRouter
```

### 3. Element Plus
```typescript
// ✅ 自动导入，无需 import
ElMessage, ElMessageBox, ElNotification, ElLoading
```

### 4. Composables
```typescript
// ✅ composables 目录下的所有组合函数自动导入
useDict, useForm, useSubject, useArticle, useDynamicTitle, ...
```

### 5. 其他工具
```typescript
// ✅ 自动导入
dayjs
```

---

## ✅ 已清理的文件

### 1. editor.vue

#### 清理前
```vue
<script setup name="ArticleEditor">
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import MdEditor from '@/components/MdEditor/index.vue'
import ImageUploadCover from '@/components/ImageUploadCover/index.vue'
import { getArticle, addArticle, updateArticle } from '@/api/post/article'
import { useSubject } from '@/composables/post'
import { useDynamicTitle } from '@/composables/useDynamicTitle'
import { useDict } from '@/composables/useDict'
```

#### 清理后
```vue
<script setup name="ArticleEditor">
import MdEditor from '@/components/MdEditor/index.vue'
import ImageUploadCover from '@/components/ImageUploadCover/index.vue'
import { getArticle, addArticle, updateArticle } from '@/api/post/article'
```

**移除了 5 行不必要的 import** ✨

---

### 2. index.vue

#### 清理前
```vue
<script setup name="Article">
import { listArticle, delArticle, getArticle } from '@/api/post/article'
import Preview from './components/Preview'
import ArticleForm from './components/ArticleForm'
import { useDict } from '@/composables/useDict'
import { resetForm } from '@/composables/useForm'
import { useSubject } from '@/composables/post'
import { useRouter } from 'vue-router'
```

#### 清理后
```vue
<script setup name="Article">
import { listArticle, delArticle, getArticle } from '@/api/post/article'
import Preview from './components/Preview'
import ArticleForm from './components/ArticleForm'
```

**移除了 4 行不必要的 import** ✨

---

### 3. useArticleEditor.ts

#### 清理前
```typescript
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useArticle, useSubject } from '@/composables/post'
import { useDynamicTitle } from '@/composables/useDynamicTitle'
import type { Article } from '@/types/api'
```

#### 清理后
```typescript
import { useArticle, useSubject } from '@/composables/post'
import type { Article } from '@/types/api'
```

**移除了 3 行不必要的 import** ✨

---

### 4. useArticleList.ts

#### 清理前
```typescript
import { useArticle } from '@/composables/post'
import { useDict as useDictUtils } from '@/utils/dict'
import { useDict } from '@/composables/useDict'
import { resetForm } from '@/composables/useForm'
import { useSubject } from '@/composables/post'
import { useRouter } from 'vue-router'
import type { Article } from '@/types/api'
```

#### 清理后
```typescript
import { useArticle, useSubject } from '@/composables/post'
import { useDict as useDictUtils } from '@/utils/dict'
import type { Article } from '@/types/api'
```

**移除了 4 行不必要的 import** ✨

---

## 📊 优化统计

| 文件 | 清理前 | 清理后 | 减少行数 |
|------|--------|--------|----------|
| editor.vue | 9 行 import | 3 行 import | -6 行 |
| index.vue | 8 行 import | 3 行 import | -5 行 |
| useArticleEditor.ts | 5 行 import | 2 行 import | -3 行 |
| useArticleList.ts | 7 行 import | 3 行 import | -4 行 |
| **总计** | **29 行** | **11 行** | **-18 行** |

---

## 💡 保留的 import

以下类型的 import **必须保留**：

### 1. 组件导入
```typescript
// ✅ 必须保留 - 组件不会自动导入
import MdEditor from '@/components/MdEditor/index.vue'
import ArticleForm from './components/ArticleForm'
```

### 2. API 导入
```typescript
// ✅ 必须保留 - API 函数不会自动导入
import { getArticle, addArticle } from '@/api/post/article'
```

### 3. 类型导入
```typescript
// ✅ 必须保留 - 类型定义不会自动导入
import type { Article } from '@/types/api'
```

### 4. 非 composables 目录的工具函数
```typescript
// ✅ 必须保留 - utils 目录不会自动导入
import { useDict as useDictUtils } from '@/utils/dict'
```

---

## 🎯 判断规则

### ❌ 可以移除的 import

1. **Vue API**
   ```typescript
   // ❌ 可以移除
   import { ref, reactive, watch, onMounted } from 'vue'
   ```

2. **Vue Router**
   ```typescript
   // ❌ 可以移除
   import { useRoute, useRouter } from 'vue-router'
   ```

3. **Element Plus 方法**
   ```typescript
   // ❌ 可以移除
   import { ElMessage, ElMessageBox } from 'element-plus'
   ```

4. **Composables 目录下的组合函数**
   ```typescript
   // ❌ 可以移除
   import { useDict } from '@/composables/useDict'
   import { useSubject } from '@/composables/post'
   ```

### ✅ 必须保留的 import

1. **组件**
   ```typescript
   // ✅ 必须保留
   import MyComponent from './MyComponent.vue'
   ```

2. **API 函数**
   ```typescript
   // ✅ 必须保留
   import { getUserList } from '@/api/system/user'
   ```

3. **类型定义**
   ```typescript
   // ✅ 必须保留
   import type { User } from '@/types/api'
   ```

4. **非自动导入目录的工具**
   ```typescript
   // ✅ 必须保留
   import { formatDate } from '@/utils/date'
   ```

---

## 🔍 如何检查

### 方法 1：查看 auto-import 配置

打开 `vite/plugins/auto-import.ts`，查看哪些内容已配置自动导入。

### 方法 2：查看生成的类型声明

项目根目录会生成 `auto-imports.d.ts` 文件，里面列出了所有自动导入的内容。

### 方法 3：IDE 提示

如果某个 import 是多余的，IDE 通常会显示灰色警告。

---

## ⚠️ 注意事项

### 1. 不要删除组件导入
```typescript
// ❌ 错误 - 组件不会自动导入
const MyComponent = defineAsyncComponent(...)

// ✅ 正确 - 必须 import
import MyComponent from './MyComponent.vue'
```

### 2. 不要删除 API 导入
```typescript
// ❌ 错误 - API 函数不会自动导入
const res = await getUserList()

// ✅ 正确 - 必须 import
import { getUserList } from '@/api/system/user'
const res = await getUserList()
```

### 3. 类型导入必须保留
```typescript
// ❌ 错误 - 类型不会自动导入
const user: User = {...}

// ✅ 正确 - 必须 import type
import type { User } from '@/types/api'
const user: User = {...}
```

---

## 🚀 最佳实践

### 1. 只导入必要的内容

```typescript
// ✅ 推荐 - 只导入需要的
import { getArticle, updateArticle } from '@/api/post/article'

// ❌ 不推荐 - 导入全部
import * as articleApi from '@/api/post/article'
```

### 2. 合并相同来源的导入

```typescript
// ✅ 推荐 - 合并导入
import { useArticle, useSubject } from '@/composables/post'

// ❌ 不推荐 - 分开导入
import { useArticle } from '@/composables/post'
import { useSubject } from '@/composables/post'
```

### 3. 保持导入顺序

```typescript
// 推荐顺序：
// 1. 第三方库
// 2. 组件
// 3. API
// 4. 类型

import { someLib } from 'third-party'
import MyComponent from './MyComponent.vue'
import { getData } from '@/api/xxx'
import type { DataType } from '@/types/xxx'
```

---

## 📚 相关文档

- [自动导入插件配置](../vite/plugins/auto-import.ts)
- [生成的类型声明](../auto-imports.d.ts)
- [Vue3 Composition API](https://cn.vuejs.org/guide/extras/composition-api-faq.html)

---

**优化时间**: 2026-04-28  
**版本**: v1.3.0
