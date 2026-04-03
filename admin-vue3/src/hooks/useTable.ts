import { reactive, Ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import type { ApiResponse, PageQuery, PageResult } from '@/types/api'

// 后续参考一下这个
// https://www.buerblog.cn/docs/study/web/use-table

/**
 * 分页信息接口
 */
interface PageInfo extends PageQuery {
  total: number
}

/**
 * API 参数接口
 * @param get 获取列表数据
 * @param export 导出接口
 */
interface ApiParams {
  get: (params: PageQuery) => Promise<ApiResponse<PageResult>>
  export?: (params: PageQuery) => Promise<Blob>
}

/**
 * 表格状态接口
 */
interface TableState {
  page: PageInfo
  loading: boolean
  list: any[]
}

/**
 * @description table 操作方法封装
 * @param api 表格列表数据接口
 * @param searchParam 表格查询参数（响应式对象）
 * @param formRef 表单 ref，用于处理清空 form 的校验结果等操作
 * @param options 配置选项
 */
const useTable = (
  api: ApiParams,
  searchParam: Ref<Record<string, any>>,
  formRef: Ref<FormInstance | null>,
  options?: {
    immediate?: boolean // 是否立即请求，默认 true
  }
) => {
  const state = reactive<TableState>({
    loading: false,
    list: [],
    page: {
      pageNum: 1,
      pageSize: 20,
      total: 0
    }
  })

  // 获取表格列表数据
  const request = async () => {
    const params = {
      pageNum: state.page.pageNum,
      pageSize: state.page.pageSize,
      ...searchParam.value
    }

    state.loading = true
    try {
      const { code, data } = await api.get(params)
      if (code === 200) {
        // 直接赋值，保持响应式
        state.list = data.list || []
        state.page.total = data.total || 0
      } else {
        ElMessage.error('加载失败')
      }
    } catch (error) {
      console.error('列表加载失败:', error)
      ElMessage.error('加载失败')
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
    formRef.value?.resetFields()
    request()
  }

  // 导出 Excel
  const onExport = async (fileName?: string) => {
    if (!api.export) {
      ElMessage.warning('未提供导出接口')
      return
    }

    state.loading = true
    try {
      const params = {
        pageNum: state.page.pageNum,
        pageSize: state.page.pageSize,
        ...searchParam.value
      }
      const blob = await api.export(params)

      // 使用 download 工具下载
      const { download } = await import('@/utils/request')
      download(blob, fileName || `export_${Date.now()}.xlsx`)
      ElMessage.success('导出成功')
    } catch (error) {
      console.error('导出失败:', error)
      ElMessage.error('导出失败')
    } finally {
      state.loading = false
    }
  }

  // 刷新
  const onRefresh = () => {
    request()
  }

  // 初始化请求数据
  if (options?.immediate !== false) {
    request()
  }

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
