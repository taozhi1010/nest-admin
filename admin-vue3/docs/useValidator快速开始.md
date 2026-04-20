# useValidator 快速开始指南

## 🚀 5分钟快速上手

### 1. 基础用法（最简单）

```vue
<script setup lang="ts">
// 无需 import，自动导入！

const email = 'user@example.com'

// 直接调用验证函数
if (validEmail(email)) {
  console.log('邮箱格式正确')
}

if (validURL('https://example.com')) {
  console.log('URL 格式正确')
}
</script>
```

### 2. 表单验证示例

```vue
<script setup lang="ts">
import { ref } from 'vue'

const form = ref({
  email: '',
  username: ''
})

const errors = ref({})

function validate() {
  errors.value = {}
  
  // 验证邮箱
  if (!validEmail(form.value.email)) {
    errors.value.email = '请输入有效的邮箱地址'
  }
  
  // 验证用户名
  if (!validUsername(form.value.username)) {
    errors.value.username = '用户名必须是 admin 或 editor'
  }
  
  return Object.keys(errors.value).length === 0
}

function submit() {
  if (validate()) {
    console.log('提交表单', form.value)
  }
}
</script>

<template>
  <form @submit.prevent="submit">
    <div>
      <input v-model="form.email" placeholder="邮箱" />
      <span v-if="errors.email">{{ errors.email }}</span>
    </div>
    
    <div>
      <input v-model="form.username" placeholder="用户名" />
      <span v-if="errors.username">{{ errors.username }}</span>
    </div>
    
    <button type="submit">提交</button>
  </form>
</template>
```

### 3. 使用 Schema（推荐）

```vue
<script setup lang="ts">
import { ref } from 'vue'

const formData = ref({
  email: '',
  age: 0
})

function submit() {
  // 创建 Schema
  const schema = z.object({
    email: emailSchema,
    age: z.number().min(18, '必须年满18岁')
  })
  
  // 验证数据
  const result = safeValidate(schema, formData.value)
  
  if (result.success) {
    console.log('验证通过', result.data)
    // result.data 有完整的 TypeScript 类型
  } else {
    console.error('验证失败', result.error.issues)
  }
}
</script>
```

### 4. 自定义验证规则

```typescript
import { z } from 'zod'

// 手机号验证
const phoneSchema = z.string()
  .regex(/^1[3-9]\d{9}$/, '请输入有效的手机号')

// 使用
const result = safeValidate(phoneSchema, '13800138000')
if (result.success) {
  console.log('手机号有效')
}
```

## 📝 常用验证函数速查

```typescript
// 邮箱验证
validEmail('user@example.com') // true

// URL 验证
validURL('https://example.com') // true

// 用户名验证
validUsername('admin') // true

// 小写字母
validLowerCase('hello') // true

// 大写字母
validUpperCase('HELLO') // true

// 字母（大小写）
validAlphabets('Hello') // true

// 类型检查
isString('test') // true
isArray([1, 2, 3]) // true

// 外链检查
isExternal('https://example.com') // true

// HTTP 检查
isHttp('https://example.com') // true
```

## 🎯 常见场景

### 场景1：API 响应验证

```typescript
import { z } from 'zod'

// 定义响应结构
const UserResponseSchema = z.object({
  code: z.number(),
  data: z.object({
    id: z.number(),
    name: z.string(),
    email: emailSchema
  })
})

// 验证 API 响应
async function fetchUser(id: number) {
  const response = await fetch(`/api/users/${id}`)
  const json = await response.json()
  
  const result = safeValidate(UserResponseSchema, json)
  
  if (result.success) {
    return result.data.data // 类型安全的数据
  } else {
    throw new Error('API 响应格式错误')
  }
}
```

### 场景2：复杂表单验证

```typescript
import { z } from 'zod'

// 定义表单 Schema
const RegisterFormSchema = z.object({
  username: z.string().min(3, '至少3个字符'),
  email: emailSchema,
  password: z.string()
    .min(8, '至少8位')
    .regex(/[A-Z]/, '需要大写字母')
    .regex(/[0-9]/, '需要数字'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: '两次密码不一致',
  path: ['confirmPassword']
})

// 使用
function register(formData: any) {
  const result = safeValidate(RegisterFormSchema, formData)
  
  if (!result.success) {
    // 显示所有错误
    result.error.issues.forEach(issue => {
      ElMessage.error(issue.message)
    })
    return
  }
  
  // 提交注册
  console.log('注册数据', result.data)
}
```

### 场景3：数组验证

```typescript
import { z } from 'zod'

// 验证用户列表
const UsersSchema = z.array(z.object({
  id: z.number(),
  name: z.string(),
  email: emailSchema
}))

const result = safeValidate(UsersSchema, apiData)

if (result.success) {
  // result.data 的类型是 Array<{id: number, name: string, email: string}>
  result.data.forEach(user => {
    console.log(user.name, user.email)
  })
}
```

## 💡 最佳实践

### ✅ 推荐做法

1. **简单验证用函数**
   ```typescript
   if (validEmail(email)) { /* ... */ }
   ```

2. **复杂验证用 Schema**
   ```typescript
   const schema = z.object({ /* ... */ })
   const result = safeValidate(schema, data)
   ```

3. **复用 Schema**
   ```typescript
   // 定义一次，多处使用
   export const UserSchema = z.object({ /* ... */ })
   ```

4. **利用类型推断**
   ```typescript
   type User = z.infer<typeof UserSchema>
   ```

### ❌ 避免的做法

1. ~~不要混合使用新旧验证方式~~
2. ~~不要在 Schema 中重复定义已有的验证~~
3. ~~不要忽略验证错误~~

## 🔍 调试技巧

```typescript
// 查看详细的验证错误
const result = safeValidate(schema, data)

if (!result.success) {
  console.log('所有错误:', result.error.issues)
  
  result.error.issues.forEach((issue, index) => {
    console.log(`错误 ${index + 1}:`)
    console.log('  路径:', issue.path)
    console.log('  消息:', issue.message)
  })
}
```

## 📚 更多资源

- [完整使用文档](./useValidator使用说明.md)
- [测试示例文件](../src/composables/useValidator.test.ts)
- [Zod 官方文档](https://zod.dev/)

## ❓ 常见问题

**Q: 需要手动 import 吗？**  
A: 不需要！所有函数都已配置自动导入。

**Q: 如何创建自定义验证？**  
A: 使用 `z.string().regex()` 或 `.refine()` 方法。

**Q: Zod 会影响性能吗？**  
A: Zod 经过优化，性能很好。包体积约 10KB (gzipped)。

**Q: 旧的 validate.js 还能用吗？**  
A: 可以，但建议逐步迁移到新方案。

---

**开始使用吧！** 🎉

如有问题，请查看详细文档或联系开发团队。
