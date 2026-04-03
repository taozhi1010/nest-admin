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
