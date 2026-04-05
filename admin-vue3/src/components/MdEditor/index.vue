<template>
  <div class="md-editor-container" :style="{ height }">
    <div class="md-editor-header">
      <div class="md-editor-toolbar">
        <el-button-group>
          <el-button size="small" @click="insertText('# ', '标题')">
            H1
          </el-button>
          <el-button size="small" @click="insertText('## ', '标题')">
            H2
          </el-button>
          <el-button size="small" @click="insertText('**', '**', '粗体')">
            B
          </el-button>
          <el-button size="small" @click="insertText('*', '*', '斜体')">
            I
          </el-button>
          <el-button size="small" @click="insertText('\n- ', '列表项')">
            UL
          </el-button>
          <el-button size="small" @click="insertText('[', '](url)', '链接')">
            Link
          </el-button>
          <el-button size="small" @click="insertText('![', '](url)', '图片')">
            Img
          </el-button>
          <el-button size="small" @click="insertText('\n```\n', '\n```\n', '代码块')">
            Code
          </el-button>
        </el-button-group>
        <div class="md-editor-mode-switch">
          <el-radio-group v-model="viewMode" size="small">
            <el-radio-button value="edit">编辑</el-radio-button>
            <el-radio-button value="preview">预览</el-radio-button>
            <el-radio-button value="split">分屏</el-radio-button>
          </el-radio-group>
        </div>
      </div>
    </div>
    <div class="md-editor-body">
      <div v-if="viewMode === 'edit' || viewMode === 'split'" class="md-editor-pane md-editor-pane--left">
        <textarea
          ref="textareaRef"
          v-model="editorValue"
          class="md-editor-textarea"
          :placeholder="placeholder"
          @input="handleInput"
        />
      </div>
      <div v-if="viewMode === 'preview' || viewMode === 'split'" class="md-editor-pane md-editor-pane--right">
        <div class="md-editor-preview markdown-body" v-html="previewHtml" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'

// 初始化 markdown-it
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: (str, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value
      } catch (__) {}
    }
    return ''
  }
})

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  height: {
    type: String,
    default: '400px'
  },
  mode: {
    type: String,
    default: 'edit'
  },
  placeholder: {
    type: String,
    default: '请输入内容（支持 Markdown 语法）'
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const editorValue = ref(props.modelValue)
const textareaRef = ref(null)
const viewMode = ref('split')

// 计算预览 HTML
const previewHtml = computed(() => {
  return md.render(editorValue.value)
})

// 同步到父组件
const handleInput = () => {
  emit('update:modelValue', editorValue.value)
  emit('change', {
    text: editorValue.value,
    html: previewHtml.value
  })
}

// 监听 props 变化
watch(() => props.modelValue, (newVal) => {
  editorValue.value = newVal
})

// 插入文本
const insertText = (before, after = '', placeholder = '') => {
  const textarea = textareaRef.value
  if (!textarea) return
  
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const text = editorValue.value
  const selectedText = text.substring(start, end)
  
  let insertContent = ''
  if (selectedText) {
    insertContent = before + selectedText + (after || before)
  } else {
    insertContent = before + placeholder + (after || before)
  }
  
  editorValue.value = text.substring(0, start) + insertContent + text.substring(end)
  
  // 设置光标位置
  nextTick(() => {
    textarea.focus()
    const newCursorPos = start + insertContent.length
    textarea.setSelectionRange(newCursorPos, newCursorPos)
  })
  
  handleInput()
}
</script>

<style scoped lang="scss">
.md-editor-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
  
  .md-editor-header {
    border-bottom: 1px solid #e4e7ed;
    background: #f5f7fa;
    
    .md-editor-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      
      :deep(.el-button-group) {
        display: flex;
        flex-wrap: wrap;
        gap: 2px;
      }
      
      .md-editor-mode-switch {
        margin-left: 12px;
      }
    }
  }
  
  .md-editor-body {
    flex: 1;
    display: flex;
    overflow: hidden;
    
    .md-editor-pane {
      flex: 1;
      overflow-y: auto;
      
      &--left {
        border-right: 1px solid #e4e7ed;
      }
    }
    
    .md-editor-textarea {
      width: 100%;
      height: 100%;
      min-height: 200px;
      padding: 16px;
      font-size: 14px;
      font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
      line-height: 1.6;
      border: none;
      outline: none;
      resize: none;
      background: #fff;
      color: #303133;
      
      &::placeholder {
        color: #c0c4cc;
      }
      
      &:focus {
        background: #fafafa;
      }
    }
    
    .md-editor-preview {
      padding: 16px;
      
      :deep(h1) {
        margin: 24px 0 16px;
        padding-bottom: 8px;
        font-size: 2em;
        border-bottom: 1px solid #eaecef;
      }
      
      :deep(h2) {
        margin: 24px 0 16px;
        padding-bottom: 8px;
        font-size: 1.5em;
        border-bottom: 1px solid #eaecef;
      }
      
      :deep(p) {
        margin: 16px 0;
        line-height: 1.6;
      }
      
      :deep(ul), :deep(ol) {
        padding-left: 2em;
        margin: 16px 0;
      }
      
      :deep(li) {
        margin: 8px 0;
      }
      
      :deep(code) {
        padding: 0.2em 0.4em;
        font-size: 85%;
        background: #f6f8fa;
        border-radius: 3px;
      }
      
      :deep(pre) {
        padding: 16px;
        overflow: auto;
        font-size: 85%;
        line-height: 1.45;
        background: #f6f8fa;
        border-radius: 6px;
        
        code {
          padding: 0;
          font-size: 100%;
          background: transparent;
        }
      }
      
      :deep(blockquote) {
        margin: 16px 0;
        padding: 0 1em;
        color: #6a737d;
        border-left: 0.25em solid #dfe2e5;
      }
      
      :deep(a) {
        color: #0366d6;
        text-decoration: none;
        
        &:hover {
          text-decoration: underline;
        }
      }
      
      :deep(img) {
        max-width: 100%;
        height: auto;
      }
      
      :deep(table) {
        width: 100%;
        margin: 16px 0;
        border-collapse: collapse;
        
        th, td {
          padding: 6px 13px;
          border: 1px solid #dfe2e5;
        }
        
        th {
          font-weight: 600;
          background: #f6f8fa;
        }
      }
    }
  }
}
</style>
