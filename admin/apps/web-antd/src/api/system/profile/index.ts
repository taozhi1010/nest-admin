import type { FileCallBack, UpdatePasswordParam, UserProfile } from './model';

import { buildUUID } from '@vben/utils';

import { requestClient } from '#/api/request';

enum Api {
  root = '/system/user/profile',
  updateAvatar = '/system/user/profile/avatar',
  updatePassword = '/system/user/profile/updatePwd',
}

/**
 * 用户个人主页信息
 * @returns userInformation
 */
export function userProfile() {
  return requestClient.get<UserProfile>(Api.root);
}

/**
 * 更新用户个人主页信息
 * @param data
 * @returns void
 */
export function userProfileUpdate(data: any) {
  return requestClient.putWithMsg<void>(Api.root, data);
}

/**
 * 用户修改密码 (需要加密)
 * @param data
 * @returns void
 */
export function userUpdatePassword(data: UpdatePasswordParam) {
  return requestClient.putWithMsg<void>(Api.updatePassword, data, {
    encrypt: true,
  });
}

/**
 * 用户更新个人头像
 * @param fileCallback data
 * @returns void
 */
export function userUpdateAvatar(fileCallback: FileCallBack) {
  /** 直接点击头像上传 filename为空 由于后台通过拓展名判断(默认文件名blob) 会上传失败 */
  let { file } = fileCallback;
  const { filename } = fileCallback;
  /**
   * Blob转File类型
   * 1. 在直接点击确认 filename为空 取uuid作为文件名
   * 2. 选择上传必须转为File类型 Blob类型上传后台获取文件名为空
   */
  file = filename
    ? new File([file], filename)
    : new File([file], `${buildUUID()}.png`);
  return requestClient.post(
    Api.updateAvatar,
    {
      avatarfile: file,
    },
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
}
