<script setup lang="ts">
import { ref } from 'vue';
import { Page, useVbenModal, type VbenFormProps } from '@vben/common-ui';
import { Card, Input, Modal, Space, Textarea } from 'ant-design-vue';
import { vxeCheckboxChecked, useVbenVxeGrid, type VxeGridProps } from '#/adapter/vxe-table';
import { deleteCacheName, deleteCacheKey, clearAllCache, getCacheNames, getCacheKeys, getCacheValue } from '#/api/monitor/cache';
import type { CacheNameItem, CacheValueItem } from '#/api/monitor/cache/model';
import { columns, keyColumns } from './data';

// 缓存列表表格配置
const gridOptions: VxeGridProps = {
  checkboxConfig: {
    highlight: true,
    reserve: true,
  },
  columns,
  height: 'auto',
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async () => {
        const res = await getCacheNames();
        return {
          rows: res,
          total: res.length,
        };
      },
    },
  },
  rowConfig: {
    keyField: 'cacheName',
  },
  id: 'monitor-cache-list',
};

// 键名列表表格配置
const keyGridOptions: VxeGridProps = {
  checkboxConfig: {
    highlight: true,
    reserve: true,
  },
  columns: keyColumns,
  height: 'auto',
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async () => {
        if (!selectedCache.value) return { result: [], total: 0 };
        const res = await getCacheKeys(selectedCache.value);
        const result = res.map((key) => ({ cacheKey: key }));
        return {
          rows: result,
          total: result.length,
        };
      },
    },
  },
  rowConfig: {
    keyField: 'cacheKey',
  },
  id: 'monitor-cache-keys',
};

const checked = ref(false);
const keyChecked = ref(false);
const selectedCache = ref('');
const selectedKey = ref('');
const cacheValue = ref<CacheValueItem>();

const [BasicTable, tableApi] = useVbenVxeGrid({
  gridOptions,
  gridEvents: {
    checkboxChange: vxeCheckboxChecked(checked),
    checkboxAll: vxeCheckboxChecked(checked),
    cellClick: handleCacheClick,
  },
});

const [KeyTable, keyTableApi] = useVbenVxeGrid({
  gridOptions: keyGridOptions,
  gridEvents: {
    checkboxChange: vxeCheckboxChecked(keyChecked),
    checkboxAll: vxeCheckboxChecked(keyChecked),
    cellClick: handleKeyClick,
  },
});

// 选中缓存
async function handleCacheClick({ row }: { row: CacheNameItem }) {
  if (row.cacheName === selectedCache.value) return;
  selectedCache.value = row.cacheName;
  selectedKey.value = '';
  cacheValue.value = undefined;
  await keyTableApi.query();
}

// 选中键名
async function handleKeyClick({ row }: { row: { cacheKey: string } }) {
  if (!selectedCache.value || row.cacheKey === selectedKey.value) return;
  selectedKey.value = row.cacheKey;
  try {
    const res = await getCacheValue(selectedCache.value, row.cacheKey);
    cacheValue.value = res;
  } catch (error) {
    console.error('获取缓存值失败:', error);
  }
}

// 删除缓存
function handleDelete(record: any) {
  Modal.confirm({
    title: '警告',
    content: '是否确认删除该缓存项？',
    type: 'warning',
    onOk: async () => {
      try {
        if (record.cacheKey) {
          await deleteCacheKey(record.cacheKey);
        } else {
          await deleteCacheName(record.cacheName);
        }
        await refresh();
      } catch (error) {
        console.error('删除失败:', error);
      }
    },
  });
}

// 批量删除缓存
function handleMultiDelete(isKey = false) {
  const api = isKey ? keyTableApi : tableApi;
  const rows = api.grid.getCheckboxRecords();
  const count = rows.length;

  Modal.confirm({
    title: '警告',
    content: `是否确认删除选中的${count}条记录？`,
    type: 'warning',
    onOk: async () => {
      try {
        for (const row of rows) {
          if (isKey) {
            await deleteCacheKey(row.cacheKey);
          } else {
            await deleteCacheName(row.cacheName);
          }
        }
        await refresh();
      } catch (error) {
        console.error('批量删除失败:', error);
      }
    },
  });
}

// 清空所有缓存
function handleClearAll() {
  Modal.confirm({
    title: '警告',
    content: '是否确认清空所有缓存？',
    type: 'warning',
    onOk: async () => {
      try {
        await clearAllCache();
        await refresh();
      } catch (error) {
        console.error('清空失败:', error);
      }
    },
  });
}

// 刷新数据
async function refresh() {
  await tableApi.query();
  if (selectedCache.value) {
    await keyTableApi.query();
  }
  checked.value = false;
  keyChecked.value = false;
}

// 格式化缓存值显示
function formatCacheValue(value: string) {
  try {
    const parsed = JSON.parse(value);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return value;
  }
}

// 初始加载
refresh();
</script>

<template>
  <Page :auto-content-height="true">
    <div class="flex flex-col lg:flex-row gap-4 h-full">
      <!-- 缓存列表 -->
      <BasicTable table-title="缓存列表" class="flex-1">
        <template #toolbar-tools>
          <Space>
            <a-button :disabled="!checked" danger type="primary" @click="handleMultiDelete(false)"> 批量删除 </a-button>
            <a-button type="primary" danger @click="handleClearAll"> 清空全部 </a-button>
          </Space>
        </template>
        <template #action="{ row }">
          <Space>
            <a-button type="link" danger @click.stop="handleDelete(row)"> 删除 </a-button>
          </Space>
        </template>
      </BasicTable>

      <!-- 键名列表 -->
      <KeyTable :table-title="`键名列表 ${selectedCache ? `(${selectedCache})` : ''}`" class="flex-1">
        <template #toolbar-tools>
          <Space>
            <a-button :disabled="!keyChecked" danger type="primary" @click="handleMultiDelete(true)"> 批量删除 </a-button>
          </Space>
        </template>
        <template #action="{ row }">
          <Space>
            <a-button type="link" danger @click.stop="handleDelete(row)"> 删除 </a-button>
          </Space>
        </template>
      </KeyTable>
      <Card class="flex-1 overflow-hidden" :title="`缓存内容 ${selectedCache && selectedKey ? `(${selectedCache}:${selectedKey})` : ''}`">
        <div class="p-0" v-if="selectedKey">
          <div class="mb-4">
            <div class="font-bold mb-2">缓存名称：</div>
            <Input :value="selectedCache" readonly />
          </div>
          <div class="mb-4">
            <div class="font-bold mb-2">缓存键名：</div>
            <Input :value="selectedKey" readonly />
          </div>
          <div class="mb-4">
            <div class="font-bold mb-2">缓存内容：</div>
            <Textarea
              v-if="cacheValue"
              :value="formatCacheValue(cacheValue.cacheValue)"
              :auto-size="{ minRows: 5, maxRows: 26 }"
              readonly
            />
            <Textarea v-else placeholder="请选择缓存键名查看内容" :auto-size="{ minRows: 3, maxRows: 10 }" readonly />
          </div>
          <div v-if="cacheValue?.remark">
            <div class="font-bold mb-2">备注：</div>
            <div>{{ cacheValue.remark }}</div>
          </div>
        </div>
        <div v-if="!selectedKey" class="flex items-center justify-center text-gray-500 h-full">请先选择一个缓存键名以查看内容。</div>
      </Card>
    </div>
  </Page>
</template>

<style scoped>
pre {
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
