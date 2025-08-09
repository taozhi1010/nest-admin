<script setup lang="ts">
import type { GenInfo } from '#/api/tool/gen/model';

import { onMounted, provide, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { useTabs } from '@vben/hooks';
import { safeParseNumber } from '@vben/utils';

import { Skeleton, Step, Steps } from 'ant-design-vue';

import { genInfo } from '#/api/tool/gen';

import { BasicSetting, GenConfig, GenSuccess } from './edit-steps';
import { emitter } from './mitt';

const current = ref(0);

const { setTabTitle } = useTabs();
const routes = useRoute();
// 获取路由参数
const tableId = routes.params.tableId as string;

const genInfoData = ref<GenInfo['info']>();

provide('genInfoData', genInfoData);

onMounted(async () => {
  const resp = await genInfo(tableId);
  // 需要做菜单转换 严格相等 才能选中回显
  resp.info.parentMenuId = safeParseNumber(resp.info.parentMenuId);
  resp.info.columns.forEach((column) => {
    column.insert = column.isInsert === '1';
    column.edit = column.isEdit === '1';
    column.list = column.isList === '1';
    column.query = column.isQuery === '1';
    column.required = column.isRequired === '1';
  });
  genInfoData.value = resp.info;
  setTabTitle(`生成配置: ${resp.info.tableName}`);
});

/**
 * 事件总线 监听切换步骤
 */
emitter.on('to', (step: number) => {
  current.value = step;
});
</script>

<template>
  <Page content-class="bg-background p-5 rounded-lg">
    <div class="flex items-center justify-center">
      <Steps :current="current" class="w-fit">
        <Step title="生成信息" />
        <Step disabled title="字段信息" />
        <Step disabled title="完成" />
      </Steps>
    </div>
    <!-- content -->
    <div v-if="genInfoData">
      <BasicSetting v-if="current === 0" />
      <GenConfig v-if="current === 1" />
      <GenSuccess v-if="current === 2" />
    </div>
    <Skeleton v-else :active="true" />
  </Page>
</template>
