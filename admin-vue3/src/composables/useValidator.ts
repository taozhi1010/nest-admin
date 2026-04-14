import { z } from 'zod'

/**
 * URL 验证 Schema
 * 验证是否为有效的 HTTP/HTTPS URL
 */
export const urlSchema = z.string().url('请输入有效的URL地址')

/**
 * 邮箱验证 Schema
 * 验证是否为有效的邮箱格式
 */
export const emailSchema = z.string().email('请输入有效的邮箱地址')

/**
 * 用户名验证 Schema
 * 验证用户名是否在允许的列表中
 */
export const usernameSchema = z.enum(['admin', 'editor']).describe('无效的用户名')

/**
 * 小写字母验证 Schema
 * 验证是否只包含小写字母
 */
export const lowerCaseSchema = z
  .string()
  .regex(/^[a-z]+$/, '只能包含小写字母')

/**
 * 大写字母验证 Schema
 * 验证是否只包含大写字母
 */
export const upperCaseSchema = z
  .string()
  .regex(/^[A-Z]+$/, '只能包含大写字母')

/**
 * 字母验证 Schema
 * 验证是否只包含字母（大小写）
 */
export const alphabetsSchema = z
  .string()
  .regex(/^[A-Za-z]+$/, '只能包含字母')

/**
 * 外链路径验证 Schema
 * 验证是否为外部链接（http/https/mailto/tel）
 */
export function isExternal(path: string): boolean {
  return /^(https?:|mailto:|tel:)/.test(path)
}

/**
 * HTTP/HTTPS URL 检查
 * @param url - 要检查的URL
 * @returns 是否为HTTP或HTTPS协议
 */
export function isHttp(url: string): boolean {
  return url.indexOf('http://') !== -1 || url.indexOf('https://') !== -1
}

/**
 * 验证 URL 格式
 * @param url - 要验证的URL
 * @returns 是否为有效URL
 */
export function validURL(url: string): boolean {
  try {
    urlSchema.parse(url)
    return true
  } catch {
    return false
  }
}

/**
 * 验证用户名
 * @param username - 要验证的用户名
 * @returns 是否为有效用户名
 */
export function validUsername(username: string): boolean {
  try {
    usernameSchema.parse(username.trim())
    return true
  } catch {
    return false
  }
}

/**
 * 验证小写字母字符串
 * @param str - 要验证的字符串
 * @returns 是否只包含小写字母
 */
export function validLowerCase(str: string): boolean {
  try {
    lowerCaseSchema.parse(str)
    return true
  } catch {
    return false
  }
}

/**
 * 验证大写字母字符串
 * @param str - 要验证的字符串
 * @returns 是否只包含大写字母
 */
export function validUpperCase(str: string): boolean {
  try {
    upperCaseSchema.parse(str)
    return true
  } catch {
    return false
  }
}

/**
 * 验证字母字符串
 * @param str - 要验证的字符串
 * @returns 是否只包含字母
 */
export function validAlphabets(str: string): boolean {
  try {
    alphabetsSchema.parse(str)
    return true
  } catch {
    return false
  }
}

/**
 * 验证邮箱格式
 * @param email - 要验证的邮箱
 * @returns 是否为有效邮箱
 */
export function validEmail(email: string): boolean {
  try {
    emailSchema.parse(email)
    return true
  } catch {
    return false
  }
}

/**
 * 类型守卫：判断是否为字符串
 * @param value - 要检查的值
 * @returns 是否为字符串类型
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string' || value instanceof String
}

/**
 * 类型守卫：判断是否为数组
 * @param value - 要检查的值
 * @returns 是否为数组类型
 */
export function isArray<T>(value: unknown): value is T[] {
  return Array.isArray(value)
}

/**
 * Zod 验证辅助函数
 * 安全地验证数据，返回结果对象
 * @param schema - Zod schema
 * @param data - 要验证的数据
 * @returns 验证结果 { success: boolean, data?: T, error?: ZodError }
 */
export function safeValidate<T>(schema: z.ZodType<T>, data: unknown) {
  const result = schema.safeParse(data)
  return result
}

/**
 * 创建自定义字符串验证 Schema
 * @param pattern - 正则表达式
 * @param message - 错误消息
 * @returns Zod 字符串 Schema
 */
export function createRegexSchema(pattern: RegExp, message: string) {
  return z.string().regex(pattern, message)
}

/**
 * 创建数字范围验证 Schema
 * @param min - 最小值
 * @param max - 最大值
 * @param message - 错误消息
 * @returns Zod 数字 Schema
 */
export function createNumberRangeSchema(min: number, max: number, message?: string) {
  let schema = z.number().min(min).max(max)
  if (message) {
    schema = schema.refine(
      (val) => val >= min && val <= max,
      { message }
    )
  }
  return schema
}
