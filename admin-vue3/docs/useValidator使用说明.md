# useValidator 验证工具使用说明

## 概述

`useValidator` 是基于 Zod 构建的 TypeScript 验证工具，提供了类型安全的运行时数据验证。相比原来的 `validate.js`，它具有以下优势：

- ✅ **TypeScript 原生支持** - 完整的类型推断和检查
- ✅ **运行时验证** - 在运行时确保数据类型安全
- ✅ **自动导入** - 无需手动 import，开箱即用
- ✅ **更好的错误提示** - 清晰的验证错误信息
- ✅ **可扩展** - 轻松创建自定义验证规则

## 快速开始

### 1. 基础验证函数（兼容原有 API）

```typescript
// 验证邮箱
const isValid = validEmail('user@example.com') // true

// 验证 URL
const isValidUrl = validURL('https://example.com') // true

// 验证用户名
const isValidUser = validUsername('admin') // true

// 验证小写字母
const isLower = validLowerCase('hello') // true

// 验证大写字母
const isUpper = validUpperCase('HELLO') // true

// 验证字母
const isAlpha = validAlphabets('Hello') // true

// 检查是否为字符串
const isStr = isString('test') // true

// 检查是否为数组
const isArr = isArray([1, 2, 3]) // true

// 检查是否为外链
const isExt = isExternal('https://example.com') // true

// 检查是否为 HTTP/HTTPS
const isHttpUrl = isHttp('https://example.com') // true
```

### 2. 使用 Zod Schema（推荐方式）

```typescript
// 使用预定义的 Schema
try {
  const email = emailSchema.parse('user@example.com')
  console.log('邮箱有效:', email)
} catch (error) {
  console.error('验证失败:', error.errors)
}

// 安全验证（不抛出异常）
const result = safeValidate(emailSchema, 'invalid-email')
if (result.success) {
  console.log('验证通过:', result.data)
} else {
  console.error('验证失败:', result.error.errors)
}
```

### 3. 在 Vue 组件中使用

```vue
<script setup lang="ts">
import { ref } from 'vue'

const form = ref({
  email: '',
  username: '',
  website: ''
})

const errors = ref({})

function validateForm() {
  errors.value = {}
  
  // 验证邮箱
  const emailResult = safeValidate(emailSchema, form.value.email)
  if (!emailResult.success) {
    errors.value.email = emailResult.error.errors[0].message
  }
  
  // 验证用户名
  const userResult = safeValidate(usernameSchema, form.value.username)
  if (!userResult.success) {
    errors.value.username = userResult.error.errors[0].message
  }
  
  // 验证 URL
  if (form.value.website) {
    const urlResult = safeValidate(urlSchema, form.value.website)
    if (!urlResult.success) {
      errors.value.website = urlResult.error.errors[0].message
    }
  }
  
  return Object.keys(errors.value).length === 0
}

function submitForm() {
  if (validateForm()) {
    console.log('表单提交:', form.value)
  }
}
</script>

<template>
  <form @submit.prevent="submitForm">
    <div>
      <label>邮箱：</label>
      <input v-model="form.email" type="email" />
      <span v-if="errors.email" class="error">{{ errors.email }}</span>
    </div>
    
    <div>
      <label>用户名：</label>
      <input v-model="form.username" />
      <span v-if="errors.username" class="error">{{ errors.username }}</span>
    </div>
    
    <div>
      <label>网站：</label>
      <input v-model="form.website" type="url" />
      <span v-if="errors.website" class="error">{{ errors.website }}</span>
    </div>
    
    <button type="submit">提交</button>
  </form>
</template>
```

### 4. 创建自定义验证规则

```typescript
import { z } from 'zod'

// 手机号验证
const phoneSchema = z.string().regex(/^1[3-9]\d{9}$/, '请输入有效的手机号')

// 身份证验证
const idCardSchema = z.string().regex(/^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/, '请输入有效的身份证号')

// 密码强度验证
const passwordSchema = z.string()
  .min(8, '密码至少8位')
  .regex(/[A-Z]/, '密码必须包含大写字母')
  .regex(/[a-z]/, '密码必须包含小写字母')
  .regex(/[0-9]/, '密码必须包含数字')

// 使用自定义 Schema
const result = safeValidate(phoneSchema, '13800138000')
if (result.success) {
  console.log('手机号有效')
}
```

