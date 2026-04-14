import Cookies from 'js-cookie'

const TokenKey = 'Admin-Token'

/**
 * 获取 Token
 */
export function getToken(): string | undefined {
  return Cookies.get(TokenKey)
}

/**
 * 设置 Token
 */
export function setToken(token: string): string | undefined {
  return Cookies.set(TokenKey, token)
}

/**
 * 移除 Token
 */
export function removeToken(): void {
  Cookies.remove(TokenKey)
}
