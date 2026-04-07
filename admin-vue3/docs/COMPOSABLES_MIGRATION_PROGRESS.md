# Composables 迁移进度报告

## 📊 迁移状态

### ✅ 已完成的文件 (12 个)

1. **src/views/game/article/index.vue**
   - ✅ `proxy.useDict` → `useDict`
   - ✅ `proxy.resetForm` → `resetForm`

2. **src/views/system/notice/index.vue**
   - ✅ `proxy.useDict` → `useDict`

3. **src/views/system/config/index.vue**
   - ✅ `proxy.useDict` → `useDict`

4. **src/views/system/dict/components/dictDataEdit.vue**
   - ✅ `proxy.useDict` → `useDict`
   - ✅ `proxy.resetForm` → `resetForm`

5. **src/views/system/dict/components/dictGroupEdit.vue**
   - ✅ `proxy.useDict` → `useDict`
   - ✅ `proxy.resetForm` → `resetForm`

6. **src/views/tool/gen/importTable.vue**
   - ✅ `proxy.resetForm` → `resetForm`

7. **src/views/system/user/index.vue**
   - ✅ `proxy.useDict` → `useDict`
   - ✅ `proxy.resetForm` → `resetForm`
   - ✅ `proxy.addDateRange` → `addDateRange`
   - ✅ `proxy.download` → `download`

8. **src/views/system/post/index.vue**
   - ✅ `proxy.useDict` → `useDict`
   - ✅ `proxy.resetForm` → `resetForm`
   - ✅ `proxy.download` → `download`

9. **src/views/tool/gen/index.vue**
   - ✅ `proxy.resetForm` → `resetForm`
   - ✅ `proxy.addDateRange` → `addDateRange`

10. **src/views/tool/gen/genInfoForm.vue**
    - ✅ `proxy.handleTree` → `handleTree`

---

### ⏳ 待处理的文件 (6 个)

1. **src/views/system/dept/index.vue**
   - ❌ `proxy.useDict("sys_normal_disable")`
   - ❌ `proxy.handleTree` (3 处)
   - ❌ `proxy.resetForm` (2 处)

2. **src/views/system/dict/index.vue**
   - ❌ `proxy.useDict('sys_normal_disable')`
   - ❌ `proxy.download` (2 处)
   - ❌ `proxy.resetForm`

3. **src/views/system/role/index.vue**
   - ❌ `proxy.useDict('sys_normal_disable')`
   - ❌ `proxy.addDateRange`
   - ❌ `proxy.resetForm` (2 处)
   - ❌ `proxy.download`

4. **src/views/system/role/selectUser.vue**
   - ❌ `proxy.useDict('sys_normal_disable')`
   - ❌ `proxy.resetForm`

5. **src/views/system/role/authUser.vue**
   - ❌ `proxy.useDict('sys_normal_disable')`
   - ❌ `proxy.resetForm`

6. **src/views/system/menu/index.vue**
   - ❌ `proxy.useDict` (2 个字典)
   - ❌ `proxy.handleTree` (2 处)
   - ❌ `proxy.resetForm` (2 处)

---

## 🔧 迁移模式

### 标准替换模式

#### 1. useDict
```javascript
// 之前
const { proxy } = getCurrentInstance()
const { sys_normal_disable } = proxy.useDict('sys_normal_disable')

// 现在
import { useDict } from '@/composables/useDict'
const { sys_normal_disable } = useDict('sys_normal_disable')
```

#### 2. resetForm
```javascript
// 之前
proxy.resetForm('formRef')

// 现在
import { resetForm } from '@/composables/useCommon'
resetForm(formRef)
```

#### 3. addDateRange
```javascript
// 之前
proxy.addDateRange(queryParams.value, dateRange.value)

// 现在
import { addDateRange } from '@/composables/useCommon'
addDateRange(queryParams.value, dateRange.value)
```

#### 4. download
```javascript
// 之前
proxy.download('system/user/export', params, filename)

// 现在
import { download } from '@/composables/useCommon'
download('system/user/export', params, filename)
```

#### 5. handleTree
```javascript
// 之前
proxy.handleTree(data, 'menuId')

// 现在
import { handleTree } from '@/composables/useCommon'
handleTree(data, 'menuId')
```

---

## 📈 统计数据

- **已完成**: 10 个文件
- **待完成**: 6 个文件
- **完成度**: ~62.5%

---

## 🎯 下一步计划

### 优先级排序

1. **高频使用文件** (优先处理)
   - `system/dept/index.vue` - 部门管理（7 处）
   - `system/menu/index.vue` - 菜单管理（5 处）
   - `system/role/index.vue` - 角色管理（5 处）

2. **字典相关文件**
   - `system/dict/index.vue` - 字典管理（4 处）

3. **角色相关子页面**
   - `system/role/selectUser.vue` - 选择用户（2 处）
   - `system/role/authUser.vue` - 分配用户（2 处）

---

## 💡 注意事项

### Composables 导入规范

1. **按需导入** - 只导入实际使用的函数
   ```javascript
   import { useDict, resetForm } from '@/composables/useCommon'
   ```

2. **避免重复导入** - 同一个文件多次使用只导入一次

3. **TypeScript 支持** - 所有 composables 都有完整的类型定义

### 代码风格

1. **移除 proxy** - 不再使用 `const { proxy } = getCurrentInstance()`
2. **直接使用 ref** - 表单 ref 直接传递给函数
3. **统一命名** - 保持与原有 API 一致的命名

---

## 📝 迁移检查清单

- [x] 移除 `const { proxy } = getCurrentInstance()`
- [ ] 导入需要的 composables
- [ ] 替换所有 `proxy.xxx` 调用
- [ ] 测试功能是否正常
- [ ] 检查 TypeScript 类型
- [ ] 提交代码

---

*更新时间：2026-03-29 07:30*  
*迁移进度：62.5% (10/16)*
