import type { FormInstance, FormRules } from 'element-plus'
import { getCurrentInstance, ref, reactive } from 'vue'

/**
 * 表单管理组合函数
 * 提供统一的表单重置、验证等常用功能
 */

/**
 * 重置表单字段和验证状态
 * @param formRef 表单 ref 对象或 ref 名称字符串
 * @example
 * // 方式1：传入 ref 对象
 * const formRef = ref<FormInstance>()
 * resetForm(formRef)
 * 
 * // 方式2：传入 ref 名称（兼容旧代码）
 * resetForm('formRef')
 */
export function resetForm(formRef: string | FormInstance | null | undefined) {
  if (!formRef) return
  
  if (typeof formRef === 'string') {
    // 如果传入的是字符串，尝试从当前组件实例获取
    const instance = getCurrentInstance()
    if (instance?.proxy?.$refs?.[formRef]) {
      const ref = (instance.proxy.$refs[formRef] as FormInstance)
      ref?.resetFields?.()
    }
  } else if (formRef && typeof formRef === 'object' && 'resetFields' in formRef) {
    // 如果传入的是 FormInstance 实例，直接调用
    formRef.resetFields()
  }
}

/**
 * 清除表单验证状态（不清空字段值）
 * @param formRef 表单 ref 对象
 * @example
 * clearValidate(formRef)
 */
export function clearValidate(formRef: FormInstance | null | undefined) {
  if (formRef && typeof formRef === 'object' && 'clearValidate' in formRef) {
    formRef.clearValidate()
  }
}

/**
 * 验证表单
 * @param formRef 表单 ref 对象
 * @returns Promise<boolean> 验证是否通过
 * @example
 * const valid = await validateForm(formRef)
 * if (valid) {
 *   // 提交表单
 * }
 */
export async function validateForm(formRef: FormInstance | null | undefined): Promise<boolean> {
  if (!formRef || typeof formRef !== 'object' || !('validate' in formRef)) {
    return false
  }
  
  try {
    await formRef.validate()
    return true
  } catch {
    return false
  }
}

/**
 * 验证指定字段
 * @param formRef 表单 ref 对象
 * @param props 要验证的字段名或字段名数组
 * @returns Promise<boolean> 验证是否通过
 * @example
 * await validateField(formRef, 'username')
 * await validateField(formRef, ['username', 'password'])
 */
export async function validateField(
  formRef: FormInstance | null | undefined,
  props: string | string[]
): Promise<boolean> {
  if (!formRef || typeof formRef !== 'object' || !('validateField' in formRef)) {
    return false
  }
  
  try {
    await formRef.validateField(props)
    return true
  } catch {
    return false
  }
}

/**
 * 创建表单管理器
 * @param options 配置选项
 * @returns 表单管理对象
 * @example
 * const { formRef, reset, validate, submit } = useForm({
 *   initialData: { name: '', age: 0 },
 *   rules: {
 *     name: [{ required: true, message: '请输入姓名' }]
 *   },
 *   onSubmit: async (data) => {
 *     await api.save(data)
 *   }
 * })
 */
export function useForm<T extends Record<string, any> = Record<string, any>>(options?: {
  /** 初始表单数据 */
  initialData?: T
  /** 表单验证规则 */
  rules?: FormRules
  /** 提交回调函数 */
  onSubmit?: (data: T) => Promise<void>
}) {
  const formRef = ref<FormInstance>()
  const formData = reactive<T>(options?.initialData || {} as T)
  const rules = options?.rules || {}
  
  /**
   * 重置表单
   */
  const reset = () => {
    // 重置数据到初始值
    if (options?.initialData) {
      Object.assign(formData, options.initialData)
    } else {
      // 如果没有初始数据，清空所有字段
      Object.keys(formData).forEach(key => {
        ;(formData as any)[key] = undefined
      })
    }
    // 重置表单验证状态
    resetForm(formRef.value)
  }
  
  /**
   * 验证表单
   */
  const validate = async (): Promise<boolean> => {
    return await validateForm(formRef.value)
  }
  
  /**
   * 提交表单
   */
  const submit = async (): Promise<boolean> => {
    const valid = await validate()
    if (!valid) return false
    
    if (options?.onSubmit) {
      try {
        await options.onSubmit(formData as T)
        return true
      } catch (error) {
        console.error('表单提交失败:', error)
        return false
      }
    }
    
    return true
  }
  
  return {
    formRef,
    formData,
    rules,
    reset,
    validate,
    submit
  }
}

/**
 * 通用表单工具函数集合
 * @example
 * const { resetForm, clearValidate, validateForm } = useCommonForm()
 */
export function useCommonForm() {
  return {
    resetForm,
    clearValidate,
    validateForm,
    validateField
  }
}
