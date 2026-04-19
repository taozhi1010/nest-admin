<template>
  <div class="markdown-body">
    <MdEditor v-model="content" :preview="true" :previewOnly="true" :toolbars="[]" />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'

const props = defineProps({
  value: {
    type: String,
    default: ''
  }
})

const content = ref(props.value)

watch(() => props.value, (newVal) => {
  content.value = newVal
})
</script>

<style lang="scss">
.markdown-body {
  box-sizing: border-box;
  min-width: 200px;
  max-width: 980px;
  margin: 0 auto;
}

@media (max-width: 767px) {
  .markdown-body {
    padding: 15px;
  }
}
</style>