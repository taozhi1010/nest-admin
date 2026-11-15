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
 * 注册邮箱验证码有效期（毫秒）
 */
export const EMAIL_CODE_EXPIRESIN = 1000 * 60 * 5;

/**
 * 邮箱验证码发送冷却
 * 同一邮箱两次发码最小间隔
 */
export const EMAIL_SEND_COOLDOWN = 1000 * 60;

/**
 * 邮箱验证码发送邮箱频率限制
 * 同一邮箱每小时最多发码次数（防止单个邮箱被轰炸触发邮件服务商拦截）
 */
export const EMAIL_SEND_HOURLY_LIMIT = 10;
export const EMAIL_SEND_HOURLY_EXPIRESIN = 1000 * 60 * 60;

/**
 * 邮箱验证码发送 IP 频率限制
 * 同一 IP 每小时最多发码次数
 */
export const EMAIL_SEND_IP_LIMIT = 10;
export const EMAIL_SEND_IP_EXPIRESIN = 1000 * 60 * 60;

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
