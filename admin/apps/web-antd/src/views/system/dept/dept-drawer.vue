<script setup lang="ts">
import type { Dept } from '#/api/system/dept/model';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { addFullName, cloneDeep, listToTree } from '@vben/utils';

import { useVbenForm } from '#/adapter/form';
import {
  deptAdd,
  deptInfo,
  deptList,
  deptNodeList,
  deptUpdate,
} from '#/api/system/dept';
import { listUserByDeptId } from '#/api/system/user';

import { drawerSchema } from './data';

const emit = defineEmits<{ reload: [] }>();

interface DrawerProps {
  id?: number | string;
  update: boolean;
}

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
    labelWidth: 80,
  },
  schema: drawerSchema(),
  showDefaultActions: false,
  wrapperClass: 'grid-cols-2',
});

async function getDeptTree(deptId?: number | string, exclude = false) {
  let ret: Dept[] = [];
  ret = await (!deptId || exclude ? deptList({}) : deptNodeList(deptId));
  const treeData = listToTree(ret, { id: 'deptId', pid: 'parentId' });
  // 添加部门名称 如 xx-xx-xx
  addFullName(treeData, 'deptName', ' / ');
  return treeData;
}

async function initDeptSelect(deptId?: number | string) {
  // 需要动态更新TreeSelect组件 这里允许为空
  const treeData = await getDeptTree(deptId, !isUpdate.value);
  formApi.updateSchema([
    {
      componentProps: {
        fieldNames: { label: 'deptName', value: 'deptId' },
        showSearch: true,
        treeData,
        treeDefaultExpandAll: true,
        treeLine: { showLeafIcon: false },
        // 选中后显示在输入框的值
        treeNodeLabelProp: 'fullName',
      },
      fieldName: 'parentId',
    },
  ]);
}

/**
 * 部门管理员下拉框 更新时才会enable
 * @param deptId
 */
async function initDeptUsers(deptId: number | string) {
  const ret = await listUserByDeptId(deptId);
  const options = ret.map((user) => ({
    label: `${user.username} | ${user.nickName}`,
    value: user.userId,
  }));
  formApi.updateSchema([
    {
      componentProps: {
        disabled: ret.length === 0,
        options,
        placeholder: ret.length === 0 ? '该部门暂无用户' : '请选择部门负责人',
      },
      fieldName: 'leader',
    },
  ]);
}

async function setLeaderOptions() {
  formApi.updateSchema([
    {
      componentProps: {
        disabled: true,
        options: [],
        placeholder: '仅在更新时可选部门负责人',
      },
      fieldName: 'leader',
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

    const { id, update } = drawerApi.getData() as DrawerProps;
    isUpdate.value = update;

    if (id) {
      await formApi.setFieldValue('parentId', id);
      if (update) {
        const record = await deptInfo(id);
        await formApi.setValues(record);
      }
    }

    await (update && id ? initDeptUsers(id) : setLeaderOptions());
    /** 部门选择 下拉框 */
    await initDeptSelect(id);

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
    await (isUpdate.value ? deptUpdate(data) : deptAdd(data));
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
    <BasicForm />
  </BasicDrawer>
</template>
