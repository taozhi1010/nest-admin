import { listSubject, delSubject } from '@/api/post/subject'
import { ElMessage, ElMessageBox } from 'element-plus'

/**
 * 专栏管理 Composable
 * @returns 专栏相关的数据和方法
 */
export function useSubject() {
  // ==================== 响应式数据 ====================
  const subjectListRef = ref(null)

  const query = reactive({
    pageNum: 1,
    pageSize: 20,
    title: ''
  })

  const state = reactive({
    loading: false,
    list: [],
    selectNode: {
      id: 0,
      title: '全部专栏'
    },
    selection: [],
    hasMore: true
  })

  // ==================== 核心方法 ====================

  /**
   * 获取专栏列表
   * @param isLoadMore 是否为加载更多
   */
  const getList = async (isLoadMore = false) => {
    if (state.loading || (!state.hasMore && isLoadMore)) return

    state.loading = true
    try {
      const res = await listSubject(query)
      const newList = res.data.list || []

      if (isLoadMore) {
        state.list = [...state.list, ...newList]
      } else {
        state.list = newList
      }

      // 如果返回的数据少于 pageSize，说明没有更多数据了
      state.hasMore = newList.length >= query.pageSize
    } catch (error) {
      console.error('获取专栏列表失败:', error)
    } finally {
      state.loading = false
    }
  }

  /**
   * 搜索专栏
   */
  const handleSearch = () => {
    query.pageNum = 1
    getList()
  }

  /**
   * 搜索框失焦处理
   */
  const handleSearchBlur = () => {
    query.title = query.title.trim()
  }

  /**
   * 删除专栏
   * @param row 专栏行数据
   */
  const handleDelete = (row) => {
    const subjectIds = row.id || state.selection.map((item) => item.id).join(',')

    ElMessageBox.confirm(`是否确认删除专栏编号为"${subjectIds}"的数据项?`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(async () => {
        state.loading = true
        try {
          await delSubject(subjectIds)
          ElMessage.success('删除成功')
          query.pageNum = 1
          await getList()
        } catch (error) {
          console.error('删除专栏失败:', error)
        } finally {
          state.loading = false
        }
      })
      .catch(() => {})
  }

  /**
   * 点击专栏行
   * @param row 专栏行数据
   * @param onSubjectChange 专栏切换回调函数
   */
  const handleRowClick = (row, onSubjectChange) => {
    state.selectNode = row
    if (row.id !== 0 && onSubjectChange) {
      onSubjectChange(row.id)
    }
  }

  /**
   * 选择变化
   * @param selection 选中的专栏列表
   */
  const handleSelectionChange = (selection) => {
    state.selection = selection
  }

  /**
   * 滚动加载
   * @param scrollTop 滚动条顶部距离
   * @param scrollHeight 滚动条总高度
   * @param clientHeight 可视区域高度
   */
  const handleScroll = ({ scrollTop, scrollHeight, clientHeight }) => {
    if (scrollTop + clientHeight >= scrollHeight - 50 && state.hasMore && !state.loading) {
      query.pageNum++
      getList(true)
    }
  }

  /**
   * 重置查询条件
   */
  const resetQuery = () => {
    query.pageNum = 1
    query.title = ''
    getList()
  }

  // ==================== 返回 ====================
  return {
    subjectListRef,
    query,
    state,
    getList,
    handleSearch,
    handleSearchBlur,
    handleDelete,
    handleRowClick,
    handleSelectionChange,
    handleScroll,
    resetQuery
  }
}