### 5. 复杂对象验证

```typescript
import { z } from 'zod'

// 定义用户 Schema
const UserSchema = z.object({
  id: z.number().positive(),
  name: z.string().min(2, '姓名至少2个字符'),
  email: emailSchema,
  age: z.number().min(18, '必须年满18岁').optional(),
  role: z.enum(['admin', 'user', 'guest']),
  createdAt: z.date()
})

// 推断 TypeScript 类型
type User = z.infer<typeof UserSchema>

// 验证用户数据
const userData = {
  id: 1,
  name: '张三',
  email: 'zhangsan@example.com',
  age: 25,
  role: 'admin',
  createdAt: new Date()
}

const result = safeValidate(UserSchema, userData)
if (result.success) {
  // TypeScript 知道 result.data 的类型是 User
  console.log('用户数据有效:', result.data.name)
} else {
  console.error('验证失败:', result.error.errors)
}
```

## API 参考

### 验证函数

| 函数 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `validEmail(email)` | `string` | `boolean` | 验证邮箱格式 |
| `validURL(url)` | `string` | `boolean` | 验证 URL 格式 |
| `validUsername(username)` | `string` | `boolean` | 验证用户名 |
| `validLowerCase(str)` | `string` | `boolean` | 验证小写字母 |
| `validUpperCase(str)` | `string` | `boolean` | 验证大写字母 |
| `validAlphabets(str)` | `string` | `boolean` | 验证字母 |
| `isString(value)` | `unknown` | `boolean` | 类型守卫：字符串 |
| `isArray(value)` | `unknown` | `boolean` | 类型守卫：数组 |
| `isExternal(path)` | `string` | `boolean` | 检查是否外链 |
| `isHttp(url)` | `string` | `boolean` | 检查是否 HTTP/HTTPS |

### Zod Schemas

| Schema | 类型 | 说明 |
|--------|------|------|
| `emailSchema` | `ZodString` | 邮箱验证 |
| `urlSchema` | `ZodString` | URL 验证 |
| `usernameSchema` | `ZodEnum` | 用户名验证 |
| `lowerCaseSchema` | `ZodString` | 小写字母验证 |
| `upperCaseSchema` | `ZodString` | 大写字母验证 |
| `alphabetsSchema` | `ZodString` | 字母验证 |

### 辅助函数

| 函数 | 说明 |
|------|------|
| `safeValidate(schema, data)` | 安全验证，返回结果对象 |
| `createRegexSchema(pattern, message)` | 创建正则验证 Schema |
| `createNumberRangeSchema(min, max, message)` | 创建数字范围验证 Schema |

## 迁移指南

### 从 validate.js 迁移

```javascript
// 旧代码 (validate.js)
import { validEmail, validURL } from '@/utils/validate'

if (validEmail(email)) {
  // ...
}
```

```typescript
// 新代码 (useValidator) - 自动导入，无需 import
if (validEmail(email)) {
  // ...
}

// 或者使用 Schema（推荐）
const result = safeValidate(emailSchema, email)
if (result.success) {
  // ...
}
```

## 最佳实践

1. **优先使用 Schema** - Schema 提供类型推断和更好的错误处理
2. **使用 safeValidate** - 避免 try-catch，代码更清晰
3. **组合 Schema** - 复用已有的 Schema 构建复杂验证
4. **自定义错误消息** - 提供友好的中文错误提示
5. **类型推断** - 利用 `z.infer` 获得准确的 TypeScript 类型

## 注意事项

- ✅ 所有验证函数已配置为自动导入，无需手动 import
- ✅ Zod schemas 可用于表单验证、API 数据验证等场景
- ✅ 使用 `safeValidate` 可以获得详细的错误信息
- ⚠️ 原有的 `validate.js` 仍然保留，建议逐步迁移到新方案
