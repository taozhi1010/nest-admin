import { checkUsername } from '@/api/login'

/** 远程校验结果：true=已注册 false=未注册 null=接口异常（不阻塞，由后端提交时兜底） */
type ExistsResult = boolean | null

// 远程校验缓存：同一账号值一个会话内只请求一次
const existsCache = new Map<string, ExistsResult>()

/**
 * 查询账号是否已被注册
 */
export async function fetchAccountExists(username: string): Promise<ExistsResult> {
  const key = (username || '').trim()
  if (!key) return null
  if (existsCache.has(key)) return existsCache.get(key)!
  try {
    const res: any = await checkUsername(key)
    const exists = !!res?.data?.exists
    existsCache.set(key, exists)
    return exists
  } catch {
    return null
  }
}

/** 重复注册提示：邮箱账号与普通账号分开提示 */
export function accountExistsMessage(username: string): string {
  return (username || '').includes('@') ? '该邮箱已被注册' : '该账号已被注册'
}

/**
 * 生成"账号是否已被注册"的异步校验规则，直接挂到 el-form 的 username 规则数组上
 */
export function createAccountExistsValidator() {
  return {
    validator: async (_rule: any, value: string, callback: (error?: Error) => void) => {
      const username = (value || '').trim()
      if (!username) return callback()
      const exists = await fetchAccountExists(username)
      if (exists) return callback(new Error(accountExistsMessage(username)))
      callback()
    },
    trigger: 'blur'
  }
}
