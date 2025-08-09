<script setup lang="tsx">
import { computed } from 'vue';

import { Tag } from 'ant-design-vue';

defineOptions({ name: 'OptionsTag' });

const props = defineProps<{
  options: { color?: string; label: string; value: number | string }[];
  value: number | string;
}>();

const found = computed(() =>
  props.options.find((item) => item.value === props.value),
);
</script>

<template>
  <Tag v-if="found" :color="found.color">{{ found.label }}</Tag>
  <span v-else>未知</span>
</template>
