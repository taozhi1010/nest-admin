<script setup lang="ts">
import { useVbenModal } from '@vben/common-ui';

import { Description, useDescription } from '#/components/description';

import { modalSchema } from './data';

const [registerDescription, { setDescProps }] = useDescription({
  column: 1,
  schema: modalSchema(),
});

const [BasicModal, modalApi] = useVbenModal({
  onOpenChange: (isOpen) => {
    if (!isOpen) {
      return null;
    }
    const data = modalApi.getData();
    setDescProps({ data }, true);
  },
});
</script>

<template>
  <BasicModal
    :footer="false"
    :fullscreen-button="false"
    class="w-[550px]"
    title="登录日志"
  >
    <Description @register="registerDescription" />
  </BasicModal>
</template>
