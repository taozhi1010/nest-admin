<template>
  <div class="markdown-viewer">
    <MdPreview :modelValue="content" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { MdPreview } from 'md-editor-v3'
import 'md-editor-v3/lib/preview.css'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

// 使用计算属性直接绑定，保持响应�?
const content = computed(() => props.modelValue)
</script>

<style lang="scss" scoped>
.markdown-viewer {
  width: 100%;
  min-height: 200px;
  padding: 16px;
  box-sizing: border-box;
  overflow-x: auto;
}
</style>