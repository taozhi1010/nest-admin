/**
 * 文章列表页面 - 使用 useArticle 组合函数的示例
 * 
 * 这个文件展示了如何将原有的文章列表页面重构为使用 useArticle 组合函数
 * 主要改进：
 * 1. 语义化方法名，更易理解
 * 2. 统一的错误处理
 * 3. 更好的类型安全
 * 4. 便于在 Nuxt 中复用
 */

import { useArticle } from '@/composables/post/useArticle'
import { useSubject } from '@/composables/post/useSubject'
import { useDict as useDictUtils } from '@/composables/useDict'
import type { Article } from '@/types/api'

export function useArticleList() {
  const router = useRouter()
  const articleManager = useArticle()
  const subject = useSubject()
  
  // 使用原始工具获取字典数据（ref）
  const dictData = useDictUtils(
    'post_article_publish_status', 
    'post_article_audit_status', 
    'post_article_source'
  )
  
  // 使用组合函数获取辅助方法
  const dictHelper = useDict(
    'post_article_publish_status', 
    'post_article_audit_status', 
    'post_article_source'
  )
  
  const { 
    getDictLabel, 
    getDictTagType 
  } = dictHelper
  
  // 字典数据（ref）
  const post_article_publish_status = dictData.post_article_publish_status
  const post_article_audit_status = dictData.post_article_audit_status
  const post_article_source = dictData.post_article_source

  // ==================== 响应式状态 ====================
  
  const loading = ref(false)
  const showSearch = ref(true)
  
  // 查询参数
  const query = reactive({
    pageNum: 1,
    pageSize: 10,
    title: undefined as string | undefined,
    subjectId: undefined as number | string | undefined,
    author: undefined as string | undefined,
    publishStatus: undefined as string | undefined,
    auditStatus: undefined as string | undefined,
    isAsc: 'descending' as const,
    orderByColumn: 'createTime'
  })
  
  // 文章列表数据
  const list = ref<Article[]>([])
  const total = ref(0)
  
  // 选择相关
  const ids = ref<(number | string)[]>([])
  const single = ref(true)
  const multiple = ref(true)

  // ==================== 核心方法 ====================

  /**
   * 加载文章列表
   */
  const loadList = async () => {
    loading.value = true
    try {
      const { list: articles, total: totalCount } = await articleManager.loadList(query)
      
      // 格式化时间字段
      list.value = articles.map(item => ({
        ...item,
        updateTime: item.updateTime ? dayjs(item.updateTime).format('YYYY-MM-DD HH:mm:ss') : undefined,
        createTime: item.createTime ? dayjs(item.createTime).format('YYYY-MM-DD HH:mm:ss') : undefined,
        publishTime: item.publishTime ? dayjs(item.publishTime).format('YYYY-MM-DD HH:mm:ss') : undefined,
        scheduledPublishTime: item.scheduledPublishTime ? dayjs(item.scheduledPublishTime).format('YYYY-MM-DD HH:mm:ss') : undefined
      }))
      
      total.value = totalCount
    } catch (error) {
      console.error('加载文章列表失败:', error)
      ElMessage.error('加载文章列表失败')
    } finally {
      loading.value = false
    }
  }

  /**
   * 处理表格选择变化
   */
  const handleSelectionChange = (selection: Article[]) => {
    ids.value = selection.map(item => item.id || item.articleId) as (number | string)[]
    single.value = selection.length !== 1
    multiple.value = selection.length === 0
  }

  /**
   * 删除文章
   */
  const handleDelete = async (row?: Article) => {
    const deleteIds = row?.id || row?.articleId || ids.value
    
    if (!deleteIds || (Array.isArray(deleteIds) && deleteIds.length === 0)) {
      ElMessage.warning('请选择要删除的文章')
      return
    }

    const titles = row?.title ? `"${row.title}"` : `选中的 ${ids.value.length} 篇文章`
    
    try {
      await ElMessageBox.confirm(`是否确认删除文章${titles}？`, '系统提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      
      await articleManager.deleteArticle(deleteIds)
      ElMessage.success('删除成功')
      
      // 刷新列表
      await loadList()
    } catch (error) {
      if (error !== 'cancel') {
        console.error('删除文章失败:', error)
        ElMessage.error('删除失败')
      }
    }
  }

  /**
   * 搜索
   */
  const handleQuery = () => {
    query.pageNum = 1
    loadList()
  }

  /**
   * 搜索框失焦处理（去除空格）
   */
  const handleQueryBlur = () => {
    if (query.title) query.title = query.title.trim()
    if (query.author) query.author = query.author.trim()
  }

  /**
   * 重置查询条件
   */
  const handleReset = (formRef: any) => {
    resetForm(formRef)
    handleQuery()
  }

  /**
   * 获取文章详情并打开编辑表单
   */
  const handleUpdate = async (row: Article) => {
    const articleId = row.id || row.articleId
    
    if (!articleId) {
      ElMessage.warning('文章ID不存在')
      return
    }

    try {
      const detail = await articleManager.getDetail(articleId)
      // 返回详情数据，由父组件处理表单显示
      return detail
    } catch (error) {
      console.error('获取文章详情失败:', error)
      ElMessage.error('获取文章详情失败')
      throw error
    }
  }

  /**
   * 预览文章
   */
  const handlePreview = (row: Article) => {
    // 这里可以调用预览组件的方法
    // previewRef.value?.handleOpen(row)
    console.log('预览文章:', row)
  }

  /**
   * 打开编辑器（新窗口）
   */
  const handleOpenEditor = (row: Article) => {
    const articleId = row.id || row.articleId
    
    if (!articleId) {
      ElMessage.warning('文章ID不存在')
      return
    }

    const routeUrl = router.resolve({
      path: '/post/article-editor',
      query: { id: articleId }
    })
    window.open(routeUrl.href, '_blank')
  }

  /**
   * 新建文章（打开编辑器）
   */
  const handleNewEditor = () => {
    const routeUrl = router.resolve({
      path: '/post/article-editor'
    })
    window.open(routeUrl.href, '_blank')
  }

  /**
   * 获取来源标签类型
   */
  const getSourceTagType = (source?: string) => {
    const typeMap: Record<string, string> = {
      '0': '', // 原创
      '1': 'success', // 转载
      '2': 'warning' // 翻译
    }
    return typeMap[source || ''] || ''
  }

  // ==================== 返回 ====================
  
  return {
    // 状态
    loading,
    showSearch,
    query,
    list,
    total,
    ids,
    single,
    multiple,
    
    // 字典（使用原始字典数据 ref）
    post_article_publish_status,
    post_article_audit_status,
    post_article_source,
    getDictLabel,
    getDictTagType,
    
    // 方法
    loadList,
    handleSelectionChange,
    handleDelete,
    handleQuery,
    handleQueryBlur,
    handleReset,
    handleUpdate,
    handlePreview,
    handleOpenEditor,
    handleNewEditor,
    getSourceTagType,
    
    // 专栏管理
    subject
  }
}
