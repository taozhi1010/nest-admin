# Vue3 表单页面重构规范

## 📋 概述

本规范用于指导 Vue3 + Element Plus 项目的表单页面重构，确保代码风格统一、可维护性强、符合现代 Vue3 最佳实践。

---

## 🎯 核心原则

### 1. **语义化分组**
将代码按功能进行语义化分组，使用注释清晰标识每个部分。

### **2. 响应式数据扁平化**
使用一个统一的模块对象（如 `xxx`）包裹所有列表状态、查询参数、表单数据和方法，保持代码的集中管理和可读性。

### 3. **现代化异步处理**
使用 `async/await` + `try-catch` 替代 Promise 链式调用。

### 4. **箭头函数优先**
统一使用箭头函数，保持 `this` 绑定的一致性。

---

## 📐 代码结构规范

### **标准结构模板**

```vue
<script setup name="ComponentName">
// ==================== 导入区域 ====================
import { xxx } from "@/api/xxx"
import { useDict } from '@/composables/useDict'
import { resetForm, parseTime } from '@/composables/useCommon'

// ==================== 实例和字典 ====================
const { proxy } = getCurrentInstance()
const { dictType1, dictType2 } = useDict('dictType1', 'dictType2')

// ==================== 表单引用 ====================
const formRef = ref(null)
const queryRef = ref(null)

// ==================== 业务模块（集中管理） ====================
const xxx = reactive({
   // 列表状态
   list: [],
   loading: true,
   showSearch: true,
   ids: [],
   total: 0,
   
   // 弹窗状态
   open: false,
   title: "",
   
   // 查询参数（包含分页）
   queryParams: {
      pageNum: 1,
      pageSize: 10,
      // ... 其他查询字段
   },
   
   // 表单数据
   form: {},
   
   // 表单验证规则
   rules: {
      // 验证规则
   },
   
   // 方法集合
   // 查询列表
   getList: async () => {
      xxx.loading = true
      try {
         const response = await apiFunction(xxx.queryParams)
         xxx.list = response.data.list
         xxx.total = response.data.total
      } finally {
         xxx.loading = false
      }
   },
   
   // 搜索按钮
   handleQuery: () => {
      xxx.queryParams.pageNum = 1
      xxx.getList()
   },
   
   // 重置按钮
   resetQuery: () => {
      resetForm(queryRef.value)
      xxx.handleQuery()
   },
   
   // 取消按钮
   cancel: () => {
      xxx.open = false
      xxx.reset()
   },
   
   // 表单重置
   reset: () => {
      xxx.form = {}
      nextTick(() => {
         resetForm(formRef.value)
      })
   },
   
   // 新增按钮
   handleAdd: () => {
      xxx.reset()
      xxx.open = true
      xxx.title = "添加 XXX"
   },
   
   // 修改按钮
   handleUpdate: async (row) => {
      xxx.reset()
      const response = await getApi(row.id)
      Object.assign(xxx.form, response.data)
      xxx.open = true
      xxx.title = "修改 XXX"
   },
   
   // 提交按钮
   submitForm: () => {
      formRef.value.validate(async (valid) => {
         if (!valid) return
         
         try {
            if (xxx.form.id !== undefined) {
               await updateApi(xxx.form)
               proxy.$modal.msgSuccess("修改成功")
            } else {
               await addApi(xxx.form)
               proxy.$modal.msgSuccess("新增成功")
            }
            xxx.open = false
            xxx.getList()
         } catch (e) {
            console.error('提交失败:', e)
         }
      })
   },
   
   // 删除按钮
   handleDelete: async (row) => {
      try {
         await proxy.$modal.confirm('是否确认删除？')
         await delApi(row.id)
         proxy.$modal.msgSuccess("删除成功")
         xxx.getList()
      } catch (e) {
         if (e !== 'cancel') {
            console.error('删除失败:', e)
         }
      }
   }
})

// 初始化加载
xxx.getList()
</script>
```

---

## 🔧 具体规范细则

### **1. 导入规范**

```javascript
// ✅ 正确：按类型分组导入
import { listApi, getApi, addApi, updateApi, delApi } from "@/api/xxx"
import { useDict } from '@/composables/useDict'
import { resetForm, parseTime, download } from '@/composables/useCommon'

// ❌ 错误：混在一起导入
import { listApi, useDict, resetForm } from "..."
```

### **2. 响应式数据声明**

```javascript
// ✅ 正确：使用模块对象集中管理
const formRef = ref(null)
const queryRef = ref(null)

const post = reactive({
   // 列表状态
   postList: [],
   loading: true,
   showSearch: true,
   ids: [],
   multiple: true,
   total: 0,
   
   // 弹窗状态
   open: false,
   title: "",
   
   // 查询参数（包含分页）
   queryParams: {
      pageNum: 1,
      pageSize: 10,
      postCode: undefined,
      postName: undefined
   },
   
   // 表单数据
   form: {},
   
   // 表单验证规则
   rules: {...}
})

// ❌ 错误：分散的独立声明
const postList = ref([])
const loading = ref(true)
const open = ref(false)
const queryParams = reactive({...})
const form = reactive({...})
```

