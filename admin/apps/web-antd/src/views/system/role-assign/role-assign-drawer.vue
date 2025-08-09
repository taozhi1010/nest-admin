<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';

import type { VxeGridProps } from '#/adapter/vxe-table';

import { useRoute } from 'vue-router';

import { useVbenDrawer } from '@vben/common-ui';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { roleSelectAll, roleUnallocatedList } from '#/api/system/role';

import { columns, querySchema } from './data';

const emit = defineEmits<{ reload: [] }>();

const [BasicDrawer, drawerApi] = useVbenDrawer({
  onConfirm: handleSubmit,
  onCancel: handleReset,
});

const route = useRoute();
const roleId = route.params.roleId as string;

const formOptions: VbenFormProps = {
  commonConfig: {
    labelWidth: 80,
  },
  schema: querySchema(),
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
};

const gridOptions: VxeGridProps = {
  checkboxConfig: {
    // 高亮
    highlight: true,
    // 翻页时保留选中状态
    reserve: true,
    // 点击行选中
    trigger: 'row',
  },
  columns: columns?.filter((item) => item.field !== 'action'),
  height: 'auto',
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues = {}) => {
        return await roleUnallocatedList({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          roleId,
          ...formValues,
        });
      },
    },
  },
  rowConfig: {
    keyField: 'userId',
  },
};

const [BasicTable, tableApi] = useVbenVxeGrid({
  formOptions,
  gridOptions,
});

async function handleSubmit() {
  const records = tableApi.grid.getCheckboxRecords();
  const userIds = records.map((item) => item.userId);
  if (userIds.length > 0) {
    await roleSelectAll(roleId, userIds);
  }
  handleReset();
  emit('reload');
}

function handleReset() {
  drawerApi.close();
}
</script>

<template>
  <BasicDrawer class="w-[800px]" title="选择用户">
    <BasicTable />
  </BasicDrawer>
</template>
