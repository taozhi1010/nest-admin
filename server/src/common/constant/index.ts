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

/**
 * 单文件大小上限（MB）
 * 与 yml app.file.maxSize 保持一致；Multer limits 与服务层大小校验同源使用
 */
export const UPLOAD_MAX_SIZE_MB = 10;
export const UPLOAD_MAX_SIZE_BYTES = UPLOAD_MAX_SIZE_MB * 1024 * 1024;

/**
 * 上传扩展名默认白名单（可用 yml app.file.allowedExts 覆盖，逗号分隔）
 * .svg/.html 等可内联执行的类型刻意排除，防止经静态服务造成存储型 XSS
 */
export const UPLOAD_DEFAULT_ALLOWED_EXTS = [
  // 图片
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.ico',
  // 文档
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.md', '.csv',
  // 压缩包
  '.zip', '.rar', '.7z', '.tar', '.gz',
  // 媒体
  '.mp3', '.mp4', '.wav', '.mov', '.avi', '.webm', '.flv',
];

/**
 * 允许内联展示（不加 Content-Disposition: attachment）的静态文件扩展名
 * 仅限位图类图片；.svg 刻意排除（内联渲染有 XSS 风险）
 */
export const INLINE_IMAGE_EXT_PATTERN = /\.(png|jpe?g|gif|webp|bmp|ico)$/i;
