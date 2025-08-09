<script setup lang="ts">
import { useVbenModal, type VbenFormProps } from '@vben/common-ui';

import { useVbenVxeGrid, type VxeGridProps } from '#/adapter/vxe-table';
import {
  getDataSourceNames,
  importTable,
  readyToGenList,
} from '#/api/tool/gen';

const emit = defineEmits<{ reload: [] }>();

const formOptions: VbenFormProps = {
  schema: [
    {
      label: '数据源',
      fieldName: 'dataName',
      component: 'Select',
      defaultValue: 'master',
    },
    {
      label: '表名称',
      fieldName: 'tableName',
      component: 'Input',
    },
    {
      label: '表描述',
      fieldName: 'tableComment',
      component: 'Input',
    },
  ],
  commonConfig: {
    labelWidth: 60,
  },
  showCollapseButton: false,
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
};

const gridOptions: VxeGridProps = {
  checkboxConfig: {
    highlight: true,
    reserve: true,
    trigger: 'row',
  },
  columns: [
    {
      type: 'checkbox',
      width: 60,
    },
    {
      title: '表名称',
      field: 'tableName',
      align: 'left',
    },
    {
      title: '表描述',
      field: 'tableComment',
    },
    {
      title: '创建时间',
      field: 'createTime',
    },
    {
      title: '更新时间',
      field: 'updateTime',
    },
  ],
  keepSource: true,
  size: 'small',
  minHeight: 400,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues = {}) => {
        return await readyToGenList({
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
  toolbarConfig: {
    refresh: false,
    zoom: false,
    custom: false,
  },
};

const [BasicTable, tableApi] = useVbenVxeGrid({ formOptions, gridOptions });

const [BasicModal, modalApi] = useVbenModal({
  onOpenChange: async (isOpen) => {
    if (!isOpen) {
      tableApi.grid.clearCheckboxRow();
      return null;
    }
    const ret = await getDataSourceNames();
    const dataSourceOptions = ret.map((item) => ({ label: item, value: item }));
    tableApi.formApi.updateSchema([
      {
        fieldName: 'dataName',
        componentProps: {
          options: dataSourceOptions,
        },
      },
    ]);
  },
  onConfirm: handleSubmit,
});

async function handleSubmit() {
  try {
    const records = tableApi.grid.getCheckboxRecords();
    const tables = records.map((item) => item.tableName);
    if (tables.length === 0) {
      modalApi.close();
      return;
    }
    modalApi.modalLoading(true);
    const { dataName } = await tableApi.formApi.getValues();
    await importTable(tables.join(','), dataName);
    emit('reload');
    modalApi.close();
  } catch (error) {
    console.warn(error);
  } finally {
    modalApi.modalLoading(false);
  }
}
</script>

<template>
  <BasicModal class="w-[800px]" title="导入表">
    <BasicTable />
  </BasicModal>
</template>
