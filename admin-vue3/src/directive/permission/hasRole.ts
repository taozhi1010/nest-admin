/**
 * v-hasRole 角色权限处理
 * Copyright (c) 2019 ruoyi
 */

import type { Directive, DirectiveBinding } from 'vue'
import useUserStore from '@/store/modules/user'

interface HasRoleDirectiveBinding extends Omit<DirectiveBinding, 'value'> {
  value: string | string[]
}

/**
 * 角色权限指令
 * 用法: v-hasRole="['admin', 'editor']"
 */
const hasRole: Directive<HTMLElement, string | string[]> = {
  mounted(el: HTMLElement, binding: HasRoleDirectiveBinding) {
    const { value } = binding
    const superAdmin = 'admin'
    const roles = useUserStore().roles

    if (value && Array.isArray(value) && value.length > 0) {
      const roleFlag = value

      const hasRole = roles.some((role: string) => {
        return superAdmin === role || roleFlag.includes(role)
      })

      if (!hasRole) {
        el.parentNode?.removeChild(el)
      }
    } else {
      throw new Error('请设置角色权限标签值')
    }
  }
}

export default hasRole
