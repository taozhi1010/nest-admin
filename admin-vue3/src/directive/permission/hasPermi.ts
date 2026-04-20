/**
 * v-hasPermi 操作权限处理
 * Copyright (c) 2019 ruoyi
 */

import type { Directive, DirectiveBinding } from 'vue'
import useUserStore from '@/store/modules/user'

interface HasPermiDirectiveBinding extends Omit<DirectiveBinding, 'value'> {
  value: string | string[]
}

/**
 * 操作权限指令
 * 用法: v-hasPermi="['system:user:add', 'system:user:edit']"
 */
const hasPermi: Directive<HTMLElement, string | string[]> = {
  mounted(el: HTMLElement, binding: HasPermiDirectiveBinding) {
    const { value } = binding
    const allPermission = '*:*:*'
    const permissions = useUserStore().permissions

    if (value && Array.isArray(value) && value.length > 0) {
      const permissionFlag = value

      const hasPermissions = permissions.some((permission: string) => {
        return allPermission === permission || permissionFlag.includes(permission)
      })

      if (!hasPermissions) {
        el.parentNode?.removeChild(el)
      }
    } else {
      throw new Error('请设置操作权限标签值')
    }
  }
}

export default hasPermi
