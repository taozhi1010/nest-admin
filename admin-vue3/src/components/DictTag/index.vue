<template>
  <!-- 命中字典项：按后端配置的 elTagType 渲染彩色标签 -->
  <el-tag v-if="matched" :type="matched.elTagType || 'default'" effect="light" size="small">{{ matched.label }}</el-tag>
  <!-- 未命中但有值：以 info 标签展示原值，保持信息可见 -->
  <el-tag v-else-if="hasValue" type="info" effect="light" size="small">{{ value }}</el-tag>
</template>

<script setup lang="ts">
import useDictStore from '@/store/modules/dict';

const props = defineProps({
  // 字典类型
  type: {
    type: String,
    required: true
  },
  // 字典值（null/undefined/'' 不渲染任何内容）
  value: {
    type: [String, Number],
    default: undefined
  }
});

const dictStore = useDictStore();

const matched = computed(() => (dictStore.getDict(props.type) || []).find((item) => item.value == props.value));
const hasValue = computed(() => props.value !== undefined && props.value !== null && props.value !== '');

// 字典缺失时触发加载（store 层自带本地缓存与并发请求去重）
watchEffect(() => {
  if (!dictStore.getDict(props.type)) {
    dictStore.loadDict(props.type).catch(() => {});
  }
});
</script>
