import { nextTick, reactive, Ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import type { ApiResponse } from '@/types/api'

/**
 * 表单状态接口
 */
interface FormState<T = any> {
  loading: boolean
  open: boolean
  title: string
  form: T
}

/**
 * API 参数接口
 * @param get 获取单条数据
 * @param add 新增数据
 * @param delete 删除数据
 * @param update 修改数据
 */
interface ApiParams<T = any, R = any> {
  get?: (id: number | string) => Promise<ApiResponse<R>>
  add?: (params: T) => Promise<ApiResponse<R>>
  delete?: (id: number | string | number[]) => Promise<ApiResponse<R>>
  update?: (params: T) => Promise<ApiResponse<R>>
}

/**
 * 针对弹窗表单进行封装的 hooks，附带了表单弹窗的打开和修改
 * @param api 请求的 api，将新增修改删除传入
 * @param formRef 表单的 ref
 * @param key 表单的 key，id 关键字，用来获取、修改表单数据
 * @param initialData 表单初始值（可选）
 */
const useForm = <T = any, R = any>(
  api: ApiParams<T, R>,
  formRef: Ref<FormInstance | null>,
  key: string,
  initialData?: Partial<T>
) => {
  const state = reactive<FormState>({
    loading: false, // 表单加载状态
    open: false, // 弹窗是否打开
    title: '', // 弹窗标题
    form: { ...(initialData || {}) } // 表单数据，支持初始值
  })

  // 重置表单
  const resetForm = () => {
    formRef.value?.resetFields()
    if (initialData) {
      Object.assign(state.form, initialData)
    } else {
      state.form = {}
    }
  }

  // 关闭弹窗
  const onCancel = () => {
    resetForm()
    state.open = false
  }

  // 删除单行或多行数据
  const onRowDelete = async (ids: number | string | number[]) => {
    if (!api.delete) {
      ElMessage.warning('未提供删除接口')
      return
    }
    
    state.loading = true
    try {
      await api.delete(ids)
      ElMessage.success('删除成功')
    } catch (error) {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    } finally {
      state.loading = false
    }
  }

  // 打开表单，新增或修改表单
  const onOpenForm = async (row?: any) => {
    state.loading = true
    state.open = true
    
    // 判断是修改还是添加操作
    if (row && row[key]) {
      try {
        const formId = row[key]
        state.title = '修改'
        if (api.get) {
          const { data } = await api.get(formId)
          state.form = data
        }
      } catch (error) {
        console.error('获取表单详情失败:', error)
        ElMessage.error('获取数据失败')
      } finally {
        state.loading = false
      }
    } else {
      state.title = '新增'
      state.form = {}
      nextTick(() => {
        resetForm()
        state.loading = false
      })
    }
  }

  // 提交表单，新增或修改表单数据
  const onSubmit = async () => {
    const form = state.form
    const formId = form?.[key]

    state.loading = true

    try {
      const operate = formId ? '修改' : '新增'
      if (formId) {
        if (!api.update) throw new Error('未提供更新接口')
        await api.update(form)
      } else {
        if (!api.add) throw new Error('未提供新增接口')
        await api.add(form)
      }
      ElMessage.success(`${operate}成功`)
      state.open = false
    } catch (error) {
      console.error('操作失败:', error)
      ElMessage.error('操作失败')
    } finally {
      state.loading = false
    }
  }

  return {
    state,
    resetForm,
    onCancel,
    onOpenForm,
    onSubmit,
    onRowDelete
  }
}

export default useForm
