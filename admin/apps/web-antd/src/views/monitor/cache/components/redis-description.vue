<script setup lang="ts">
import type { RedisInfo } from '#/api/monitor/cache';
import type { DescItem } from '#/components/description';

import { onMounted, watch } from 'vue';

import { Description, useDescription } from '#/components/description';

interface IRedisInfo extends RedisInfo {
  dbSize: string;
}

const props = defineProps<{ data: IRedisInfo }>();

const descSchemas: DescItem[] = [
  { field: 'redis_version', label: 'redis版本' },
  {
    field: 'redis_mode',
    label: 'redis模式',
    render(value) {
      return value === 'standalone' ? '单机模式' : '集群模式';
    },
  },
  {
    field: 'tcp_port',
    label: 'tcp端口',
  },
  {
    field: 'connected_clients',
    label: '客户端数',
  },
  {
    field: 'uptime_in_days',
    label: '运行时间',
    render(value) {
      return `${value}天`;
    },
  },
  {
    field: 'used_memory_human',
    label: '使用内存',
  },
  {
    field: 'used_cpu_user_children',
    label: '使用CPU',
    render(value) {
      return Number.parseFloat(value).toFixed(2);
    },
  },
  {
    field: 'maxmemory_human',
    label: '内存配置',
  },
  {
    field: 'aof_enabled',
    label: 'AOF是否开启',
    render(value) {
      return value === '0' ? '否' : '是';
    },
  },
  {
    field: 'rdb_last_bgsave_status',
    label: 'RDB是否成功',
  },
  {
    field: 'dbSize',
    label: 'Key数量',
  },
  {
    field: 'instantaneous_input_kbps',
    label: '网络入口/出口',
    render(_, data) {
      const { instantaneous_input_kbps, instantaneous_output_kbps } = data;
      return `${instantaneous_input_kbps}kps/${instantaneous_output_kbps}kps`;
    },
  },
];

const [registerDescription, { setDescProps }] = useDescription({
  column: { lg: 4, md: 3, sm: 1, xl: 4, xs: 1 },
  schema: descSchemas,
});

onMounted(() => setDescProps({ data: props.data }));

watch(
  () => props.data,
  (data) => {
    setDescProps({ data });
  },
);
</script>

<template>
  <Description @register="registerDescription" />
</template>
