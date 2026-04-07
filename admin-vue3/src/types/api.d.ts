/**
 * 通用 API 响应类型
 */
export interface ApiResponse<T = any> {
  code: number
  msg: string
  data: T
}

/**
 * 分页响应数据类型
 */
export interface PageResult<T = any> {
  list: T[]
  total: number
}

/**
 * 分页查询参数
 */
export interface PageQuery {
  pageNum?: number
  pageSize?: number
}

/**
 * 用户权限信息
 */
export interface UserAuthInfo {
  permissions: string[]  // 权限列表
  roles: string[]        // 角色列表
}

/**
 * 权限验证结果
 */
export interface AuthValidationResult {
  hasPermission: boolean  // 是否具有权限
  hasRole: boolean        // 是否具有角色
}
