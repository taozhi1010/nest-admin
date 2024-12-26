<template>
  <div class="markdown-body">
    <div v-html="resultStr"></div>
  </div>
</template>

<script setup>
/* 安装流程
 * pnpm install markdown-it
 * pnpm install highlight.js
 * pnpm install clipboard --save
 * https://juejin.cn/post/6844904105970761741?searchId=20241219215618B6B10490F62417012BAF
 */

import MarkdownIt from 'markdown-it'
import Clipboard from 'clipboard'
import 'highlight.js/styles/github-dark.css'
import '@/assets/styles/github-markdown.scss'
import '@/assets/styles/github-markdown-dark.scss'
import '@/assets/styles/github-markdown-light.scss'

const props = defineProps({
  value: {
    type: String,
    default: ''
  }
})

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str, lang) {
    // 当前时间加随机数生成唯一的id标识
    const codeIndex = parseInt(Date.now()) + Math.floor(Math.random() * 10000000)
    // 复制功能主要使用的是 clipboard.js
    let html = `<button class="copy-btn" type="button" data-clipboard-action="copy" data-clipboard-target="#copy${codeIndex}">复制</button>`
    const linesLength = str.split(/\n/).length - 1
    // 生成行号
    let linesNum = '<span aria-hidden="true" class="line-numbers-rows">'
    for (let index = 0; index < linesLength; index++) {
      linesNum = linesNum + '<span></span>'
    }
    linesNum += '</span>'
    if (lang && hljs.getLanguage(lang)) {
      try {
        // highlight.js 高亮代码
        const preCode = hljs.highlight(lang, str, true).value
        html = html + preCode
        if (linesLength) {
          html += '<b class="name">' + lang + '</b>'
        }
        // 将代码包裹在 textarea 中，由于防止textarea渲染出现问题，这里将 "<" 用 "&lt;" 代替，不影响复制功能
        return `<pre class="hljs"><code>${html}</code>${linesNum}</pre><textarea style="position: absolute;top: -9999px;left: -9999px;z-index: -9999;" id="copy${codeIndex}">${str.replace(
          /<\/textarea>/g,
          '&lt;/textarea>'
        )}</textarea>`
      } catch (error) {
        console.log(error)
      }
    }

    const preCode = md.utils.escapeHtml(str)
    html = html + preCode
    return `<pre class="hljs"><code>${html}</code>${linesNum}</pre><textarea style="position: absolute;top: -9999px;left: -9999px;z-index: -9999;" id="copy${codeIndex}">${str.replace(
      /<\/textarea>/g,
      '&lt;/textarea>'
    )}</textarea>`
  }
})

const result = ref('')
result.value = md.render(props.value)

onMounted(() => {
  const clipboard = new Clipboard('.copy-btn')

  console.log(clipboard)
  clipboard.on('success', function (e) {
    e.clearSelection()
  })
  clipboard.on('error', function (e) {
    console.error('Action:', e.action)
    console.error('Trigger:', e.trigger)
  })
})

const resultStr = computed(() => {
  const val = props.value
  let result = ''
  if (val !== null && typeof val !== 'undefined' && val !== '') {
    result = md.render(val)
  }
  return result || ''
})

// watch(
//   props.value,
//   (val) => {
//     nextTick(() => {
//       if (val !== null && typeof val !== 'undefined' && val !== '') {
//         result.value = md.render(val)
//       }
//     })
//   },
//   {
//     immediate: true
//   }
// )
</script>

<style lang="scss">
.markdown-body {
  box-sizing: border-box;
  min-width: 200px;
  max-width: 980px;
  margin: 0 auto;
  padding: 18px;
}

@media (max-width: 767px) {
  .markdown-body {
    padding: 15px;
  }
}

.hljs {
  padding: 12px 2px 12px 40px !important;
  border-radius: 5px !important;
  position: relative;
  font-size: 14px !important;
  line-height: 22px !important;
  overflow: hidden !important;

  code {
    display: block !important;
    margin: 0 10px !important;
    overflow-x: auto !important;

    &::-webkit-scrollbar {
      z-index: 11;
      width: 6px;
    }
    &::-webkit-scrollbar:horizontal {
      height: 6px;
    }
    &::-webkit-scrollbar-thumb {
      border-radius: 5px;
      width: 6px;
      background: #666;
    }
    &::-webkit-scrollbar-corner,
    &::-webkit-scrollbar-track {
      background: #1e1e1e;
    }
    &::-webkit-scrollbar-track-piece {
      background: #1e1e1e;
      width: 6px;
    }
  }
  .line-numbers-rows {
    position: absolute;
    pointer-events: none;
    top: 12px;
    bottom: 12px;
    left: 0;
    font-size: 100%;
    width: 40px;
    text-align: center;
    letter-spacing: -1px;
    border-right: 1px solid rgba(0, 0, 0, 0.35);
    user-select: none;
    counter-reset: linenumber;
    span {
      pointer-events: none;
      display: block;
      counter-increment: linenumber;
      &:before {
        content: counter(linenumber);
        color: #999;
        display: block;
        text-align: center;
      }
    }
  }
  b.name {
    position: absolute;
    top: 2px;
    right: 50px;
    z-index: 10;
    color: #999;
    pointer-events: none;
  }
}

.hljs {
  position: relative;

  .copy-btn {
    position: absolute;
    right: 16px;
    top: 0;
    z-index: 99;
    color: #333;
    padding: 4px;
    cursor: pointer;
    background-color: #fff;
    border: 0;
    border-radius: 2px;
  }
}
</style>
