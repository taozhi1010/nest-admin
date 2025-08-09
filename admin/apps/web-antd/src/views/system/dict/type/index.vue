<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';

import type { VxeGridProps } from '#/adapter/vxe-table';
import type { DictType } from '#/api/system/dict/dict-type-model';

import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { getVxePopupContainer } from '@vben/utils';

import { Modal, Popconfirm, Space } from 'ant-design-vue';

import { useVbenVxeGrid, vxeCheckboxChecked } from '#/adapter/vxe-table';
import {
  dictTypeExport,
  dictTypeList,
  dictTypeRemove,
  refreshDictTypeCache,
} from '#/api/system/dict/dict-type';
import { commonDownloadExcel } from '#/utils/file/download';

import { emitter } from '../mitt';
import { columns, querySchema } from './data';
import dictTypeModal from './dict-type-modal.vue';

const formOptions: VbenFormProps = {
  commonConfig: {
    labelWidth: 70,
    componentProps: {
      allowClear: true,
    },
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
    // trigger: 'row',
  },
  columns,
  height: 'auto',
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues = {}) => {
        return await dictTypeList({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
        });
      },
    },
  },
  rowConfig: {
    keyField: 'dictId',
  },
  id: 'system-dict-type-index',
};

const lastDictType = ref('');

const [BasicTable, tableApi] = useVbenVxeGrid({
  formOptions,
  gridOptions,
  gridEvents: {
    cellClick: (e) => {
      const { row } = e;
      if (lastDictType.value === row.dictType) {
        return;
      }
      emitter.emit('rowClick', row.dictType);
      lastDictType.value = row.dictType;
    },
  },
});
const [DictTypeModal, modalApi] = useVbenModal({
  connectedComponent: dictTypeModal,
});

function handleAdd() {
  modalApi.setData({});
  modalApi.open();
}

async function handleEdit(record: DictType) {
  modalApi.setData({ id: record.dictId });
  modalApi.open();
}

async function handleDelete(row: DictType) {
  await dictTypeRemove([row.dictId]);
  await tableApi.query();
}

function handleMultiDelete() {
  const rows = tableApi.grid.getCheckboxRecords();
  const ids = rows.map((row: DictType) => row.dictId);
  Modal.confirm({
    title: '提示',
    okType: 'danger',
    content: `确认删除选中的${ids.length}条记录吗？`,
    onOk: async () => {
      await dictTypeRemove(ids);
      await tableApi.query();
    },
  });
}

async function handleRefreshCache() {
  await refreshDictTypeCache();
  await tableApi.query();
}

function handleDownloadExcel() {
  commonDownloadExcel(
    dictTypeExport,
    '字典类型数据',
    tableApi.formApi.form.values,
  );
}
</script>

<template>
  <div>
    <BasicTable id="dict-type" table-title="字典类型列表">
      <template #toolbar-tools>
        <Space>
          <a-button
            v-access:code="['system:dict:edit']"
            @click="handleRefreshCache"
          >
            刷新缓存
          </a-button>
          <a-button
            v-access:code="['system:dict:export']"
            @click="handleDownloadExcel"
          >
            {{ $t('pages.common.export') }}
          </a-button>
          <a-button
            :disabled="!vxeCheckboxChecked(tableApi)"
            danger
            type="primary"
            v-access:code="['system:dict:remove']"
            @click="handleMultiDelete"
          >
            {{ $t('pages.common.delete') }}
          </a-button>
          <a-button
            type="primary"
            v-access:code="['system:dict:add']"
            @click="handleAdd"
          >
            {{ $t('pages.common.add') }}
          </a-button>
        </Space>
      </template>
      <template #action="{ row }">
        <Space>
          <ghost-button
            v-access:code="['system:dict:edit']"
            @click.stop="handleEdit(row)"
          >
            {{ $t('pages.common.edit') }}
          </ghost-button>
          <Popconfirm
            :get-popup-container="
              (node) => getVxePopupContainer(node, 'dict-type')
            "
            placement="left"
            title="确认删除？"
            @confirm="handleDelete(row)"
          >
            <ghost-button
              danger
              v-access:code="['system:dict:remove']"
              @click.stop=""
            >
              {{ $t('pages.common.delete') }}
            </ghost-button>
          </Popconfirm>
        </Space>
      </template>
    </BasicTable>
    <DictTypeModal @reload="tableApi.query()" />
  </div>
</template>
