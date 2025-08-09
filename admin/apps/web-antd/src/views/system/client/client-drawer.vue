<script setup lang="ts">
import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { cloneDeep } from '@vben/utils';

import { useVbenForm } from '#/adapter/form';
import { clientAdd, clientInfo, clientUpdate } from '#/api/system/client';

import { drawerSchema } from './data';
import SecretInput from './secret-input.vue';

const emit = defineEmits<{ reload: [] }>();

const isUpdate = ref(false);
const title = computed(() => {
  return isUpdate.value ? $t('pages.common.edit') : $t('pages.common.add');
});

const [BasicForm, formApi] = useVbenForm({
  commonConfig: {
    formItemClass: 'col-span-2',
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'vertical',
  schema: drawerSchema(),
  showDefaultActions: false,
  wrapperClass: 'grid-cols-2 gap-x-4',
});

function setupForm(update: boolean) {
  formApi.updateSchema([
    {
      dependencies: {
        show: () => update,
        triggerFields: [''],
      },
      fieldName: 'clientId',
    },
    {
      componentProps: {
        disabled: update,
      },
      fieldName: 'clientKey',
    },
    {
      componentProps: {
        disabled: update,
      },
      fieldName: 'clientSecret',
    },
  ]);
}

// 提取生成状态字段Schema的函数
const getStatusSchema = (disabled: boolean) => [
  {
    componentProps: { disabled },
    fieldName: 'status',
  },
];

const [BasicDrawer, drawerApi] = useVbenDrawer({
  onCancel: handleCancel,
  onConfirm: handleConfirm,
  async onOpenChange(isOpen) {
    if (!isOpen) {
      return null;
    }
    drawerApi.drawerLoading(true);
    const { id } = drawerApi.getData() as { id?: number | string };
    isUpdate.value = !!id;
    // 初始化
    setupForm(isUpdate.value);
    if (isUpdate.value && id) {
      const record = await clientInfo(id);
      // 不能禁用id为1的记录
      formApi.updateSchema(getStatusSchema(record.id === 1));
      await formApi.setValues(record);
    } else {
      // 新增模式: 确保状态字段可用
      formApi.updateSchema(getStatusSchema(false));
    }
    drawerApi.drawerLoading(false);
  },
});

async function handleConfirm() {
  try {
    drawerApi.drawerLoading(true);
    const { valid } = await formApi.validate();
    if (!valid) {
      return;
    }
    const data = cloneDeep(await formApi.getValues());
    await (isUpdate.value ? clientUpdate(data) : clientAdd(data));
    emit('reload');
    await handleCancel();
  } catch (error) {
    console.error(error);
  } finally {
    drawerApi.drawerLoading(false);
  }
}

async function handleCancel() {
  drawerApi.close();
  await formApi.resetForm();
}
</script>

<template>
  <BasicDrawer :close-on-click-modal="false" :title="title" class="w-[600px]">
    <BasicForm>
      <template #clientSecret="slotProps">
        <SecretInput v-bind="slotProps" :disabled="isUpdate" />
      </template>
    </BasicForm>
  </BasicDrawer>
</template>

<style lang="scss" scoped>
/**
自定义组件校验失败样式
*/
:deep(.form-valid-error .ant-input[name='clientSecret']) {
  border-color: hsl(var(--destructive));
  box-shadow: 0 0 0 2px rgb(255 38 5 / 6%);
}
</style>
