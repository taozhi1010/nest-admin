<script setup lang="ts">
import type { EchartsUIType } from '@vben/plugins/echarts';

import { onActivated, onMounted, ref, watch } from 'vue';

import { EchartsUI, useEcharts } from '@vben/plugins/echarts';

interface Props {
  data?: { name: string; value: string }[];
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
});

const chartRef = ref<EchartsUIType>();
const { renderEcharts, resize } = useEcharts(chartRef);

watch(
  () => props.data,
  () => {
    if (!chartRef.value) return;
    setEchartsOption(props.data);
  },
  { immediate: true },
);

onMounted(() => {
  setEchartsOption(props.data);
});
/**
 * 从其他页面切换回来会有一个奇怪的动画效果 需要调用resize
 * 该饼图组件需要关闭animation
 */
onActivated(() => resize(false));

type EChartsOption = Parameters<typeof renderEcharts>['0'];
function setEchartsOption(data: any[]) {
  const option: EChartsOption = {
    series: [
      {
        animationDuration: 1000,
        animationEasing: 'cubicInOut',
        center: ['50%', '50%'],
        data,
        name: '命令',
        radius: [15, 95],
        roseType: 'radius',
        type: 'pie',
      },
    ],
    tooltip: {
      formatter: '{a} <br/>{b} : {c} ({d}%)',
      trigger: 'item',
    },
  };
  renderEcharts(option);
}
</script>

<template>
  <EchartsUI ref="chartRef" height="400px" width="100%" />
</template>
