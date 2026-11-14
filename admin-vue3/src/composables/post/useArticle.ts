/**
 * 文章模块 Composable
 * 
 * 提供文章相关的核心功能：
 * - 文章列表查询与管理
 * - 文章详情获取
 * - 文章创建、更新、删除
 * - 文章审核与发布流程
 * 
 * @example
 * ```ts
 * const articleManager = useArticle()
 * await articleManager.loadList({ pageNum: 1, pageSize: 10 })
 * await articleManager.createArticle(articleData)
 * ```
 */

import {
  listArticle,
  getArticle,
  addArticle,
  updateArticle,
  delArticle,
  submitAudit,
  auditArticle,
  publishArticle
} from '@/api/post/article'
import type { Article, ArticleQueryParams, AuditParams } from '@/types/api'

// ==================== 类型定义 ====================

/**
 * 文章管理器返回值接口
 */
export interface UseArticleReturn {
  /** 加载文章列表 */
  loadList: (params: ArticleQueryParams) => Promise<{ list: Article[]; total: number }>
  
  /** 获取文章详情 */
  getDetail: (id: number | string) => Promise<Article>
  
  /** 保存文章（智能判断新增或更新） */
  saveArticle: (data: Partial<Article>) => Promise<Article>
  
  /** 删除文章 */
  deleteArticle: (id: number | string | (number | string)[]) => Promise<void>
  
  /** 提交审核 */
  submitForAudit: (id: number | string) => Promise<void>
  
  /** 审核文章 */
  performAudit: (params: AuditParams) => Promise<void>
  
  /** 发布文章 */
  publishArticle: (id: number | string) => Promise<void>
}

// ==================== 核心实现 ====================

/**
 * 文章管理 Composable
 * 
 * 封装所有文章相关的 API 调用和业务逻辑
 * 设计原则：
 * 1. 语义化方法名，清晰表达意图
 * 2. 统一的错误处理
 * 3. 返回 Promise，支持 async/await
 * 4. 不依赖组件生命周期，可在任何地方使用
 * 
 * @returns 文章管理方法集合
 */
export function useArticle(): UseArticleReturn {
  
  /**
   * 加载文章列表
   * @param params 查询参数（包含分页、筛选条件等）
   * @returns 文章列表和总数
   * 
   * @example
   * ```ts
   * const { list, total } = await loadList({
   *   pageNum: 1,
   *   pageSize: 10,
   *   subjectId: 123,
   *   publishStatus: '1'
   * })
   * ```
   */
  const loadList = async (params: ArticleQueryParams): Promise<{ list: Article[]; total: number }> => {
    try {
      const res = await listArticle(params)
      return {
        list: res.data.list || [],
        total: res.data.total || 0
      }
    } catch (error) {
      console.error('加载文章列表失败:', error)
      throw error
    }
  }

  /**
   * 获取文章详情
   * @param id 文章 ID
   * @returns 文章完整信息
   * 
   * @example
   * ```ts
   * const article = await getDetail(123)
   * console.log(article.title)
   * ```
   */
  const getDetail = async (id: number | string): Promise<Article> => {
    try {
      const res = await getArticle(id)
      return res.data
    } catch (error) {
      console.error(`获取文章详情失败 (ID: ${id}):`, error)
      throw error
    }
  }

  /**
   * 保存文章（智能判断新增或更新）
   * 
   * 这是一个统一的方法，会根据数据中是否包含 ID 自动选择操作：
   * - 如果数据中有 id 或 articleId → 执行更新操作
   * - 如果数据中没有 ID → 执行创建操作
   * 
   * 这样在页面中就不需要写 if-else 判断了，直接调用这个方法即可。
   * 
   * @param data 文章数据（Partial<Article>）
   * @returns Promise<Article> 保存后的完整文章信息
   *          - 新建时：返回包含新生成 ID 的文章数据
   *          - 更新时：返回更新后的文章数据
   * 
   * @example
   * ```ts
   * // 场景1：创建新文章（不提供 ID）
   * const newArticle = await saveArticle({
   *   title: '我的第一篇文章',
   *   content: '# Hello World',
   *   subjectId: 1
   * })
   * console.log('新文章ID:', newArticle.id)
   * 
   * // 场景2：更新已有文章（提供 ID）
   * await saveArticle({
   *   id: 123,
   *   title: '修改后的标题',
   *   content: '更新的内容'
   * })
   * 
   * // 场景3：在表单中使用（无需判断）
   * const result = await saveArticle(formData)
   * if (!formData.id && result.id) {
   *   formData.id = result.id  // 新建后更新本地ID
   * }
   * ```
   */
  const saveArticle = async (data: Partial<Article>): Promise<Article> => {
    // 判断是新增还是更新
    const hasId = !!(data.id || data.articleId)
    
    try {
      if (hasId) {
        // 更新模式
        const res = await updateArticle(data)
        return res.data
      } else {
        // 创建模式
        const res = await addArticle(data)
        return res.data
      }
    } catch (error) {
      const action = hasId ? '更新' : '创建'
      console.error(`${action}文章失败:`, error)
      throw error
    }
  }

  /**
   * 删除文章
   * @param id 文章 ID 或 ID 数组（支持批量删除）
   * @returns void
   * 
   * @example
   * ```ts
   * // 删除单个文章
   * await deleteArticle(123)
   * 
   * // 批量删除
   * await deleteArticle([123, 456, 789])
   * ```
   */
  const deleteArticle = async (id: number | string | (number | string)[]): Promise<void> => {
    try {
      // 如果是数组，转换为逗号分隔的字符串
      const ids = Array.isArray(id) ? id.join(',') : id
      await delArticle(ids)
    } catch (error) {
      console.error(`删除文章失败 (IDs: ${id}):`, error)
      throw error
    }
  }

  /**
   * 提交文章审核
   * @param id 文章 ID
   * @returns void
   * 
   * @example
   * ```ts
   * await submitForAudit(123)
   * ```
   */
  const submitForAudit = async (id: number | string): Promise<void> => {
    try {
      await submitAudit(id)
    } catch (error) {
      console.error(`提交审核失败 (ID: ${id}):`, error)
      throw error
    }
  }

  /**
   * 审核文章（管理员操作）
   * @param params 审核参数（包含文章 ID、审核状态、审核意见等）
   * @returns void
   * 
   * @example
   * ```ts
   * await performAudit({
   *   id: 123,
   *   auditStatus: '1', // 1-通过, 2-拒绝
   *   auditRemark: '内容质量优秀'
   * })
   * ```
   */
  const performAudit = async (params: AuditParams): Promise<void> => {
    try {
      await auditArticle(params)
    } catch (error) {
      console.error(`审核文章失败 (ID: ${params.id}):`, error)
      throw error
    }
  }

  /**
   * 发布文章
   * @param id 文章 ID
   * @returns void
   * 
   * @example
   * ```ts
   * await publishArticle(123)
   * ```
   */
  const publishArticleAction = async (id: number | string): Promise<void> => {
    try {
      await publishArticle(id)
    } catch (error) {
      console.error(`发布文章失败 (ID: ${id}):`, error)
      throw error
    }
  }

  return {
    loadList,
    getDetail,
    saveArticle,  // 统一的保存方法（自动判断新增/更新）
    deleteArticle,
    submitForAudit,
    performAudit,
    publishArticle: publishArticleAction
  }
}
