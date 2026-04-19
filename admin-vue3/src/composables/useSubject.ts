import { ref, reactive } from 'vue'
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
    // 防止重复加载
    if (state.loading) {
      console.log('正在加载中，跳过')
      return
    }
    
    // 加载更多时，如果没有更多数据则跳过
    if (!state.hasMore && isLoadMore) {
      console.log('没有更多数据了，跳过')
      return
    }

    state.loading = true
    try {
      const res = await listSubject(query)
      const newList = res.data.list || []

      if (newList.length > 0) {
        console.log('获取到数据:', newList.length, '条')
      }

      if (isLoadMore) {
        state.list = [...state.list, ...newList]
      } else {
        state.list = newList
      }

      // 如果返回的数据少于 pageSize，说明没有更多数据了
      state.hasMore = newList.length >= query.pageSize
      console.log('hasMore:', state.hasMore, '当前页数量:', newList.length, 'pageSize:', query.pageSize)
    } catch (error) {
      console.error('获取专栏列表失败:', error)
    } finally {
      state.loading = false
      console.log('加载完成，loading设为false')
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
    // 滚动到底部50px时触发加载
    // 注意：只有当有更多数据且当前没有正在加载时才触发
    if (scrollTop + clientHeight >= scrollHeight - 50 && state.hasMore && !state.loading) {
      console.log('触发滚动加载，pageNum:', query.pageNum)
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
    // 响应式数据
    subjectListRef,
    query,
    state,

    // 方法
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

// 调试：确保返回的是响应式对象
if (typeof window !== 'undefined') {
  console.log('useSubject loaded')
}
