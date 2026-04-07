<template>
  <MdEditor
    v-model="editorValue"
    :theme="theme"
    :preview="preview"
    :previewTheme="previewTheme"
    :codeTheme="codeTheme"
    :showCodeRowNumber="true"
    :toolbars="toolbars"
    :placeholder="placeholder"
    :height="height"
    :style="{ minHeight }"
    @onChange="handleChange"
    @onUploadImg="handleUploadImg"
  />
</template>

<script setup>
/**
 * Markdown 编辑器组件
 * 基于 md-editor-v3 封装
 * 官方文档: https://imzbf.github.io/md-editor-v3/
 */
import { ref, watch } from 'vue'
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  height: {
    type: String,
    default: '400px'
  },
  minHeight: {
    type: String,
    default: '75vh'
  },
  preview: {
    type: Boolean,
    default: true
  },
  theme: {
    type: String,
    default: 'light'
  },
  placeholder: {
    type: String,
    default: '请输入内容（支持 Markdown 语法）'
  }
})

const emit = defineEmits(['update:modelValue', 'change', 'upload-image'])

const editorValue = ref(props.modelValue)

const previewTheme = 'vuepress'
const codeTheme = 'atom'

const toolbars = [
  'bold',
  'underline',
  'italic',
  'strikeThrough',
  '-',
  'title',
  'sub',
  'sup',
  'quote',
  'unorderedList',
  'orderedList',
  'task',
  '-',
  'codeRow',
  'code',
  'link',
  'image',
  'table',
  'mermaid',
  'katex',
  '-',
  'revoke',
  'next',
  'save',
  '=',
  'pageFullscreen',
  'fullscreen',
  'preview',
  'htmlPreview',
  'catalog'
]

// 监听 props.modelValue 变化，同步到本地变量
watch(
  () => props.modelValue,
  (newVal) => {
    editorValue.value = newVal
  }
)

// 内容变化事件
const handleChange = (text, html) => {
  emit('update:modelValue', text)
  emit('change', { text, html })
}

// 图片上传事件
const handleUploadImg = async (files, callback) => {
  // 默认处理：将图片转为 Base64
  try {
    const file = files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const base64 = e.target.result
      callback([base64])
    }
    reader.readAsDataURL(file)
  } catch (error) {
    console.error('图片上传失败:', error)
  }
}
</script>
