import useUserStore from '@/store/modules/user'

// ==================== 类型定义 ====================

/**
 * 权限验证结果接口
 * @deprecated 使用 AuthValidationResult 替代
 */
export interface AuthResult {
  hasPermission: boolean // 是否具有权限
  hasRole: boolean // 是否具有角色
}

// ==================== 核心函数 ====================

/**
 * 验证用户是否具备指定权限
 * @param permission - 要验证的权限标识符
 * @returns boolean - 是否具有该权限
 * 
 * @example
 * ```ts
 * // 检查单个权限
 * const hasAccess = authPermission('system:user:add')
 * 
 * // 支持通配符权限 '*:*:*'
 * ```
 */
const authPermission = (permission: string): boolean => {
  const all_permission = '*:*:*'
  const permissions = useUserStore().permissions
  
  if (permission && permission.length > 0) {
    return permissions.some((v: string) => {
      return all_permission === v || v === permission
    })
  } else {
    return false
  }
}

/**
 * 验证用户是否具备指定角色
 * @param role - 要验证的角色标识符
 * @returns boolean - 是否具有该角色
 * 
 * @example
 * ```ts
 * // 检查单个角色
 * const isAdmin = authRole('admin')
 * 
 * // 支持超级管理员角色 'admin'
 * ```
 */
const authRole = (role: string): boolean => {
  const super_admin = 'admin'
  const roles = useUserStore().roles
  
  if (role && role.length > 0) {
    return roles.some((v: string) => {
      return super_admin === v || v === role
    })
  } else {
    return false
  }
}

// ==================== 导出方法 ====================

/**
 * 验证用户是否具备某权限
 * @param permission - 权限标识符
 * @returns boolean - 是否具有该权限
 * 
 * @example
 * ```ts
 * import { useAuth } from '@/composables/useAuth'
 * 
 * const { hasPermi } = useAuth()
 * const canAdd = hasPermi('system:user:add')
 * ```
 */
const hasPermi = (permission: string): boolean => {
  return authPermission(permission)
}

/**
 * 验证用户是否含有指定权限，只需包含其中一个
 * @param permissions - 权限标识符数组
 * @returns boolean - 是否具有任一权限
 * 
 * @example
 * ```ts
 * import { useAuth } from '@/composables/useAuth'
 * 
 * const { hasPermiOr } = useAuth()
 * const canEdit = hasPermiOr(['system:user:edit', 'system:user:update'])
 * ```
 */
const hasPermiOr = (permissions: string[]): boolean => {
  return permissions.some((item: string) => {
    return authPermission(item)
  })
}

/**
 * 验证用户是否含有指定权限，必须全部拥有
 * @param permissions - 权限标识符数组
 * @returns boolean - 是否具有所有权限
 * 
 * @example
 * ```ts
 * import { useAuth } from '@/composables/useAuth'
 * 
 * const { hasPermiAnd } = useAuth()
 * const canFullAccess = hasPermiAnd(['system:user:view', 'system:user:edit'])
 * ```
 */
const hasPermiAnd = (permissions: string[]): boolean => {
  return permissions.every((item: string) => {
    return authPermission(item)
  })
}

/**
 * 验证用户是否具备某角色
 * @param role - 角色标识符
 * @returns boolean - 是否具有该角色
 * 
 * @example
 * ```ts
 * import { useAuth } from '@/composables/useAuth'
 * 
 * const { hasRole } = useAuth()
 * const isAdmin = hasRole('admin')
 * ```
 */
const hasRole = (role: string): boolean => {
  return authRole(role)
}

/**
 * 验证用户是否含有指定角色，只需包含其中一个
 * @param roles - 角色标识符数组
 * @returns boolean - 是否具有任一角色
 * 
 * @example
 * ```ts
 * import { useAuth } from '@/composables/useAuth'
 * 
 * const { hasRoleOr } = useAuth()
 * const isManager = hasRoleOr(['manager', 'supervisor'])
 * ```
 */
const hasRoleOr = (roles: string[]): boolean => {
  return roles.some((item: string) => {
    return authRole(item)
  })
}

/**
 * 验证用户是否含有指定角色，必须全部拥有
 * @param roles - 角色标识符数组
 * @returns boolean - 是否具有所有角色
 * 
 * @example
 * ```ts
 * import { useAuth } from '@/composables/useAuth'
 * 
 * const { hasRoleAnd } = useAuth()
 * const isSuperAdmin = hasRoleAnd(['admin', 'superuser'])
 * ```
 */
const hasRoleAnd = (roles: string[]): boolean => {
  return roles.every((item: string) => {
    return authRole(item)
  })
}

// ==================== 组合式 API 导出 ====================

/**
 * 权限验证组合式函数
 * 提供完整的权限和角色验证功能
 * 
 * @returns 包含所有权限验证方法的对象
 * 
 * @example
 * ```ts
 * import { useAuth } from '@/composables/useAuth'
 * 
 * const { hasPermi, hasRole, hasPermiOr, hasRoleAnd } = useAuth()
 * 
 * // 在模板中使用
 * // <button v-if="hasPermi('system:user:add')">添加用户</button>
 * // <div v-if="hasRoleOr(['admin', 'manager'])">管理面板</div>
 * ```
 */
export const useAuth = () => {
  return {
    hasPermi,
    hasPermiOr,
    hasPermiAnd,
    hasRole,
    hasRoleOr,
    hasRoleAnd
  }
}

// ==================== 默认导出（兼容旧版本）====================

/**
 * 默认导出对象，保持与原有插件API兼容
 * @deprecated 建议使用 useAuth() 组合式函数
 */
export default {
  hasPermi,
  hasPermiOr,
  hasPermiAnd,
  hasRole,
  hasRoleOr,
  hasRoleAnd
}
