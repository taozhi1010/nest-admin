import { reactive } from 'vue'

// 后续参考一下这个
// https://www.buerblog.cn/docs/study/web/use-table

/**
 * 定义pageInfo
 */
interface page {
  pageNum: number
  pageSize: number
  total: number
}

/**
 * api参数
 * @param get 获取列表数据
 * @param export 导出接口
 */
interface apiParams {
  get: (id: number | string) => Promise<any>
  export?: (id: number | string) => Promise<any>
}

/**
 * 定义数据
 */
interface TableState {
  page: page
  loading: boolean
  list: any[]
}

/**
 * @description table操作方法封装
 * @param {Function} api 表格列表数据接口
 * @param {Object} searchParam 表格查询参数
 * @param {Object} formRef 表单ref,用于处理清空form的校验结果等操作
 */

const useTable = (api: apiParams, searchParam, formRef: any) => {
  const state = reactive<TableState>({
    loading: false,
    list: [],
    page: {
      pageNum: 1,
      pageSize: 20,
      total: 1
    }
  })

  // 获取表格列表数据
  const request = async () => {
    const params = {
      pageNum: state.page.pageNum,
      pageSize: state.page.pageSize,
      ...searchParam
    }

    state.loading = true
    try {
      const { code, data } = await api.get(params)
      if (code === 200) {
        // todo：因为reative的问题，直接清空和赋值无效，只能用push方法，希望能有更优雅的方法
        state.list.length = 0
        state.list.push(...data.list)
        state.page.total = data.total
      }
    } catch (e) {
      console.log('list error：', e)
    } finally {
      state.loading = false
    }
  }

  // 分页页码切换
  const onPageChange = (page: number) => {
    state.page.pageNum = page
    request()
  }

  // 分页大小切换
  const onSizeChange = (size: number) => {
    state.page.pageSize = size
    request()
  }

  // 搜索
  const onSearch = () => {
    state.page.pageNum = 1
    request()
  }

  // 重置搜索
  const onReset = () => {
    state.page.pageNum = 1
    formRef.value.resetFields()
    request()
  }

  // 导出Excel
  const onExport = () => {
    const params = {
      pageNum: state.page.pageNum,
      pageSize: state.page.pageSize,
      ...searchParam
    }
    api.export(params)
  }

  // 刷新
  const onRefresh = () => {
    request()
  }

  // 初始化请求数据
  request()

  // 返回相关变量与方法
  return {
    state,
    request,
    onSizeChange,
    onPageChange,
    onSearch,
    onReset,
    onRefresh
  }
}

export default useTable
