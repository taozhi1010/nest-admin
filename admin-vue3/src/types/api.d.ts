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

/**
 * 文章数据类型
 */
export interface Article {
  id?: number | string
  articleId?: number | string
  title: string
  subjectId?: number | string
  desc?: string
  content?: string
  cover?: string
  author?: string
  source?: string // 文章来源：0-原创, 1-转载, 2-翻译
  publishTime?: string
  likeNum?: number
  readNum?: number
  commentNum?: number
  publishStatus?: string // 发布状态：0-草稿, 1-已发布
  auditStatus?: string // 审核状态：0-待审核, 1-已通过, 2-已拒绝
  scheduledPublishTime?: string
  sort?: number
  createTime?: string
  updateTime?: string
  userInfo?: {
    userName?: string
    nickName?: string
  }
}

/**
 * 文章查询参数
 */
export interface ArticleQueryParams extends PageQuery {
  title?: string
  subjectId?: number | string
  author?: string
  publishStatus?: string
  auditStatus?: string
  isAsc?: 'ascending' | 'descending'
  orderByColumn?: string
}

/**
 * 文章审核参数
 */
export interface AuditParams {
  id: number | string
  auditStatus: string // 1-通过, 2-拒绝
  auditRemark?: string
}
