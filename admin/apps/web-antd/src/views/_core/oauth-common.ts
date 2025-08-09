import type { Component, CSSProperties } from 'vue';

import { ref } from 'vue';

import { DEFAULT_TENANT_ID } from '@vben/constants';
import {
  GiteeIcon,
  GithubOAuthIcon,
  SvgMaxKeyIcon,
  SvgTopiamIcon,
  SvgWechatIcon,
} from '@vben/icons';

import { createGlobalState } from '@vueuse/core';

import { authBinding } from '#/api/core/auth';

/**
 * @description: oauth登录
 * @param title 标题
 * @param description 描述
 * @param avatar 图标
 * @param color 图标颜色可直接写英文颜色/hex
 */
export interface ListItem {
  title: string;
  description: string;
  avatar?: Component;
  style?: CSSProperties;
}

/**
 * @description: 绑定账号
 * @param source 来源 如gitee github 与后端的social-callback?source=xxx对应
 * @param bound 是否已经绑定
 */
export interface BindItem extends ListItem {
  source: string;
  bound?: boolean;
}

/**
 * 这里存储登录页的tenantId 由于个人中心也会用到 需要共享
 * 所以使用`createGlobalState`
 * @see https://vueuse.org/shared/createGlobalState/
 */
export const useLoginTenantId = createGlobalState(() => {
  const loginTenantId = ref(DEFAULT_TENANT_ID);

  return {
    loginTenantId,
  };
});

/**
 * 绑定授权
 * @param source
 */
export async function handleAuthBinding(source: string) {
  const { loginTenantId } = useLoginTenantId();
  // 这里返回打开授权页面的链接
  const href = await authBinding(source, loginTenantId.value);
  window.location.href = href;
}

/**
 * 账号绑定 list
 * 添加账号绑定只需要在这里增加即可
 */
export const accountBindList: BindItem[] = [
  {
    avatar: GiteeIcon,
    description: '绑定Gitee账号',
    source: 'gitee',
    title: 'Gitee',
    style: { color: '#c71d23' },
  },
  {
    avatar: GithubOAuthIcon,
    description: '绑定Github账号',
    source: 'github',
    title: 'Github',
  },
  {
    avatar: SvgMaxKeyIcon,
    description: '绑定MaxKey账号',
    source: 'maxkey',
    title: 'MaxKey',
  },
  {
    avatar: SvgTopiamIcon,
    description: '绑定topiam账号',
    source: 'topiam',
    title: 'Topiam',
  },
  {
    avatar: SvgWechatIcon,
    description: '绑定wechat账号',
    source: 'wechat',
    title: 'Wechat',
  },
];
