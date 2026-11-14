import type { Ref } from 'vue'
import type { FormInstance } from 'element-plus'
import { resetForm } from './useForm'

/**
 * 通用 CRUD 列表页状态机
 *
 * 收敛列表管理页逐字重复的样板：查询参数/分页/加载态/多选 + 编辑对话框（open/title/form）
 * 与 getList/handleQuery/resetQuery/handleSelectionChange/handleAdd/handleUpdate/
 * handleDelete/submitForm/cancel/reset 这一整套方法。
 *
 * 页面特有逻辑通过包装 api 函数注入（如包装 get 取附加数据、包装 update 提交前挂
 * 额外字段、包装 list 注入 addDateRange），页面自身只保留 rules、handleExport 与
 * 完全独立的交互逻辑。
 *
 * @example
 * const postRef = ref(null)
 * const queryRef = ref(null)
 *
 * const post = useCrud({
 *   api: { list: listPost, get: getPost, add: addPost, update: updatePost, del: delPost },
 *   idKey: 'postId',
 *   name: '岗位',
 *   query: { postCode: undefined, postName: undefined, status: undefined },
 *   form: { postId: undefined, postCode: undefined, postName: undefined, postSort: 0, status: '0' },
 *   queryRef,
 *   formRef: postRef
 * })
 * post.getList()
 *
 * 模板直接使用返回对象：post.list / post.queryParams / post.handleQuery ...
 */

export interface CrudApi {
  /** 分页查询，返回 { data: { list, total } } 信封 */
  list?: (params: any) => Promise<any>
  /** 详情查询，返回 { data } 信封 */
  get?: (id: any) => Promise<any>
  /** 新增 */
  add?: (data: any) => Promise<any>
  /** 修改 */
  update?: (data: any) => Promise<any>
  /** 删除，入参为单个 id 或 id 数组 */
  del?: (id: any) => Promise<any>
}

export interface CrudOptions {
  api: CrudApi
  /** 主键字段名，如 'postId'；单行操作按 row[idKey] || ids 回退 */
  idKey: string
  /** 实体中文名，用于对话框标题（添加/修改xx）与删除确认文案 */
  name: string
  /** 页面查询字段初始值（不含 pageNum/pageSize），重置基准 */
  query?: Record<string, any>
  /** 表单字段初始值，reset 基准（字段应为原始值，浅拷贝即可） */
  form?: Record<string, any>
  /** 搜索表单 el-form ref，resetQuery 时 resetFields */
  queryRef?: Ref<FormInstance>
  /** 编辑表单 el-form ref，reset/submitForm 用 */
  formRef?: Ref<FormInstance>
  /** 每页条数，默认 10；无真实分页的页面可传大值 */
  pageSize?: number
}

export function useCrud(options: CrudOptions) {
  const { api, idKey, name } = options
  const initialQuery = { ...options.query }
  const initialForm = { ...options.form }

  // ==================== 列表状态 ====================

  const loading = ref(false)
  const showSearch = ref(true)
  const list = ref<any[]>([])
  const total = ref(0)
  const queryParams = reactive({
    pageNum: 1,
    pageSize: options.pageSize ?? 10,
    ...initialQuery
  })
  const ids = ref<(number | string)[]>([])
  const single = ref(true) // 工具栏"修改"按钮：仅选中一条时可用
  const multiple = ref(true) // 工具栏"删除"按钮：选中任意一条时可用

  // ==================== 编辑对话框状态 ====================

  const open = ref(false)
  const title = ref('')
  const formLoading = ref(false)
  const form = ref<Record<string, any>>({ ...initialForm })

  // ==================== 方法 ====================

  /** 加载列表 */
  const getList = async () => {
    if (!api.list) return
    loading.value = true
    try {
      const response = await api.list(queryParams)
      list.value = response.data.list
      total.value = response.data.total
    } finally {
      loading.value = false
    }
  }

  /** 搜索按钮操作：回到第 1 页后加载 */
  const handleQuery = () => {
    queryParams.pageNum = 1
    getList()
  }

  /** 重置按钮操作：重置搜索表单与查询参数后重新搜索 */
  const resetQuery = () => {
    if (options.queryRef) resetForm(options.queryRef.value)
    Object.assign(queryParams, initialQuery)
    handleQuery()
  }

  /** 多选框选中数据 */
  const handleSelectionChange = (selection: any[]) => {
    ids.value = selection.map((item) => item[idKey])
    single.value = selection.length !== 1
    multiple.value = !selection.length
  }

  /** 表单重置：恢复初始表单值并清空校验状态 */
  const reset = () => {
    // 深拷贝初始值，避免数组/对象字段跨 reset 共享引用
    form.value = options.form ? structuredClone(options.form) : {}
    if (options.formRef) resetForm(options.formRef.value)
  }

  /** 取消按钮：关闭对话框并重置表单 */
  const cancel = () => {
    open.value = false
    reset()
  }

  /** 新增按钮操作 */
  const handleAdd = () => {
    reset()
    open.value = true
    title.value = `添加${name}`
  }

  /** 修改按钮操作：取详情回填表单 */
  const handleUpdate = async (row?: any) => {
    reset()
    const id = row?.[idKey] || ids.value
    formLoading.value = true
    try {
      const response = await api.get!(id)
      form.value = response.data
      open.value = true
      title.value = `修改${name}`
    } catch (e) {
      console.error(`获取${name}信息失败:`, e)
    } finally {
      formLoading.value = false
    }
  }

  /** 提交按钮：按主键有无分支新增/修改 */
  const submitForm = () => {
    const doSubmit = async () => {
      formLoading.value = true
      try {
        if (form.value[idKey] !== undefined) {
          await api.update!(form.value)
          ElMessage.success('修改成功')
        } else {
          await api.add!(form.value)
          ElMessage.success('新增成功')
        }
        open.value = false
        getList()
      } catch (e) {
        console.error('提交失败:', e)
      } finally {
        formLoading.value = false
      }
    }

    if (options.formRef?.value) {
      options.formRef.value.validate(async (valid) => {
        if (!valid) return
        await doSubmit()
      })
    } else {
      doSubmit()
    }
  }

  /** 删除按钮操作：单行删除按 row[idKey]，批量删除按选中 ids */
  const handleDelete = async (row?: any) => {
    const deleteIds = row?.[idKey] || ids.value
    try {
      await ElMessageBox.confirm(`是否确认删除${name}编号为"${deleteIds}"的数据项？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await api.del!(deleteIds)
      ElMessage.success('删除成功')
      getList()
    } catch (e) {
      if (e !== 'cancel') {
        console.error('删除失败:', e)
      }
    }
  }

  // ==================== 返回 ====================

  return reactive({
    // 列表状态
    loading,
    showSearch,
    list,
    total,
    queryParams,
    ids,
    single,
    multiple,

    // 对话框状态
    open,
    title,
    formLoading,
    form,

    // 方法
    getList,
    handleQuery,
    resetQuery,
    handleSelectionChange,
    handleAdd,
    handleUpdate,
    handleDelete,
    submitForm,
    cancel,
    reset
  })
}
