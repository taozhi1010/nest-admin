import type { Tenant } from './model';

import type { ID, IDS, PageQuery } from '#/api/common';

import { commonExport } from '#/api/helper';
import { requestClient } from '#/api/request';

enum Api {
  dictSync = '/system/tenant/syncTenantDict',
  root = '/system/tenant',
  tenantDynamic = '/system/tenant/dynamic',
  tenantDynamicClear = '/system/tenant/dynamic/clear',
  tenantExport = '/system/tenant/export',
  tenantList = '/system/tenant/list',
  tenantStatus = '/system/tenant/changeStatus',
  tenantSyncPackage = '/system/tenant/syncTenantPackage',
}

/**
 * 查询租户分页列表
 * @param params 参数
 * @returns 分页
 */
export function tenantList(params?: PageQuery) {
  return requestClient.get<Tenant[]>(Api.tenantList, { params });
}

/**
 * 租户导出
 * @param data data
 * @returns void
 */
export function tenantExport(data: Partial<Tenant>) {
  return commonExport(Api.tenantExport, data);
}

/**
 * 查询租户信息
 * @param id id
 * @returns 租户信息
 */
export function tenantInfo(id: ID) {
  return requestClient.get<Tenant>(`${Api.root}/${id}`);
}

/**
 * 新增租户 必须开启加密
 * @param data data
 * @returns void
 */
export function tenantAdd(data: Partial<Tenant>) {
  return requestClient.postWithMsg<void>(Api.root, data, { encrypt: true });
}

/**
 * 租户更新
 * @param data data
 * @returns void
 */
export function tenantUpdate(data: Partial<Tenant>) {
  return requestClient.putWithMsg<void>(Api.root, data);
}

/**
 * 租户状态更新
 * @param data data
 * @returns void
 */
export function tenantStatusChange(data: Partial<Tenant>) {
  return requestClient.putWithMsg(Api.tenantStatus, data);
}

/**
 * 租户删除
 * @param ids ids
 * @returns void
 */
export function tenantRemove(ids: IDS) {
  return requestClient.deleteWithMsg(`${Api.root}/${ids}`);
}

/**
 * 动态切换租户
 * @param tenantId 租户ID
 * @returns void
 */
export function tenantDynamicToggle(tenantId: string) {
  return requestClient.get<void>(`${Api.tenantDynamic}/${tenantId}`);
}

/**
 * 清除 动态切换租户
 * @returns void
 */
export function tenantDynamicClear() {
  return requestClient.get<void>(Api.tenantDynamicClear);
}

/**
 * 租户套餐同步
 * @param tenantId 租户id
 * @param packageId 套餐id
 * @returns void
 */
export function tenantSyncPackage(tenantId: string, packageId: string) {
  return requestClient.get<void>(Api.tenantSyncPackage, {
    params: { packageId, tenantId },
    successMessageMode: 'message',
  });
}

/**
 * 同步租户字典
 * @param tenantId 租户ID
 * @returns void
 */
export function dictSyncTenant(tenantId?: string) {
  return requestClient.get<void>(Api.dictSync, {
    params: { tenantId },
    successMessageMode: 'message',
  });
}
