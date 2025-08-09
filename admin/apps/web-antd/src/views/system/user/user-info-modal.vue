<script setup lang="ts">
import type { User } from '#/api/system/user/model';

import { useVbenModal } from '@vben/common-ui';

import { findUserInfo } from '#/api/system/user';
import { Description, useDescription } from '#/components/description';

import { descSchema } from './info';

const [BasicModal, modalApi] = useVbenModal({
  onOpenChange: handleOpenChange,
});

const [registerDescription, { setDescProps }] = useDescription({
  column: 1,
  labelStyle: {
    minWidth: '150px',
    width: '150px',
  },
  schema: descSchema,
});

async function handleOpenChange(open: boolean) {
  if (!open) {
    return null;
  }
  modalApi.modalLoading(true);

  const { userId } = modalApi.getData() as { userId: number | string };
  const response = await findUserInfo(userId);
  // 外部的roleIds postIds才是真正对应的  新增时为空
  // posts有为Null的情况 需要给默认值
  const { postIds = [], posts = [], roleIds = [], roles = [], user } = response;

  const postNames = posts
    .filter((item) => postIds.includes(item.postId))
    .map((item) => item.postName);

  const roleNames = roles
    .filter((item) => roleIds.includes(item.roleId))
    .map((item) => item.roleName);

  interface UserWithNames extends User {
    postNames: string[];
    roleNames: string[];
  }
  (user as UserWithNames).postNames = postNames;
  (user as UserWithNames).roleNames = roleNames;

  // 赋值
  setDescProps({ data: user });

  modalApi.modalLoading(false);
}
</script>

<template>
  <BasicModal :footer="false" :fullscreen-button="false" title="用户信息">
    <Description @register="registerDescription" />
  </BasicModal>
</template>
