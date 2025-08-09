import type { Client } from './model';

import type { ID, IDS, PageQuery, PageResult } from '#/api/common';

import { commonExport } from '#/api/helper';
import { requestClient } from '#/api/request';

enum Api {
  clientChangeStatus = '/system/client/changeStatus',
  clientExport = '/system/client/export',
  clientList = '/system/client/list',
  root = '/system/client',
}

export function clientList(params?: PageQuery) {
  return requestClient.get<PageResult<Client>>(Api.clientList, { params });
}

export function clientExport(data: any) {
  return commonExport(Api.clientExport, data);
}

export function clientInfo(id: ID) {
  return requestClient.get<Client>(`${Api.root}/${id}`);
}

export function clientAdd(data: any) {
  return requestClient.postWithMsg<void>(Api.root, data);
}

export function clientUpdate(data: any) {
  return requestClient.putWithMsg<void>(Api.root, data);
}

export function clientChangeStatus(data: any) {
  return requestClient.putWithMsg<void>(Api.root, data);
}

export function clientRemove(ids: IDS) {
  return requestClient.deleteWithMsg(`${Api.root}/${ids}`);
}
