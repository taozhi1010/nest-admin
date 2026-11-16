/**
 * 密码校验：注册专用的强度规则与强度计算
 * 强度校验纯前端执行；后端 DTO 仅约束长度（5-20），与登录复用
 */

/** 强度等级：0=未输入 1=弱 2=中 3=强 */
export type PasswordStrength = 0 | 1 | 2 | 3

/** 注册密码规则：必填 + 长度（与后端 DTO 对齐）+ 必须同时包含字母和数字 */
export const registerPasswordRules = [
  { required: true, trigger: 'blur', message: '请输入您的密码' },
  { min: 5, max: 20, trigger: 'blur', message: '密码长度必须为 5 到 20 个字符' },
  {
    validator: (_rule: any, value: string, callback: (error?: Error) => void) => {
      const password = value || ''
      if (!password) return callback()
      if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
        return callback(new Error('密码必须同时包含字母和数字'))
      }
      callback()
    },
    trigger: 'blur'
  }
]

/**
 * 计算密码强度（供强度提示条展示）
 * 弱：单一字符类型；中：≥两种字符类型且长度≥8；强：≥三种字符类型且长度≥10
 */
export function computePasswordStrength(password: string): PasswordStrength {
  if (!password) return 0
  const charsetCount = [/[a-z]/, /[A-Z]/, /\d/, /[^a-zA-Z\d]/].filter((r) => r.test(password)).length
  if (charsetCount >= 3 && password.length >= 10) return 3
  if (charsetCount >= 2 && password.length >= 8) return 2
  return 1
}

/**
 * 生成"确认密码"校验规则（两次密码需一致）
 */
export function createConfirmPasswordValidator(form: { password: string }) {
  return {
    validator: (_rule: any, value: string, callback: (error?: Error) => void) => {
      if ((value || '') !== (form.password || '')) {
        return callback(new Error('两次输入的密码不一致'))
      }
      callback()
    },
    trigger: 'blur'
  }
}
