# 专栏列表 Composable 重构记录

## 重构时间
2026-04-19

## 重构内容

### 1. 创建 useSubject Composable
**文件路径**: `src/composables/useSubject.ts`

将文章管理页面中的专栏列表相关逻辑提取到独立的 composable 中,实现代码复用和更好的维护性。

#### 主要功能
- ✅ 专栏列表查询(支持分页和滚动加载)
- ✅ 专栏搜索功能
- ✅ 专栏删除功能
- ✅ 专栏选择切换
- ✅ 滚动加载更多

#### 核心 API

```typescript
const {
  // 响应式数据
  loading,           // 加载状态
  query,             // 查询参数
  state,             // 状态数据(包含 list, selectNode, selection, hasMore)
  
  // 方法
  getList,           // 获取列表
  handleSearch,      // 搜索
  handleSearchBlur,  // 搜索框失焦
  handleDelete,      // 删除
  handleRowClick,    // 行点击
  handleSelectionChange,  // 选择变化
  handleScroll,      // 滚动加载
  resetQuery         // 重置查询
} = useSubject()
```

### 2. 更新文章管理页面
**文件路径**: `src/views/post/article/index.vue`

#### 变更说明
- 移除原有的 `subject` reactive 对象定义(约70行代码)
- 引入并使用 `useSubject()` composable
- 更新模板中的数据访问路径:
  - `subject.list` → `subject.state.list`
  - `subject.selectNode` → `subject.state.selectNode`
  - `subject.loading` → `subject.loading`
  - `subject.query` → `subject.query`
- 添加 `handleSubjectRowClick` 函数处理专栏切换时的文章列表刷新

#### 代码对比

**重构前**:
```javascript
const subject = reactive({
  query: { ... },
  list: [],
  selectNode: { ... },
  // ... 约70行业务逻辑代码
})
```

**重构后**:
```javascript
import { useSubject } from '@/composables/useSubject'

const subject = useSubject()
```

## 重构优势

### 1. 代码组织更清晰
- 专栏相关逻辑集中管理
- 主页面代码减少约70行
- 职责分离,易于理解

### 2. 可复用性提升
- 其他页面需要专栏列表时可直接使用 `useSubject()`
- 避免重复代码

### 3. 易于测试
- Composable 可以独立测试
- 逻辑与 UI 分离

### 4. 易于维护
- 修改专栏逻辑只需修改 composable
- 不影响使用该 composable 的页面

## 注意事项

1. **数据访问路径变化**: 使用 composable 后,部分数据需要通过 `state` 访问
   - 列表数据: `subject.state.list`
   - 选中节点: `subject.state.selectNode`

2. **回调函数模式**: `handleRowClick` 采用回调函数方式,方便在不同场景下执行不同的业务逻辑

3. **TypeScript 支持**: composable 使用 TypeScript 编写,提供更好的类型提示

## 后续优化建议

1. 可以考虑将 `handleSubjectRowClick` 也封装到 composable 中,通过配置项控制
2. 如果多个页面都需要类似的主从结构,可以抽象出更通用的 composable
3. 可以添加更多的错误处理和用户反馈

## 相关文件

- `src/composables/useSubject.ts` - 专栏管理 composable
- `src/views/post/article/index.vue` - 文章管理页面(已重构)
- `src/api/post/subject.js` - 专栏 API
