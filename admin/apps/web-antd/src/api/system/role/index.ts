import type { User } from '#/api/system/user/model';
import type { DeptResp, Role } from './model';

import type { ID, IDS, PageQuery, PageResult } from '#/api/common';

import { commonExport } from '#/api/helper';
import { requestClient } from '#/api/request';

enum Api {
  roleAllocatedList = '/system/role/authUser/allocatedList',
  roleAuthCancel = '/system/role/authUser/cancel',
  roleAuthCancelAll = '/system/role/authUser/cancelAll',
  roleAuthSelectAll = '/system/role/authUser/selectAll',
  roleChangeStatus = '/system/role/changeStatus',
  roleDataScope = '/system/role/dataScope',
  roleDeptTree = '/system/role/deptTree',
  roleExport = '/system/role/export',
  roleList = '/system/role/list',
  roleOptionSelect = '/system/role/optionselect',
  roleUnallocatedList = '/system/role/authUser/unallocatedList',
  root = '/system/role',
}

/**
 * 查询角色分页列表
 * @param params 搜索条件
 * @returns 分页列表
 */
export function roleList(params?: PageQuery) {
  return requestClient.get<PageResult<Role>>(Api.roleList, { params });
}

/**
 * 导出角色信息
 * @param data 查询参数
 * @returns blob
 */
export function roleExport(data: Partial<Role>) {
  return commonExport(Api.roleExport, data);
}

/**
 * 查询角色信息
 * @param roleId 角色id
 * @returns 角色信息
 */
export function roleInfo(roleId: ID) {
  return requestClient.get<Role>(`${Api.root}/${roleId}`);
}

/**
 * 角色新增
 * @param data 参数
 * @returns void
 */
export function roleAdd(data: Partial<Role>) {
  return requestClient.postWithMsg<void>(Api.root, data);
}

/**
 * 角色更新
 * @param data 参数
 * @returns void
 */
export function roleUpdate(data: Partial<Role>) {
  return requestClient.putWithMsg<void>(Api.root, data);
}

/**
 * 修改角色状态
 * @param data 参数
 * @returns void
 */
export function roleChangeStatus(data: Partial<Role>) {
  return requestClient.putWithMsg<void>(Api.roleChangeStatus, data);
}

/**
 * 角色删除
 * @param roleIds ids
 * @returns void
 */
export function roleRemove(roleIds: IDS) {
  return requestClient.deleteWithMsg<void>(`${Api.root}/${roleIds}`);
}

/**
 * 更新数据权限
 * @param data
 * @returns void
 */
export function roleDataScope(data: any) {
  return requestClient.putWithMsg<void>(Api.roleDataScope, data);
}

/**
 * @deprecated 全局并没有用到这个方法
 */
export function roleOptionSelect(params?: any) {
  return requestClient.get(Api.roleOptionSelect, { params });
}

/**
 * 已分配角色的用户分页
 * @param params 请求参数
 * @returns 分页
 */
export function roleAllocatedList(params?: PageQuery) {
  return requestClient.get<PageResult<User>>(Api.roleAllocatedList, { params });
}

/**
 * 未授权的用户
 * @param params
 * @returns void
 */
export function roleUnallocatedList(params: any) {
  return requestClient.get<PageResult<User>>(Api.roleUnallocatedList, {
    params,
  });
}

/**
 * 取消用户角色授权
 * @returns void
 */
export function roleAuthCancel(data: { roleId: ID; userId: ID }) {
  return requestClient.putWithMsg<void>(Api.roleAuthCancel, data);
}

/**
 * 批量取消授权
 * @param roleId 角色ID
 * @param userIds 用户ID集合
 * @returns void
 */
export function roleAuthCancelAll(roleId: ID, userIds: IDS) {
  return requestClient.putWithMsg<void>(
    `${Api.roleAuthCancelAll}?roleId=${roleId}&userIds=${userIds.join(',')}`,
  );
}

/**
 * 批量授权用户
 * @param roleId 角色ID
 * @param userIds 用户ID集合
 * @returns void
 */
export function roleSelectAll(roleId: ID, userIds: IDS) {
  return requestClient.putWithMsg<void>(
    `${Api.roleAuthSelectAll}?roleId=${roleId}&userIds=${userIds.join(',')}`,
  );
}

/**
 * 根据角色id获取部门树
 * @param roleId 角色id
 * @returns DeptResp
 */
export function roleDeptTree(roleId: ID) {
  return requestClient.get<DeptResp>(`${Api.roleDeptTree}/${roleId}`);
}
