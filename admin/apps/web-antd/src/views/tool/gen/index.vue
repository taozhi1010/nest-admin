<script setup lang="ts">
import type { Recordable } from '@vben/types';

import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { Page, useVbenModal, type VbenFormProps } from '@vben/common-ui';
import { getVxePopupContainer } from '@vben/utils';

import { message, Modal, Popconfirm, Space } from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  vxeCheckboxChecked,
  useVbenVxeGrid,
  type VxeGridProps,
} from '#/adapter/vxe-table';
import {
  batchGenCode,
  generatedList,
  genRemove,
  getDataSourceNames,
  syncDb,
} from '#/api/tool/gen';
import { downloadByData } from '#/utils/file/download';

import codePreviewModal from './code-preview-modal.vue';
import { columns, querySchema } from './data';
import tableImportModal from './table-import-modal.vue';

const formOptions: VbenFormProps = {
  schema: querySchema(),
  commonConfig: {
    labelWidth: 80,
    componentProps: {
      allowClear: true,
    },
  },
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

const gridOptions: VxeGridProps = {
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
      query: async ({ page }, formValues = {}) => {
        return await generatedList({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
        });
      },
    },
  },
  rowConfig: {
    isHover: true,
    keyField: 'tableId',
  },
  id: 'tool-gen-index',
};

const checked = ref(false);
const [BasicTable, tableApi] = useVbenVxeGrid({
  formOptions,
  gridOptions,
  gridEvents: {
    checkboxChange: vxeCheckboxChecked(checked),
    checkboxAll: vxeCheckboxChecked(checked),
  },
});

onMounted(async () => {
  // 获取数据源
  const ret = await getDataSourceNames();
  const dataSourceOptions = [{ label: '全部', value: '' }];
  const transOptions = ret.map((item) => ({ label: item, value: item }));
  dataSourceOptions.push(...transOptions);
  // 更新selectOptions
  tableApi.formApi.updateSchema([
    {
      fieldName: 'dataName',
      componentProps: {
        options: dataSourceOptions,
      },
    },
  ]);
});

const [CodePreviewModal, previewModalApi] = useVbenModal({
  connectedComponent: codePreviewModal,
});

function handlePreview(record: Recordable<any>) {
  previewModalApi.setData({ tableId: record.tableId });
  previewModalApi.open();
}

const router = useRouter();
function handleEdit(record: Recordable<any>) {
  router.push(`/code-gen/edit/${record.tableId}`);
}

async function handleSync(record: Recordable<any>) {
  await syncDb(record.tableId);
  await tableApi.query();
}

/**
 * 批量生成代码
 */
async function handleBatchGen() {
  const rows = tableApi.grid.getCheckboxRecords();
  const ids = rows.map((row: any) => row.tableId);
  if (ids.length === 0) {
    message.info('请选择需要生成代码的表');
    return;
  }
  const hideLoading = message.loading('下载中...');
  try {
    const params = ids.join(',');
    const data = await batchGenCode(params);
    const timestamp = Date.now();
    downloadByData(data, `批量代码生成_${timestamp}.zip`);
  } finally {
    hideLoading();
  }
}

async function handleDownload(record: Recordable<any>) {
  const hideLoading = message.loading('下载中...');
  try {
    const blob = await batchGenCode(record.tableId);
    const filename = `代码生成_${record.tableName}_${dayjs().valueOf()}.zip`;
    downloadByData(blob, filename);
  } catch (error) {
    console.error(error);
  } finally {
    hideLoading();
  }
}

/**
 * 删除
 * @param record
 */
async function handleDelete(record: Recordable<any>) {
  await genRemove(record.tableId);
  await tableApi.query();
}

function handleMultiDelete() {
  const rows = tableApi.grid.getCheckboxRecords();
  const ids = rows.map((row: any) => row.tableId);
  Modal.confirm({
    title: '提示',
    okType: 'danger',
    content: `确认删除选中的${ids.length}条记录吗？`,
    onOk: async () => {
      await genRemove(ids);
      await tableApi.query();
      checked.value = false;
    },
  });
}

const [TableImportModal, tableImportModalApi] = useVbenModal({
  connectedComponent: tableImportModal,
});

function handleImport() {
  tableImportModalApi.open();
}
</script>

<template>
  <Page :auto-content-height="true">
    <BasicTable table-title="代码生成列表">
      <template #toolbar-tools>
        <Space>
          <a-button
            :disabled="!checked"
            danger
            type="primary"
            v-access:code="['tool:gen:remove']"
            @click="handleMultiDelete"
          >
            {{ $t('pages.common.delete') }}
          </a-button>
          <a-button
            :disabled="!checked"
            v-access:code="['tool:gen:code']"
            @click="handleBatchGen"
          >
            {{ $t('pages.common.generate') }}
          </a-button>
          <a-button
            type="primary"
            v-access:code="['tool:gen:import']"
            @click="handleImport"
          >
            {{ $t('pages.common.import') }}
          </a-button>
        </Space>
      </template>
      <template #action="{ row }">
        <a-button
          size="small"
          type="link"
          v-access:code="['tool:gen:preview']"
          @click.stop="handlePreview(row)"
        >
          {{ $t('pages.common.preview') }}
        </a-button>
        <a-button
          size="small"
          type="link"
          v-access:code="['tool:gen:edit']"
          @click.stop="handleEdit(row)"
        >
          {{ $t('pages.common.edit') }}
        </a-button>
        <Popconfirm
          :get-popup-container="getVxePopupContainer"
          :title="`确认同步[${row.tableName}]?`"
          placement="left"
          @confirm="handleSync(row)"
        >
          <a-button
            size="small"
            type="link"
            v-access:code="['tool:gen:edit']"
            @click.stop=""
          >
            {{ $t('pages.common.sync') }}
          </a-button>
        </Popconfirm>
        <a-button
          size="small"
          type="link"
          v-access:code="['tool:gen:code']"
          @click.stop="handleDownload(row)"
        >
          生成代码
        </a-button>
        <Popconfirm
          :get-popup-container="getVxePopupContainer"
          :title="`确认删除[${row.tableName}]?`"
          placement="left"
          @confirm="handleDelete(row)"
        >
          <a-button
            danger
            size="small"
            type="link"
            v-access:code="['tool:gen:remove']"
            @click.stop=""
          >
            {{ $t('pages.common.delete') }}
          </a-button>
        </Popconfirm>
      </template>
    </BasicTable>
    <CodePreviewModal />
    <TableImportModal @reload="tableApi.query()" />
  </Page>
</template>
