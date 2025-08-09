<script setup lang="ts">
import { ref, onMounted, onUnmounted, onBeforeUnmount } from 'vue';
import { Page } from '@vben/common-ui';
import { Description } from '#/components/description';
import { Table, Card, Button, Progress } from 'ant-design-vue';
import { getServerInfo } from '#/api/monitor/server';
import { cpuSchema, memSchema, sysSchema, columns } from './data';
import { ReloadOutlined } from '@ant-design/icons-vue';

const loading = ref(true);
const serverInfo = ref<any>({});
const refreshProgress = ref(0);
const refreshInterval = ref<number>();

// 刷新进度条
function updateProgress() {
  refreshProgress.value = (refreshProgress.value + 1) % 100;
}

// 重置进度条
function resetProgress() {
  refreshProgress.value = 0;
}

async function getInfo(isLoading = true) {
  try {
    if (isLoading) {
      loading.value = true;
    }
    const data = await getServerInfo();
    serverInfo.value = data;
  } finally {
    if (isLoading) {
      loading.value = false;
    }
  }
}

// 手动刷新
function handleRefresh() {
  resetProgress();
  getInfo(false);
}

// 设置定时刷新
function setupAutoRefresh() {
  // 清除现有的定时器
  window.clearInterval(refreshInterval.value);

  // 重置进度
  resetProgress();

  // 设置进度条更新定时器 (50ms更新一次，5000ms/100=50ms)
  const progressTimer = window.setInterval(updateProgress, 50);

  // 设置数据刷新定时器
  refreshInterval.value = window.setInterval(() => {
    getInfo(false);
    // 重置进度条
    resetProgress();
  }, 5000);

  return progressTimer;
}

const customRow = (record: any) => {
  return {
    style: {
      backgroundImage: `linear-gradient(to right, #f5f5f5 0%, #f5f5f5 ${record.usage}%, #ffffff ${record.usage}%)`,
    },
  };
};

onMounted(() => {
  getInfo();
  const progressTimer = setupAutoRefresh();

  onUnmounted(() => {
    window.clearInterval(progressTimer);
    window.clearInterval(refreshInterval.value);
  });
});
</script>

<template>
  <Page>
    <div class="flex flex-col gap-4">
      <!-- 顶部工具栏 -->
      <div class="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
        <span class="text-lg font-medium">服务器监控</span>
        <div class="flex items-center gap-4">
          <div class="w-[200px]">
            <Progress :percent="refreshProgress" :show-info="false" :stroke-width="4" status="active" />
          </div>
          <Button type="primary" :loading="loading" @click="handleRefresh">
            <template #icon>
              <ReloadOutlined />
            </template>
            刷新
          </Button>
        </div>
      </div>

      <!-- 监控卡片 -->
      <div class="grid gap-4 md:grid-cols-2">
        <!-- CPU信息 -->
        <Card title="CPU信息" :loading="loading">
          <Description :data="serverInfo.cpu" :schema="cpuSchema" :column="2" layout="vertical" />
        </Card>

        <!-- 内存信息 -->
        <Card title="内存信息" :loading="loading">
          <Description :data="serverInfo.mem" :schema="memSchema" :column="2" />
        </Card>

        <!-- 服务器信息 -->
        <Card title="服务器信息" :loading="loading">
          <Description :data="serverInfo.sys" :schema="sysSchema" :column="2" layout="vertical" />
        </Card>

        <!-- 磁盘信息 -->
        <Card title="磁盘信息" :loading="loading">
          <Table :columns="columns" :data-source="serverInfo.sysFiles" :pagination="false" size="small" :customRow="customRow" />
        </Card>
      </div>
    </div>
  </Page>
</template>

<style scoped>
:deep(.ant-progress-bg) {
  transition: all 0.4s cubic-bezier(0.08, 0.82, 0.17, 1) 0s;
}
</style>
