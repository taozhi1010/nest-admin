import type { SysConfig } from './model';

import type { ID, IDS, PageQuery, PageResult } from '#/api/common';

import { commonExport } from '#/api/helper';
import { requestClient } from '#/api/request';

enum Api {
  configExport = '/system/config/export',
  configInfoByKey = '/system/config/configKey',
  configList = '/system/config/list',
  configRefreshCache = '/system/config/refreshCache',
  root = '/system/config',
}

/**
 * 系统参数分页列表
 * @param params 请求参数
 * @returns 列表
 */
export function configList(params?: PageQuery) {
  return requestClient.get<PageResult<SysConfig>>(Api.configList, { params });
}

export function configInfo(configId: ID) {
  return requestClient.get<SysConfig>(`${Api.root}/${configId}`);
}

/**
 * 导出
 * @param data 参数
 */
export function configExport(data: Partial<SysConfig>) {
  return commonExport(Api.configExport, data);
}

/**
 * 刷新缓存
 * @returns void
 */
export function configRefreshCache() {
  return requestClient.deleteWithMsg<void>(Api.configRefreshCache);
}

/**
 * 更新系统配置
 * @param data 参数
 */
export function configUpdate(data: Partial<SysConfig>) {
  return requestClient.putWithMsg<void>(Api.root, data);
}

/**
 * 新增系统配置
 * @param data 参数
 */
export function configAdd(data: Partial<SysConfig>) {
  return requestClient.postWithMsg<void>(Api.root, data);
}

/**
 * 删除配置
 * @param configIds ids
 */
export function configRemove(configIds: IDS) {
  return requestClient.deleteWithMsg<void>(`${Api.root}/${configIds}`);
}

/**
 * 获取配置信息
 * @param configKey configKey
 * @returns value
 */
export function configInfoByKey(configKey: string) {
  return requestClient.get<string>(`${Api.configInfoByKey}/${configKey}`);
}
