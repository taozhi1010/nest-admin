<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';

import type { VxeGridProps } from '#/adapter/vxe-table';
import type { Tenant } from '#/api/system/tenant/model';

import { computed } from 'vue';

import { useAccess } from '@vben/access';
import { Fallback, Page, useVbenDrawer } from '@vben/common-ui';
import { getVxePopupContainer } from '@vben/utils';

import { Modal, Popconfirm, Space } from 'ant-design-vue';

import { useVbenVxeGrid, vxeCheckboxChecked } from '#/adapter/vxe-table';
import {
  dictSyncTenant,
  tenantExport,
  tenantList,
  tenantRemove,
  tenantStatusChange,
  tenantSyncPackage,
} from '#/api/system/tenant';
import { TableSwitch } from '#/components/table';
import { useTenantStore } from '#/store/tenant';
import { commonDownloadExcel } from '#/utils/file/download';

import { columns, querySchema } from './data';
import tenantDrawer from './tenant-drawer.vue';

const formOptions: VbenFormProps = {
  commonConfig: {
    labelWidth: 80,
    componentProps: {
      allowClear: true,
    },
  },
  schema: querySchema(),
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
};

const gridOptions: VxeGridProps = {
  checkboxConfig: {
    // 高亮
    highlight: true,
    // 翻页时保留选中状态
    reserve: true,
    // 点击行选中
    // trigger: 'row',
    checkMethod: ({ row }) => row?.id !== 1,
  },
  columns,
  height: 'auto',
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues = {}) => {
        return await tenantList({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
        });
      },
    },
  },
  rowConfig: {
    keyField: 'id',
  },
  id: 'system-tenant-index',
};

const [BasicTable, tableApi] = useVbenVxeGrid({
  formOptions,
  gridOptions,
});

const [TenantDrawer, drawerApi] = useVbenDrawer({
  connectedComponent: tenantDrawer,
});

function handleAdd() {
  drawerApi.setData({});
  drawerApi.open();
}

async function handleEdit(record: Tenant) {
  drawerApi.setData({ id: record.id });
  drawerApi.open();
}

async function handleSync(record: Tenant) {
  const { tenantId, packageId } = record;
  await tenantSyncPackage(tenantId, packageId);
  await tableApi.query();
}

const tenantStore = useTenantStore();
async function handleDelete(row: Tenant) {
  await tenantRemove([row.id]);
  await tableApi.query();
  // 重新加载租户信息
  tenantStore.initTenant();
}

function handleMultiDelete() {
  const rows = tableApi.grid.getCheckboxRecords();
  const ids = rows.map((row: Tenant) => row.id);
  Modal.confirm({
    title: '提示',
    okType: 'danger',
    content: `确认删除选中的${ids.length}条记录吗？`,
    onOk: async () => {
      await tenantRemove(ids);
      await tableApi.query();
      // 重新加载租户信息
      tenantStore.initTenant();
    },
  });
}

function handleDownloadExcel() {
  commonDownloadExcel(tenantExport, '租户数据', tableApi.formApi.form.values);
}

/**
 * 与后台逻辑相同
 * 只有超级管理员能访问租户相关
 */
const { hasAccessByCodes, hasAccessByRoles } = useAccess();

const isSuperAdmin = computed(() => {
  return hasAccessByRoles(['superadmin']);
});

function handleSyncTenantDict() {
  Modal.confirm({
    title: '提示',
    iconType: 'warning',
    content: '确认同步租户字典？',
    onOk: async () => {
      await dictSyncTenant();
      await tableApi.query();
    },
  });
}
</script>

<template>
  <Page v-if="isSuperAdmin" :auto-content-height="true">
    <BasicTable table-title="租户列表">
      <template #toolbar-tools>
        <Space>
          <a-button
            v-access:code="['system:tenant:edit']"
            @click="handleSyncTenantDict"
          >
            同步租户字典
          </a-button>
          <a-button
            v-access:code="['system:tenant:export']"
            @click="handleDownloadExcel"
          >
            {{ $t('pages.common.export') }}
          </a-button>
          <a-button
            :disabled="!vxeCheckboxChecked(tableApi)"
            danger
            type="primary"
            v-access:code="['system:tenant:remove']"
            @click="handleMultiDelete"
          >
            {{ $t('pages.common.delete') }}
          </a-button>
          <a-button
            type="primary"
            v-access:code="['system:tenant:add']"
            @click="handleAdd"
          >
            {{ $t('pages.common.add') }}
          </a-button>
        </Space>
      </template>
      <template #status="{ row }">
        <TableSwitch
          v-model="row.status"
          :api="() => tenantStatusChange(row)"
          :disabled="row.id === 1 || !hasAccessByCodes(['system:tenant:edit'])"
          :reload="() => tableApi.query()"
        />
      </template>
      <template #action="{ row }">
        <Space v-if="row.id !== 1">
          <ghost-button
            v-access:code="['system:tenant:edit']"
            @click="handleEdit(row)"
          >
            {{ $t('pages.common.edit') }}
          </ghost-button>
          <Popconfirm
            :get-popup-container="getVxePopupContainer"
            :title="`确认同步[${row.companyName}]的套餐吗?`"
            placement="left"
            @confirm="handleSync(row)"
          >
            <ghost-button
              class="btn-success"
              v-access:code="['system:tenant:edit']"
            >
              {{ $t('pages.common.sync') }}
            </ghost-button>
          </Popconfirm>
          <Popconfirm
            :get-popup-container="getVxePopupContainer"
            placement="left"
            title="确认删除？"
            @confirm="handleDelete(row)"
          >
            <ghost-button
              danger
              v-access:code="['system:tenant:remove']"
              @click.stop=""
            >
              {{ $t('pages.common.delete') }}
            </ghost-button>
          </Popconfirm>
        </Space>
      </template>
    </BasicTable>
    <TenantDrawer @reload="tableApi.query()" />
  </Page>
  <Fallback v-else description="您没有租户的访问权限" status="403" />
</template>
