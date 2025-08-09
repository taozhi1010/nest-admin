import type { BasicUserInfo } from '@vben-core/typings';

/** 用户信息 */
interface UserInfo extends BasicUserInfo {
  /**
   * 拓展使用
   */
  [key: string]: any;
}

export type { UserInfo };
