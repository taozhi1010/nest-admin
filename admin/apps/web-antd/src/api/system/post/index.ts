import type { Post } from './model';

import type { ID, IDS, PageQuery } from '#/api/common';

import { commonExport } from '#/api/helper';
import { requestClient } from '#/api/request';

enum Api {
  postExport = '/system/post/export',
  postList = '/system/post/list',
  postSelect = '/system/post/optionselect',
  root = '/system/post',
}

/**
 * 获取岗位列表
 * @param params 参数
 * @returns Post[]
 */
export function postList(params?: PageQuery) {
  return requestClient.get<Post[]>(Api.postList, { params });
}

/**
 * 导出岗位信息
 * @param data 请求参数
 * @returns blob
 */
export function postExport(data: Partial<Post>) {
  return commonExport(Api.postExport, data);
}

/**
 * 查询岗位信息
 * @param postId id
 * @returns 岗位信息
 */
export function postInfo(postId: ID) {
  return requestClient.get<Post>(`${Api.root}/${postId}`);
}

/**
 * 岗位新增
 * @param data 参数
 * @returns void
 */
export function postAdd(data: Partial<Post>) {
  return requestClient.postWithMsg<void>(Api.root, data);
}

/**
 * 岗位更新
 * @param data 参数
 * @returns void
 */
export function postUpdate(data: Partial<Post>) {
  return requestClient.putWithMsg<void>(Api.root, data);
}

/**
 * 岗位删除
 * @param postIds ids
 * @returns void
 */
export function postRemove(postIds: IDS) {
  return requestClient.deleteWithMsg<void>(`${Api.root}/${postIds}`);
}

/**
 * 根据部门id获取岗位下拉列表
 * @param deptId 部门id
 * @returns 岗位
 */
export function postOptionSelect(deptId: ID) {
  return requestClient.get<Post[]>(Api.postSelect, { params: { deptId } });
}
