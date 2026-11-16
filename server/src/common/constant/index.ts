/**
 * 登录用户 redis key 过期时间
 * 24h
 */
export const LOGIN_TOKEN_EXPIRESIN = 1000 * 60 * 60 * 24;

/**
 * 注册 IP 频率限制
 * 同一 IP 每小时最多注册次数
 */
export const REGISTER_IP_LIMIT = 10;
export const REGISTER_RATE_EXPIRESIN = 1000 * 60 * 60;

/**
 * 用户类型
 * 00系统用户,10自定义用户
 *
 * 20 客户端用户
 */
export const enum SYS_USER_TYPE {
  SYS = '00',
  CUSTOM = '10',
  CLIENT = '20',
}
