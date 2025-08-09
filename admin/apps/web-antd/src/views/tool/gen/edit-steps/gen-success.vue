<script setup lang="ts">
import { useRouter } from 'vue-router';

import { useTabs } from '@vben/hooks';

import { Result } from 'ant-design-vue';

const { closeCurrentTab } = useTabs();

const router = useRouter();
async function handleClose() {
  await closeCurrentTab();
  router.push({ path: '/tool/gen', replace: true });
}
</script>

<template>
  <Result status="success" title="修改成功">
    <template #extra>
      <a-button type="primary" @click="handleClose"> 关闭 </a-button>
    </template>
  </Result>
</template>

<style scoped></style>
