<template>
  <Page auto-content-height>
    <BasicTable table-title="调度日志列表">
      <template #toolbar-tools>
        <Space>
          <a-button v-access:code="['monitor:job-log:export']" @click="handleDownloadExcel">导出</a-button>
          <a-button @click="handleClose">返回</a-button>
        </Space>
      </template>

      <template #createTime="{ row }">
        <span>{{ row.createTime }}</span>
      </template>
    </BasicTable>
  </Page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Page, type VbenFormProps } from '@vben/common-ui';
import { Modal, Space } from 'ant-design-vue';
import { tableCheckboxEvent, useVbenVxeGrid, type VxeGridProps } from '#/adapter/vxe-table';
import { getJob, jobLogExport } from '#/api/monitor/job';
import { listJobLog, delJobLog, cleanJobLog } from '#/api/monitor/job';
import { logColumns, logQuerySchema } from './data';
import { commonDownloadExcel } from '#/utils/file/download';

type JobLogItem = {
  jobLogId: number;
  jobName: string;
  jobGroup: string;
  createTime: string;
  invokeTarget: string;
  jobMessage: string;
  status: string;
  exceptionInfo: string;
};

const route = useRoute();
const router = useRouter();

const checked = ref(false);

const formOptions: VbenFormProps = {
  commonConfig: {
    labelWidth: 80,
    componentProps: {
      allowClear: true,
    },
  },
  schema: logQuerySchema(),
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
};

const gridOptions: VxeGridProps = {
  checkboxConfig: {
    highlight: true,
    reserve: true,
   //  trigger: 'row',
  },
  columns: logColumns,
  height: 'auto',
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    autoLoad: false,
    ajax: {
      query: async ({ page }) => {
        const formValues = await tableApi.formApi.getValues();
        return await listJobLog({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
        });
      },
    },
  },
  rowConfig: {
    isHover: true,
    keyField: 'jobLogId',
  },
  id: 'monitor-job-log-index',
};

const [BasicTable, tableApi] = useVbenVxeGrid({
  formOptions,
  gridOptions,
  gridEvents: {},
});

function handleClose() {
  router.push('/monitor/job');
}

function handleDownloadExcel() {
  commonDownloadExcel(jobLogExport, '调度日志记录数据', tableApi.formApi.form.values, {
    fieldMappingTime: formOptions.fieldMappingTime,
  });
}

// 初始化
onMounted(async () => {
  const jobId = route.params?.jobId as string;
  if (jobId && jobId !== '0') {
    const res = await getJob(jobId);
    await tableApi.formApi.setValues({
      jobName: res.jobName,
      jobGroup: res.jobGroup,
    });
  }
  await tableApi.query();
});
</script>
