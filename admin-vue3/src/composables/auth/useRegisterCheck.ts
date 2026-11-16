import { createAccountExistsValidator } from '@/composables/auth/useAccountCheck'
import { registerPasswordRules, createConfirmPasswordValidator } from '@/composables/auth/usePasswordCheck'

/** 注册表单模型（与 register.vue 的 reactive 表单结构匹配） */
export interface RegisterFormModel {
  username: string
  password: string
  confirmPassword: string
  code: string
  uuid: string
}

/**
 * 组装注册表单的全部校验规则
 * 注册侧校验统一在此维护：账号占用（useAccountCheck）+ 密码强度/一致性（usePasswordCheck）+ 验证码
 */
export function createRegisterRules(form: RegisterFormModel) {
  return {
    username: [
      { required: true, trigger: 'blur', message: '请输入您的账号' },
      { min: 2, max: 50, trigger: 'blur', message: '账号长度必须为 2 到 50 个字符' },
      createAccountExistsValidator()
    ],
    password: registerPasswordRules,
    confirmPassword: [
      { required: true, trigger: 'blur', message: '请再次输入您的密码' },
      createConfirmPasswordValidator(form)
    ],
    code: [{ required: true, trigger: 'blur', message: '请输入验证码' }]
  }
}

export { computePasswordStrength } from '@/composables/auth/usePasswordCheck'
export type { PasswordStrength } from '@/composables/auth/usePasswordCheck'