### **3. 方法命名和实现**

```javascript
// ✅ 正确：使用箭头函数 + async/await
const getList = async () => {
   loading.value = true
   try {
      const response = await listApi(queryParams)
      list.value = response.data.list
      total.value = response.data.total
   } finally {
      loading.value = false
   }
}

// ❌ 错误：传统函数 + Promise 链
function getList() {
   loading.value = true;
   listApi(queryParams).then(response => {
      list.value = response.data.list;
   }).finally(() => {
      loading.value = false;
   });
}
```

### **4. 错误处理**

```javascript
// ✅ 正确：使用 try-catch + 模块对象
const handleDelete = async (row) => {
   try {
      await proxy.$modal.confirm('是否确认删除？')
      await delApi(row.id)
      proxy.$modal.msgSuccess("删除成功")
      post.getList()
   } catch (e) {
      if (e !== 'cancel') {
         console.error('删除失败:', e)
      }
   }
}

// ❌ 错误：Promise 链式调用
function handleDelete(row) {
   proxy.$modal.confirm(...).then(function() {
      return delApi(row.id);
   }).then(() => {
      getList();
   }).catch(() => {});
}
```

### **5. 表单验证和提交**

```javascript
// ✅ 正确：现代验证方式
const submitForm = async () => {
   try {
      const valid = await formRef.value.validate()
      if (!valid) return

      if (form.id !== undefined) {
         await updateApi(form)
         proxy.$modal.msgSuccess("修改成功")
      } else {
         await addApi(form)
         proxy.$modal.msgSuccess("新增成功")
      }
      open.value = false
      getList()
   } catch (e) {
      console.error('提交失败:', e)
   }
}

// ❌ 错误：回调嵌套
function submitForm() {
   formRef.value.validate(valid => {
      if (valid) {
         if (form.id != undefined) {
            updateApi(form).then(...)
         }
      }
   })
}
```

### **6. 数据赋值**

```javascript
// ✅ 正确：使用 Object.assign
const handleUpdate = async (row) => {
   reset()
   const response = await getApi(row.id)
   Object.assign(form, response.data)
   open.value = true
}

// ❌ 错误：直接替换整个对象
form = response.data
```

### **7. 表单输入框 Trim 修饰符**

```vue
<!-- ✅ 正确：列表搜索表单使用 trim -->
<el-form :model="post.queryParams" ref="queryRef" :inline="true" v-show="post.showSearch">
   <el-form-item label="名称" prop="name">
      <el-input v-model.trim="post.queryParams.name" placeholder="请输入名称" clearable />
   </el-form-item>
</el-form>

<!-- ✅ 正确：对话框表单使用 trim -->
<el-form ref="formRef" :model="post.form" :rules="post.rules">
   <el-form-item label="名称" prop="name">
      <el-input v-model.trim="post.form.name" placeholder="请输入名称" />
   </el-form-item>
   <el-form-item label="备注" prop="remark">
      <el-input v-model.trim="post.form.remark" type="textarea" placeholder="请输入备注" clearable />
   </el-form-item>
</el-form>

<!-- ❌ 错误：没有使用 trim 修饰符 -->
<el-input v-model="queryParams.name" />
<el-input v-model="form.name" />
```

**为什么要使用 trim？**
- 自动去除用户输入的首尾空格
- 避免因空格导致的验证问题
- 确保提交到后端的数据是干净的
- 提升用户体验和数据质量

---

### **8. 表格批量操作按钮设计**

```vue
<!-- ✅ 正确：移除批量修改按钮，只保留新增和删除 -->
<el-row :gutter="10" class="mb8">
   <el-col :span="1.5">
      <el-button type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
   </el-col>
   <el-col :span="1.5">
      <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete">删除</el-button>
   </el-col>
</el-row>

<!-- ❌ 错误：包含批量修改按钮 -->
<el-col :span="1.5">
   <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate">修改</el-button>
</el-col>
```

**为什么移除批量修改按钮？**
- 用户不可能同时操作多条数据进行修改
- 批量修改不符合实际业务场景和用户体验
- 每条数据的修改应该是独立的、逐个进行的
- 避免用户误操作，提高数据安全性
- 保持界面简洁，减少不必要的功能干扰

---

## 📝 注释规范

### **区域分隔注释**
使用统一的格式标识不同功能区域：

```javascript
// ==================== 导入区域 ====================

// ==================== 实例和字典 ====================

// ==================== 表单引用 ====================

// ==================== 列表状态管理 ====================

// ==================== 查询参数和表单数据 ====================

// ==================== 方法集合 ====================
```

### **方法说明注释**
每个方法前添加简短注释说明用途：

```javascript
// 查询列表
const getList = async () => {...}

// 取消按钮
const cancel = () => {...}

// 表单重置
const reset = () => {...}

// 搜索按钮操作
const handleQuery = () => {...}

// 修改按钮操作
const handleUpdate = async (row) => {...}
```

---

## 🎨 代码格式规范

