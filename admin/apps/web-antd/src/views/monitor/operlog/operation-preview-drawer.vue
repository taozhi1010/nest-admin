<script setup lang="ts">
import type { OperationLog } from '#/api/monitor/operlog/model';

import { useVbenDrawer } from '@vben/common-ui';

import { Description, useDescription } from '#/components/description';

import { descSchema } from './data';

const [BasicDrawer, drawerApi] = useVbenDrawer({
  onOpenChange: handleOpenChange,
});

const [registerDescription, { setDescProps }] = useDescription({
  column: 1,
  schema: descSchema,
});

function handleOpenChange(open: boolean) {
  if (!open) {
    return null;
  }
  const { record } = drawerApi.getData() as { record: OperationLog };
  setDescProps({ data: record }, true);
}
</script>

<template>
  <BasicDrawer :footer="false" class="w-[600px]" title="查看日志">
    <Description @register="registerDescription" />
  </BasicDrawer>
</template>
