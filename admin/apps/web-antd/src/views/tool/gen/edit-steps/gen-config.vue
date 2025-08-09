<script setup lang="ts">
import type { GenInfo } from '#/api/tool/gen/model';

import { inject, type Ref, unref } from 'vue';

import { message, Space } from 'ant-design-vue';
import { cloneDeep } from 'lodash-es';

import { useVbenVxeGrid, type VxeGridProps } from '#/adapter/vxe-table';
import { editSave } from '#/api/tool/gen';

import { toCurrentStep } from '../mitt';
import { validRules, vxeTableColumns } from './gen-data';

/**
 * 从父组件注入
 */
const genInfoData = inject('genInfoData') as Ref<GenInfo['info']>;

const gridOptions: VxeGridProps = {
  columns: vxeTableColumns,
  keepSource: true,
  editConfig: { trigger: 'click', mode: 'cell', showStatus: true },
  editRules: validRules,
  rowConfig: {
    isHover: true,
    keyField: 'id',
    isCurrent: true, // 高亮当前行
  },
  columnConfig: {
    resizable: true,
  },
  proxyConfig: {
    enabled: true,
  },
  toolbarConfig: {
    refresh: false,
    zoom: false,
    custom: false,
  },
  height: 'auto',
  pagerConfig: {
    enabled: false,
  },
  data: genInfoData.value.columns,
};

const [BasicTable, tableApi] = useVbenVxeGrid({ gridOptions });

async function handleSubmit() {
  try {
    const hasError = await tableApi.grid.validate();
    if (hasError) {
      message.error('校验未通过');
      return;
    }
    const requestData = cloneDeep(unref(genInfoData));
    // 从表格获取最新的
    requestData.columns = tableApi.grid.getData();
    // 树表需要添加这个参数
    if (requestData && requestData.tplCategory === 'tree') {
      const { treeCode, treeName, treeParentCode } = requestData;
      requestData.params = {
        treeCode,
        treeName,
        treeParentCode,
      };
    }
    // 需要进行参数转化
    if (requestData) {
      const transform = (ret: boolean) => (ret ? '1' : '0');
      requestData.columns.forEach((column) => {
        const { edit, insert, query, required, list } = column;
        column.isInsert = transform(insert);
        column.isEdit = transform(edit);
        column.isList = transform(list);
        column.isQuery = transform(query);
        column.isRequired = transform(required);
      });
      // 需要手动添加父级菜单 弹窗类型
      requestData.params = {
        ...requestData.params,
        parentMenuId: requestData.parentMenuId,
        popupComponent: requestData.popupComponent,
      };
    }
    await editSave(requestData);
    // 跳转到成功页面
    toCurrentStep(2);
  } catch (error: unknown) {
    console.error(error);
  }
}
</script>

<template>
  <div class="flex flex-col gap-[16px] p-[12px]">
    <div class="h-[calc(100vh-235px)] overflow-y-hidden">
      <BasicTable />
    </div>
    <div class="flex justify-center">
      <Space>
        <a-button @click="toCurrentStep(0)">上一步</a-button>
        <a-button type="primary" @click="handleSubmit">下一步</a-button>
      </Space>
    </div>
  </div>
</template>
