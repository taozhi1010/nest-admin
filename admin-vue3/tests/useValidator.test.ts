/**
 * useValidator 测试示例
 * 展示各种验证函数的使用方法
 */

import {
  validEmail,
  validURL,
  validUsername,
  validLowerCase,
  validUpperCase,
  validAlphabets,
  isString,
  isArray,
  isExternal,
  isHttp,
  safeValidate,
  emailSchema,
  urlSchema,
  usernameSchema
} from '../src/composables/useValidator'
import { z } from 'zod'

// 1. 基础验证函数测试
console.log('=== 基础验证函数测试 ===')

// 邮箱验证
console.log('validEmail("user@example.com"):', validEmail('user@example.com')) // true
console.log('validEmail("invalid-email"):', validEmail('invalid-email')) // false

// URL 验证
console.log('validURL("https://example.com"):', validURL('https://example.com')) // true
console.log('validURL("not-a-url"):', validURL('not-a-url')) // false

// 用户名验证
console.log('validUsername("admin"):', validUsername('admin')) // true
console.log('validUsername("guest"):', validUsername('guest')) // false

// 字母验证
console.log('validLowerCase("hello"):', validLowerCase('hello')) // true
console.log('validLowerCase("Hello"):', validLowerCase('Hello')) // false

console.log('validUpperCase("HELLO"):', validUpperCase('HELLO')) // true
console.log('validUpperCase("Hello"):', validUpperCase('Hello')) // false

console.log('validAlphabets("Hello"):', validAlphabets('Hello')) // true
console.log('validAlphabets("Hello123"):', validAlphabets('Hello123')) // false

// 类型检查
console.log('isString("test"):', isString('test')) // true
console.log('isString(123):', isString(123)) // false

console.log('isArray([1, 2, 3]):', isArray([1, 2, 3])) // true
console.log('isArray("not-array"):', isArray('not-array')) // false

// 外链检查
console.log('isExternal("https://example.com"):', isExternal('https://example.com')) // true
console.log('isExternal("/internal/path"):', isExternal('/internal/path')) // false

// HTTP 检查
console.log('isHttp("https://example.com"):', isHttp('https://example.com')) // true
console.log('isHttp("ftp://example.com"):', isHttp('ftp://example.com')) // false

// 2. Schema 验证测试
console.log('\n=== Schema 验证测试 ===')

// 使用 emailSchema
const emailResult1 = safeValidate(emailSchema, 'user@example.com')
console.log('邮箱验证（有效）:', emailResult1.success) // true

const emailResult2 = safeValidate(emailSchema, 'invalid')
console.log('邮箱验证（无效）:', emailResult2.success) // false
if (!emailResult2.success) {
  console.log('错误信息:', emailResult2.error.issues[0].message)
}

// 使用 urlSchema
const urlResult1 = safeValidate(urlSchema, 'https://example.com')
console.log('URL验证（有效）:', urlResult1.success) // true

const urlResult2 = safeValidate(urlSchema, 'not-a-url')
console.log('URL验证（无效）:', urlResult2.success) // false

// 使用 usernameSchema
const userResult1 = safeValidate(usernameSchema, 'admin')
console.log('用户名验证（有效）:', userResult1.success) // true

const userResult2 = safeValidate(usernameSchema, 'guest')
console.log('用户名验证（无效）:', userResult2.success) // false

// 3. 复杂对象验证示例
console.log('\n=== 复杂对象验证示例 ===')

// 定义用户 Schema
const UserSchema = z.object({
  id: z.number().positive(),
  name: z.string().min(2),
  email: emailSchema,
  age: z.number().min(18).optional(),
  role: z.enum(['admin', 'user', 'guest'])
})

// 推断类型
type User = z.infer<typeof UserSchema>

// 验证有效数据
const validUser: User = {
  id: 1,
  name: '张三',
  email: 'zhangsan@example.com',
  age: 25,
  role: 'admin'
}

const validUserResult = safeValidate(UserSchema, validUser)
console.log('用户数据验证（有效）:', validUserResult.success) // true
if (validUserResult.success) {
  console.log('用户姓名:', validUserResult.data.name)
}

// 验证无效数据
const invalidUser = {
  id: -1,
  name: '李',
  email: 'invalid-email',
  age: 15,
  role: 'superadmin'
}

const invalidUserResult = safeValidate(UserSchema, invalidUser)
console.log('用户数据验证（无效）:', invalidUserResult.success) // false
if (!invalidUserResult.success) {
  console.log('验证错误数量:', invalidUserResult.error.issues.length)
  invalidUserResult.error.issues.forEach((err, index) => {
    console.log(`错误 ${index + 1}:`, err.message)
  })
}

// 4. 自定义 Schema 示例
console.log('\n=== 自定义 Schema 示例 ===')

// 手机号验证
const phoneSchema = z.string().regex(/^1[3-9]\d{9}$/, '请输入有效的手机号')

const phoneResult1 = safeValidate(phoneSchema, '13800138000')
console.log('手机号验证（有效）:', phoneResult1.success) // true

const phoneResult2 = safeValidate(phoneSchema, '12345678901')
console.log('手机号验证（无效）:', phoneResult2.success) // false
if (!phoneResult2.success) {
  console.log('错误信息:', phoneResult2.error.issues[0].message)
}

// 密码强度验证
const passwordSchema = z.string()
  .min(8, '密码至少8位')
  .regex(/[A-Z]/, '必须包含大写字母')
  .regex(/[a-z]/, '必须包含小写字母')
  .regex(/[0-9]/, '必须包含数字')

const pwdResult1 = safeValidate(passwordSchema, 'Password123')
console.log('密码验证（有效）:', pwdResult1.success) // true

const pwdResult2 = safeValidate(passwordSchema, 'weak')
console.log('密码验证（无效）:', pwdResult2.success) // false
if (!pwdResult2.success) {
  console.log('密码错误数量:', pwdResult2.error.issues.length)
}

console.log('\n=== 测试完成 ===')
