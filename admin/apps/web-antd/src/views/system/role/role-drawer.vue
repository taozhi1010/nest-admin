<script setup lang="ts">
import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { cloneDeep } from '@vben/utils';

import { useVbenForm } from '#/adapter/form';
import { menuTreeSelect, roleMenuTreeSelect } from '#/api/system/menu';
import { roleAdd, roleInfo, roleUpdate } from '#/api/system/role';
import { TreeSelectPanel } from '#/components/tree';

import { drawerSchema } from './data';

const emit = defineEmits<{ reload: [] }>();

const isUpdate = ref(false);
const title = computed(() => {
  return isUpdate.value ? $t('pages.common.edit') : $t('pages.common.add');
});

const [BasicForm, formApi] = useVbenForm({
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
    formItemClass: 'col-span-2',
  },
  layout: 'vertical',
  schema: drawerSchema(),
  showDefaultActions: false,
  wrapperClass: 'grid-cols-2',
});

const menuTree = ref<any[]>([]);
async function setupMenuTree(id?: number | string) {
  if (id) {
    const resp = await roleMenuTreeSelect(id);
    formApi.setFieldValue('menuIds', resp.checkedKeys);
    // 设置菜单信息
    menuTree.value = resp.menus;
  } else {
    const resp = await menuTreeSelect();
    formApi.setFieldValue('menuIds', []);
    // 设置菜单信息
    menuTree.value = resp.menus;
  }
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

    if (isUpdate.value && id) {
      const record = await roleInfo(id);
      await formApi.setValues(record);
    }
    // init菜单 注意顺序要放在赋值record之后 内部watch会依赖record
    await setupMenuTree(id);

    drawerApi.drawerLoading(false);
  },
});

/**
 * 这里拿到的是一个数组ref
 */
const menuSelectRef = ref();

async function handleConfirm() {
  try {
    drawerApi.drawerLoading(true);
    const { valid } = await formApi.validate();
    if (!valid) {
      return;
    }
    // 这个用于提交
    const menuIds = menuSelectRef.value?.[0]?.getCheckedKeys() ?? [];
    // formApi.getValues拿到的是一个readonly对象，不能直接修改，需要cloneDeep
    const data = cloneDeep(await formApi.getValues());
    data.menuIds = menuIds;
    await (isUpdate.value ? roleUpdate(data) : roleAdd(data));
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

/**
 * 通过回调更新 无法通过v-model
 * @param value 菜单选择是否严格模式
 */
function handleMenuCheckStrictlyChange(value: boolean) {
  formApi.setFieldValue('menuCheckStrictly', value);
}
</script>

<template>
  <BasicDrawer :close-on-click-modal="false" :title="title" class="w-[600px]">
    <BasicForm>
      <template #menuIds="slotProps">
        <!-- check-strictly为readonly 不能通过v-model绑定 -->
        <TreeSelectPanel
          ref="menuSelectRef"
          v-bind="slotProps"
          :check-strictly="formApi.form.values.menuCheckStrictly"
          :tree-data="menuTree"
          @check-strictly-change="handleMenuCheckStrictlyChange"
        />
      </template>
    </BasicForm>
  </BasicDrawer>
</template>
