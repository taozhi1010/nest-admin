<template>
  <Page auto-content-height>
    <BasicTable table-title="定时任务列表">
      <template #toolbar-tools>
        <Space>
          <a-button type="primary" v-access:code="['monitor:job:add']" @click="handleAdd">新增</a-button>
          <a-button :disabled="!checked" danger type="primary" v-access:code="['monitor:job:remove']" @click="handleMultiDelete"
            >删除</a-button
          >
          <a-button v-access:code="['monitor:job:export']" @click="handleDownloadExcel">导出</a-button>
          <a-button v-access:code="['monitor:job:query']" @click="handleJobLog">日志</a-button>
        </Space>
      </template>

      <template #status="{ row }">
        <TableSwitch v-model="row.status" :api="() => handleStatusChange(row)" :reload="() => tableApi.query()" />
      </template>

      <template #action="{ row }">
        <TableAction :actions="actions" :row="row" />
      </template>
    </BasicTable>
    <JobInfoModal @reload="tableApi.query()" />
  </Page>
</template>

<script setup lang="ts">
import type { Recordable } from '@vben/types';

import { ref } from 'vue';

import { Page, useVbenModal, type VbenFormProps } from '@vben/common-ui';

import { Modal, Space } from 'ant-design-vue';

import { vxeCheckboxChecked, useVbenVxeGrid, type VxeGridProps } from '#/adapter/vxe-table';
import { listJob, getJob, delJob, runJob, changeJobStatus, jobExport } from '#/api/monitor/job';
import { commonDownloadExcel } from '#/utils/file/download';

import { columns, querySchema } from './data';
import JobModal from './job-modal.vue';

import { useRouter } from 'vue-router';

import TableSwitch from '#/components/table/src/table-switch.vue';
import TableAction from '#/components/table/src/table-action.vue';
import type { ActionItem } from '#/components/table/src/types';

const router = useRouter();

const actions: ActionItem[] = [
  {
    label: '修改',
    key: 'edit',
    auth: ['monitor:job:edit'],
    onClick: handleUpdate,
  },
  {
    label: '删除',
    key: 'delete',
    auth: ['monitor:job:remove'],
    danger: true,
    popConfirm: {
      title: '确认删除？',
    },
    onClick: handleDelete,
  },
  {
    label: '执行一次',
    key: 'run',
    auth: ['monitor:job:changeStatus'],
    onClick: handleRun,
  },
  {
    label: '日志',
    key: 'log',
    auth: ['monitor:job:query'],
    onClick: handleJobLog,
  },
];

const formOptions: VbenFormProps = {
  commonConfig: {
    labelWidth: 80,
    componentProps: {
      allowClear: true,
    },
  },
  schema: querySchema(),
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
};

const gridOptions: VxeGridProps = {
  checkboxConfig: {
    highlight: true,
    reserve: true,
    trigger: 'row',
  },
  columns,
  height: 'auto',
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues) => {
        return await listJob({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
        });
      },
    },
  },
  rowConfig: {
    isHover: true,
    keyField: 'jobId',
  },
  id: 'monitor-job-index',
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

const [JobInfoModal, modalApi] = useVbenModal({
  connectedComponent: JobModal,
});

async function handleDelete(row: Recordable<any>) {
  Modal.confirm({
    title: '确认删除',
    content: '是否确认删除该定时任务?',
    async onOk() {
      await delJob(row.jobId);
      await tableApi.query();
    },
  });
}

function handleMultiDelete() {
  const rows = tableApi.grid.getCheckboxRecords();
  const ids = rows.map((row: any) => row.jobId);
  Modal.confirm({
    title: '确认删除',
    content: `是否确认删除选中的${ids.length}条定时任务?`,
    async onOk() {
      await delJob(ids);
      await tableApi.query();
      checked.value = false;
    },
  });
}

async function handleRun(row: Recordable<any>) {
  Modal.confirm({
    title: '确认执行',
    content: `确认要立即执行一次"${row.jobName}"任务吗?`,
    async onOk() {
      await runJob(row.jobId, row.jobGroup);
      await tableApi.query();
    },
  });
}

async function handleStatusChange(row: Recordable<any>) {
  const text = row.status === '0' ? '启用' : '停用';
  Modal.confirm({
    title: '确认修改',
    content: `确认要"${text}""${row.jobName}"任务吗?`,
    async onOk() {
      await changeJobStatus(row.jobId, row.status);
      await tableApi.query();
    },
  });
}

function handleJobLog(row?: Recordable<any>) {
  const jobId = row?.jobId || 0;
  router.push(`/monitor/job-log/${jobId}`);
}

function handleDownloadExcel() {
  commonDownloadExcel(jobExport, '定时任务数据', tableApi.formApi.form.values, {
    fieldMappingTime: formOptions.fieldMappingTime,
  });
}

function handleAdd() {
  modalApi.setData({
    status: '0',
    misfirePolicy: '1',
    concurrent: '1',
  });
  modalApi.open();
}

async function handleUpdate(row?: Recordable<any>) {
  let jobId;
  if (row) {
    jobId = row.jobId;
  } else {
    const rows = tableApi.grid.getCheckboxRecords();
    if (rows.length !== 1) {
      return;
    }
    jobId = rows[0].jobId;
  }
  const res = await getJob(jobId);
  modalApi.setData(res);
  modalApi.open();
}
</script>
