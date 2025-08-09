import type { LoginLog } from './model';

import type { IDS, PageQuery, PageResult } from '#/api/common';

import { commonExport } from '#/api/helper';
import { requestClient } from '#/api/request';

enum Api {
  loginInfoClean = '/monitor/logininfor/clean',
  loginInfoExport = '/monitor/logininfor/export',
  loginInfoList = '/monitor/logininfor/list',
  root = '/monitor/logininfor',
  userUnlock = '/monitor/logininfor/unlock',
}

/**
 * 登录日志列表
 * @param params 查询参数
 * @returns list[]
 */
export function loginInfoList(params?: PageQuery) {
  return requestClient.get<PageResult<LoginLog>>(Api.loginInfoList, { params });
}

/**
 * 导出登录日志
 * @param data 表单参数
 * @returns excel
 */
export function loginInfoExport(data: any) {
  return commonExport(Api.loginInfoExport, data);
}

/**
 * 移除登录日志
 * @param infoIds 登录日志id数组
 * @returns void
 */
export function loginInfoRemove(infoIds: IDS) {
  return requestClient.deleteWithMsg<void>(`${Api.root}/${infoIds}`);
}

/**
 * 账号解锁
 * @param username 用户名(账号)
 * @returns void
 */
export function userUnlock(username: string) {
  return requestClient.get<void>(`${Api.userUnlock}/${username}`, {
    successMessageMode: 'message',
  });
}

/**
 * 清空全部登录日志
 * @returns void
 */
export function loginInfoClean() {
  return requestClient.deleteWithMsg<void>(Api.loginInfoClean);
}