### **1. 分号使用**
- ❌ 不使用分号（除非必要）
- ✅ 遵循 ESLint + Prettier 配置

### **2. 字符串引号**
- ✅ 统一使用单引号 `'`
- ✅ 模板字符串使用反引号 `` ` ``

### **3. 空格和缩进**
- ✅ 使用 3 个空格缩进
- ✅ 操作符前后加空格

### **4. 对象字面量**
```javascript
// ✅ 正确
const form = reactive({
   id: undefined,
   name: undefined
})

// ❌ 错误：缺少尾逗号（在跨行时）
const form = {
   id: undefined,
   name: undefined
}
```

---

## ⚠️ 常见错误和避免方法

### **1. 模板引用错误**

```javascript
// ❌ 错误：在 reactive 内部使用 ref
const post = reactive({
   postRef: null  // 这样无法获取表单实例
})

// ✅ 正确：独立声明
const postRef = ref(null)
const queryRef = ref(null)
const post = reactive({...})
```

### **2. 响应式数据丢失**

```javascript
// ❌ 错误：直接替换 reactive 对象
post.form = newData  // 会丢失响应性

// ✅ 正确：使用 Object.assign
Object.assign(post.form, newData)

// ✅ 或者：逐个属性赋值
post.form.id = newData.id
post.form.name = newData.name
```

### **3. 未处理的 Promise**

```javascript
// ❌ 错误：没有错误处理
await someAsyncOperation()

// ✅ 正确：使用 try-catch
try {
   await someAsyncOperation()
} catch (e) {
   console.error('操作失败:', e)
}
```

### **4. 不必要的 toRefs**

```javascript
// ❌ 错误：过度使用 toRefs
const data = reactive({ form: {}, queryParams: {} })
const { form, queryParams } = toRefs(data)

// ✅ 正确：直接使用
const form = reactive({...})
const queryParams = reactive({...})
```

---

## 🔄 重构检查清单

在重构表单页面时，请检查以下项目：

- [ ] 使用了语义化的区域分隔注释
- [ ] 使用模块对象（如 `post`、`menu`）集中管理状态和方法
- [ ] 所有方法使用箭头函数
- [ ] 异步操作使用 async/await + try-catch
- [ ] 表单验证使用 `.validate()` 返回 Promise
- [ ] 删除了所有不必要的分号
- [ ] 使用 `Object.assign` 进行对象赋值
- [ ] 错误处理包含 `console.error`
- [ ] 代码格式符合 ESLint + Prettier 规范
- [ ] 模板中正确使用 `.value` 访问 ref 实例（如 `formRef.value`）
- [ ] 所有输入框使用了 `trim` 修饰符
- [ ] 表格批量操作按钮只保留新增和删除，移除了批量修改按钮

---

## 📚 参考示例

### **标准代码格式参考**

完整的示例请参考：
- `/src/views/system/post/index.vue` - 岗位管理页面（⭐ 标准模板）
- `/src/views/system/config/index.vue` - 参数配置页面
- `/src/views/system/menu/index.vue` - 菜单管理页面

### **岗位管理页面代码特点**

```vue
<!-- 使用 post 对象包裹所有数据和方 -->
<script setup name="Post">
import { listPost, addPost, delPost, getPost, updatePost } from "@/api/system/post"
import { useDict } from '@/composables/useDict'
import { resetForm, download, parseTime } from '@/composables/useCommon'

const { proxy } = getCurrentInstance()
const { sys_normal_disable } = useDict('sys_normal_disable')

// 模板引用
const postRef = ref(null)

// 岗位管理（集中式管理）
const post = reactive({
   // 列表状态
   postList: [],
   open: false,
   loading: true,
   showSearch: true,
   ids: [],
   multiple: true,
   total: 0,
   title: "",
   
   // 表单和查询参数
   form: {},
   queryParams: {
      pageNum: 1,
      pageSize: 10,
      postCode: undefined,
      postName: undefined,
      status: undefined
   },
   rules: {...},
   
   // 方法集合
   getList: async () => {...},
   handleQuery: () => {...},
   resetQuery: () => {...},
   handleAdd: () => {...},
   handleUpdate: async (row) => {...},
   submitForm: () => {...},
   handleDelete: async (row) => {...}
})

// 初始化加载
post.getList()
</script>
```

**核心特点：**
1. 使用 `post` 对象包裹所有业务相关的状态和方法
2. 模板中通过 `post.xxx` 访问数据和调用方法
3. 代码结构清晰，便于维护和扩展
4. 符合 Vue3 + Element Plus 最佳实践

---

## 💡 最佳实践提示

1. **保持一致性**：团队所有成员遵循相同的代码风格
2. **持续改进**：发现更好的实践及时更新规范
3. **代码审查**：通过 Code Review 确保规范执行
4. **自动化检查**：配置 ESLint + Prettier 自动格式化
5. **文档化**：将规范文档化并定期组织学习

---

**最后更新**: 2026-03-30  
**版本**: v1.0  
**适用项目**: Vue3 + Element Plus + Vite 项目
