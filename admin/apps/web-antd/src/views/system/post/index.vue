<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';

import type { VxeGridProps } from '#/adapter/vxe-table';
import type { Post } from '#/api/system/post/model';

import { ref } from 'vue';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { getVxePopupContainer } from '@vben/utils';

import { Modal, Popconfirm, Space } from 'ant-design-vue';

import { useVbenVxeGrid, vxeCheckboxChecked } from '#/adapter/vxe-table';
import { postExport, postList, postRemove } from '#/api/system/post';
import { commonDownloadExcel } from '#/utils/file/download';
import DeptTree from '#/views/system/user/dept-tree.vue';

import { columns, querySchema } from './data';
import postDrawer from './post-drawer.vue';

// 左边部门用
const selectDeptId = ref<string[]>([]);
const formOptions: VbenFormProps = {
  commonConfig: {
    labelWidth: 80,
    componentProps: {
      allowClear: true,
    },
  },
  schema: querySchema(),
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  handleReset: async () => {
    selectDeptId.value = [];

    const { formApi, reload } = tableApi;
    await formApi.resetForm();
    const formValues = formApi.form.values;
    formApi.setLatestSubmissionValues(formValues);
    await reload(formValues);
  },
};

const gridOptions: VxeGridProps = {
  checkboxConfig: {
    // 高亮
    highlight: true,
    // 翻页时保留选中状态
    reserve: true,
    trigger: 'cell',
  },
  columns,
  height: 'auto',
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues = {}) => {
        // 部门树选择处理
        if (selectDeptId.value.length === 1) {
          formValues.belongDeptId = selectDeptId.value[0];
        } else {
          Reflect.deleteProperty(formValues, 'belongDeptId');
        }

        return await postList({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
        });
      },
    },
  },
  rowConfig: {
    keyField: 'postId',
  },
  id: 'system-post-index',
};

const [BasicTable, tableApi] = useVbenVxeGrid({
  formOptions,
  gridOptions,
});

const [PostDrawer, drawerApi] = useVbenDrawer({
  connectedComponent: postDrawer,
});

function handleAdd() {
  drawerApi.setData({});
  drawerApi.open();
}

async function handleEdit(record: Post) {
  drawerApi.setData({ id: record.postId });
  drawerApi.open();
}

async function handleDelete(row: Post) {
  await postRemove([row.postId]);
  await tableApi.query();
}

function handleMultiDelete() {
  const rows = tableApi.grid.getCheckboxRecords();
  const ids = rows.map((row: Post) => row.postId);
  Modal.confirm({
    title: '提示',
    okType: 'danger',
    content: `确认删除选中的${ids.length}条记录吗？`,
    onOk: async () => {
      await postRemove(ids);
      await tableApi.query();
    },
  });
}

function handleDownloadExcel() {
  commonDownloadExcel(postExport, '岗位信息', tableApi.formApi.form.values);
}
</script>

<template>
  <Page :auto-content-height="true" content-class="flex gap-[8px] w-full">
    <DeptTree
      v-model:select-dept-id="selectDeptId"
      class="w-[260px]"
      @reload="() => tableApi.reload()"
      @select="() => tableApi.reload()"
    />
    <BasicTable class="flex-1 overflow-hidden" table-title="岗位列表">
      <template #toolbar-tools>
        <Space>
          <a-button
            v-access:code="['system:post:export']"
            @click="handleDownloadExcel"
          >
            {{ $t('pages.common.export') }}
          </a-button>
          <a-button
            :disabled="!vxeCheckboxChecked(tableApi)"
            danger
            type="primary"
            v-access:code="['system:post:remove']"
            @click="handleMultiDelete"
          >
            {{ $t('pages.common.delete') }}
          </a-button>
          <a-button
            type="primary"
            v-access:code="['system:post:add']"
            @click="handleAdd"
          >
            {{ $t('pages.common.add') }}
          </a-button>
        </Space>
      </template>
      <template #action="{ row }">
        <Space>
          <GhostButton
            v-access:code="['system:post:edit']"
            @click="handleEdit(row)"
          >
            {{ $t('pages.common.edit') }}
          </GhostButton>
          <Popconfirm
            :get-popup-container="getVxePopupContainer"
            placement="left"
            title="确认删除？"
            @confirm="handleDelete(row)"
          >
            <GhostButton
              danger
              v-access:code="['system:post:remove']"
              @click.stop=""
            >
              {{ $t('pages.common.delete') }}
            </GhostButton>
          </Popconfirm>
        </Space>
      </template>
    </BasicTable>
    <PostDrawer @reload="tableApi.query()" />
  </Page>
</template>
