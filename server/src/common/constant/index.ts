/**
 * 登录用户 redis key 过期时间
 * 24h
 */
export const LOGIN_TOKEN_EXPIRESIN = 1000 * 60 * 60 * 24;

/**
 * 用户类型
 * 00系统用户,10自定义用户
 */
export const enum SYS_USER_TYPE {
  SYS = '00',
  CUSTOM = '10',
}
