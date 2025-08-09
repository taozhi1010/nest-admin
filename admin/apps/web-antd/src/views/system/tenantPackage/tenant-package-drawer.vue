<script setup lang="ts">
import type { MenuOption } from '#/api/system/menu/model';

import { computed, nextTick, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { cloneDeep, eachTree } from '@vben/utils';

import { omit } from 'lodash-es';

import { useVbenForm } from '#/adapter/form';
import { menuTreeSelect, tenantPackageMenuTreeSelect } from '#/api/system/menu';
import {
  packageAdd,
  packageInfo,
  packageUpdate,
} from '#/api/system/tenant-package';
import { MenuSelectTable } from '#/components/tree';

import { drawerSchema } from './data';

const emit = defineEmits<{ reload: [] }>();

const isUpdate = ref(false);
const title = computed(() => {
  return isUpdate.value ? $t('pages.common.edit') : $t('pages.common.add');
});

const [BasicForm, formApi] = useVbenForm({
  commonConfig: {
    formItemClass: 'col-span-2',
  },
  layout: 'vertical',
  schema: drawerSchema(),
  showDefaultActions: false,
  wrapperClass: 'grid-cols-2',
});

const menuTree = ref<MenuOption[]>([]);
async function setupMenuTree(id?: number | string) {
  if (id) {
    const resp = await tenantPackageMenuTreeSelect(id);
    const menus = resp.menus;
    // i18n处理
    eachTree(menus, (node) => {
      node.label = $t(node.label);
    });
    // 设置菜单信息
    menuTree.value = resp.menus;
    // keys依赖于menu 需要先加载menu
    await nextTick();
    await formApi.setFieldValue('menuIds', resp.checkedKeys);
  } else {
    const resp = await menuTreeSelect();
    // i18n处理
    eachTree(resp, (node) => {
      node.label = $t(node.label);
    });
    // 设置菜单信息
    menuTree.value = resp;
    // keys依赖于menu 需要先加载menu
    await nextTick();
    await formApi.setFieldValue('menuIds', []);
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
      const record = await packageInfo(id);
      // 需要排除menuIds menuIds为string
      // 通过setupMenuTreeSelect设置
      await formApi.setValues(omit(record, ['menuIds']));
    }
    // init菜单 注意顺序要放在赋值record之后 内部watch会依赖record
    await setupMenuTree(id);

    drawerApi.drawerLoading(false);
  },
});

const menuSelectRef = ref<InstanceType<typeof MenuSelectTable>>();
async function handleConfirm() {
  try {
    drawerApi.drawerLoading(true);
    const { valid } = await formApi.validate();
    if (!valid) {
      return;
    }
    // 这个用于提交
    const menuIds = menuSelectRef.value?.getCheckedKeys?.() ?? [];
    // formApi.getValues拿到的是一个readonly对象，不能直接修改，需要cloneDeep
    const data = cloneDeep(await formApi.getValues());
    data.menuIds = menuIds;
    await (isUpdate.value ? packageUpdate(data) : packageAdd(data));
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
  <BasicDrawer :close-on-click-modal="false" :title="title" class="w-[800px]">
    <BasicForm>
      <template #menuIds="slotProps">
        <div class="h-[600px] w-full">
          <!-- association为readonly 不能通过v-model绑定 -->
          <MenuSelectTable
            ref="menuSelectRef"
            :checked-keys="slotProps.value"
            :association="formApi.form.values.menuCheckStrictly"
            :menus="menuTree"
            @update:association="handleMenuCheckStrictlyChange"
          />
        </div>
      </template>
    </BasicForm>
  </BasicDrawer>
</template>
