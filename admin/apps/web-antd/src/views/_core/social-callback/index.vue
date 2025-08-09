<script setup lang="ts">
import type { AuthApi } from '#/api';

import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { DEFAULT_HOME_PATH, DEFAULT_TENANT_ID } from '@vben/constants';
import { useAccessStore } from '@vben/stores';

import { message } from 'ant-design-vue';

import { authCallback } from '#/api';
import { useAuthStore } from '#/store';

import { accountBindList } from '../oauth-common';

const route = useRoute();

const code = route.query.code as string;
const state = route.query.state as string;
const stateJson = JSON.parse(atob(state));
// 来源
const source = route.query.source as string;
// 租户ID
const defaultTenantId = DEFAULT_TENANT_ID;
const tenantId = (stateJson.tenantId as string) ?? defaultTenantId;
const domain = stateJson.domain as string;

const accessStore = useAccessStore();
const authStore = useAuthStore();

const router = useRouter();

onMounted(async () => {
  // 如果域名不相等 则重定向处理
  const host = window.location.host;
  if (domain !== host) {
    const urlFull = new URL(window.location.href);
    urlFull.host = domain;
    window.location.href = urlFull.toString();
    return;
  }

  try {
    // 已经实现的平台
    const currentClient = accountBindList.find(
      (item) => item.source === source,
    );
    if (!currentClient) {
      message.error({ content: `未找到${source}平台` });
      return;
    }
    const data: AuthApi.OAuthLoginParams = {
      grantType: 'social',
      socialCode: code,
      socialState: state,
      source,
      tenantId,
    };
    // 没有token为登录 有token是授权
    if (accessStore.accessToken) {
      await authCallback(data);
      message.success(`${source}授权成功`);
    } else {
      // todo
      await authStore.authLogin(data as any);
      message.success(`${source}登录成功`);
    }
  } catch {
    // 500 你还没有绑定第三方账号，绑定后才可以登录！
  } finally {
    setTimeout(() => {
      router.push(DEFAULT_HOME_PATH);
    }, 1500);
  }
});
</script>

<template>
  <div></div>
</template>

<style scoped></style>
