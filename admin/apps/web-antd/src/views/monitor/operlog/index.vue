<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';

import type { VxeGridProps } from '#/adapter/vxe-table';
import type { PageQuery } from '#/api/common';
import type { OperationLog } from '#/api/monitor/operlog/model';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { Modal, Space } from 'ant-design-vue';

import {
  addSortParams,
  useVbenVxeGrid,
  vxeCheckboxChecked,
} from '#/adapter/vxe-table';
import {
  operLogClean,
  operLogDelete,
  operLogExport,
  operLogList,
} from '#/api/monitor/operlog';
import { commonDownloadExcel } from '#/utils/file/download';
import { confirmDeleteModal } from '#/utils/modal';

import { columns, querySchema } from './data';
import operationPreviewDrawer from './operation-preview-drawer.vue';

const formOptions: VbenFormProps = {
  commonConfig: {
    labelWidth: 80,
    componentProps: {
      allowClear: true,
    },
  },
  schema: querySchema(),
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  // 日期选择格式化
  fieldMappingTime: [
    [
      'createTime',
      ['params[beginTime]', 'params[endTime]'],
      ['YYYY-MM-DD 00:00:00', 'YYYY-MM-DD 23:59:59'],
    ],
  ],
};

const gridOptions: VxeGridProps<OperationLog> = {
  checkboxConfig: {
    // 高亮
    highlight: true,
    // 翻页时保留选中状态
    reserve: true,
    // 点击行选中
    trigger: 'row',
  },
  columns,
  height: 'auto',
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page, sorts }, formValues = {}) => {
        const params: PageQuery = {
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
        };
        // 添加排序参数
        addSortParams(params, sorts);
        return await operLogList(params);
      },
    },
  },
  rowConfig: {
    keyField: 'operId',
  },
  sortConfig: {
    // 远程排序
    remote: true,
    // 支持多字段排序 默认关闭
    multiple: true,
  },
  id: 'monitor-operlog-index',
};

const [BasicTable, tableApi] = useVbenVxeGrid({
  formOptions,
  gridOptions,
  gridEvents: {
    // 排序 重新请求接口
    sortChange: () => tableApi.query(),
  },
});

const [OperationPreviewDrawer, drawerApi] = useVbenDrawer({
  connectedComponent: operationPreviewDrawer,
});

/**
 * 预览
 * @param record 操作日志记录
 */
function handlePreview(record: OperationLog) {
  drawerApi.setData({ record });
  drawerApi.open();
}

/**
 * 清空全部日志
 */
function handleClear() {
  confirmDeleteModal({
    onValidated: async () => {
      await operLogClean();
      await tableApi.reload();
    },
  });
}
/**
 * 删除日志
 */
async function handleDelete() {
  const rows = tableApi.grid.getCheckboxRecords();
  const ids = rows.map((row: OperationLog) => row.operId);
  Modal.confirm({
    title: '提示',
    okType: 'danger',
    content: `确认删除选中的${ids.length}条操作日志吗？`,
    onOk: async () => {
      await operLogDelete(ids);
      await tableApi.query();
    },
  });
}

function handleDownloadExcel() {
  commonDownloadExcel(operLogExport, '操作日志', tableApi.formApi.form.values, {
    fieldMappingTime: formOptions.fieldMappingTime,
  });
}
</script>

<template>
  <Page :auto-content-height="true">
    <BasicTable table-title="操作日志列表">
      <template #toolbar-tools>
        <Space>
          <a-button
            v-access:code="['monitor:operlog:remove']"
            @click="handleClear"
          >
            {{ $t('pages.common.clear') }}
          </a-button>
          <a-button
            v-access:code="['monitor:operlog:export']"
            @click="handleDownloadExcel"
          >
            {{ $t('pages.common.export') }}
          </a-button>
          <a-button
            :disabled="!vxeCheckboxChecked(tableApi)"
            danger
            type="primary"
            v-access:code="['monitor:operlog:remove']"
            @click="handleDelete"
          >
            {{ $t('pages.common.delete') }}
          </a-button>
        </Space>
      </template>
      <template #action="{ row }">
        <ghost-button
          v-access:code="['monitor:operlog:list']"
          @click.stop="handlePreview(row)"
        >
          {{ $t('pages.common.preview') }}
        </ghost-button>
      </template>
    </BasicTable>
    <OperationPreviewDrawer />
  </Page>
</template>
