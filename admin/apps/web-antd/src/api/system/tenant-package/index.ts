import type { TenantPackage } from './model';

import type { ID, IDS, PageQuery, PageResult } from '#/api/common';

import { commonExport } from '#/api/helper';
import { requestClient } from '#/api/request';

enum Api {
  packageChangeStatus = '/system/tenant/package/changeStatus',
  packageExport = '/system/tenant/package/export',
  packageList = '/system/tenant/package/list',
  packageSelectList = '/system/tenant/package/selectList',
  root = '/system/tenant/package',
}

/**
 * 租户套餐分页列表
 * @param params 请求参数
 * @returns 分页列表
 */
export function packageList(params?: PageQuery) {
  return requestClient.get<PageResult<TenantPackage>>(Api.packageList, {
    params,
  });
}

/**
 * 租户套餐下拉框
 * @returns 下拉框
 */
export function packageSelectList() {
  return requestClient.get<TenantPackage[]>(Api.packageSelectList);
}

/**
 * 租户套餐导出
 * @param data 参数
 * @returns blob
 */
export function packageExport(data: Partial<TenantPackage>) {
  return commonExport(Api.packageExport, data);
}

/**
 * 租户套餐信息
 * @param id id
 * @returns 信息
 */
export function packageInfo(id: ID) {
  return requestClient.get<TenantPackage>(`${Api.root}/${id}`);
}

/**
 * 租户套餐新增
 * @param data data
 * @returns void
 */
export function packageAdd(data: Partial<TenantPackage>) {
  return requestClient.postWithMsg<void>(Api.root, data);
}

/**
 * 租户套餐更新
 * @param data data
 * @returns void
 */
export function packageUpdate(data: Partial<TenantPackage>) {
  return requestClient.putWithMsg<void>(Api.root, data);
}

/**
 * 租户套餐状态变更
 * @param data data
 * @returns void
 */
export function packageChangeStatus(data: Partial<TenantPackage>) {
  return requestClient.putWithMsg<void>(Api.packageChangeStatus, data);
}

/**
 * 租户套餐移除
 * @param ids ids
 * @returns void
 */
export function packageRemove(ids: IDS) {
  return requestClient.deleteWithMsg<void>(`${Api.root}/${ids}`);
}
