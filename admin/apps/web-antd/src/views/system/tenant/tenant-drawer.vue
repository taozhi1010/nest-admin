<script setup lang="ts">
import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { cloneDeep } from '@vben/utils';

import { useVbenForm } from '#/adapter/form';
import { tenantAdd, tenantInfo, tenantUpdate } from '#/api/system/tenant';
import { packageSelectList } from '#/api/system/tenant-package';
import { useTenantStore } from '#/store/tenant';

import { drawerSchema } from './data';

const emit = defineEmits<{ reload: [] }>();

const isUpdate = ref(false);
const title = computed(() => {
  return isUpdate.value ? $t('pages.common.edit') : $t('pages.common.add');
});

const [BasicForm, formApi] = useVbenForm({
  commonConfig: {
    formItemClass: 'col-span-2',
    labelWidth: 100,
    componentProps: {
      class: 'w-full',
    },
  },
  schema: drawerSchema(),
  showDefaultActions: false,
  wrapperClass: 'grid-cols-2',
});

async function setupPackageSelect() {
  const tenantPackageList = await packageSelectList();
  const options = tenantPackageList.map((item) => ({
    label: item.packageName,
    value: item.packageId,
  }));
  formApi.updateSchema([
    {
      componentProps: {
        optionFilterProp: 'label',
        optionLabelProp: 'label',
        options,
        showSearch: true,
      },
      fieldName: 'packageId',
    },
  ]);
}

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
    await setupPackageSelect();
    if (isUpdate.value && id) {
      const record = await tenantInfo(id);
      await formApi.setValues(record);
    }
    formApi.updateSchema([
      {
        fieldName: 'packageId',
        componentProps: {
          disabled: isUpdate.value,
        },
      },
    ]);
    drawerApi.drawerLoading(false);
  },
});

const tenantStore = useTenantStore();
async function handleConfirm() {
  try {
    drawerApi.drawerLoading(true);
    const { valid } = await formApi.validate();
    if (!valid) {
      return;
    }
    const data = cloneDeep(await formApi.getValues());
    await (isUpdate.value ? tenantUpdate(data) : tenantAdd(data));
    emit('reload');
    await handleCancel();
    // 重新加载租户信息
    tenantStore.initTenant();
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
    <BasicForm />
  </BasicDrawer>
</template>

<style lang="scss" scoped>
:deep(.ant-divider) {
  margin: 8px 0;
}
</style>
