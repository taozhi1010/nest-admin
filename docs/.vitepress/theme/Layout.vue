<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import { onContentUpdated, useRoute } from 'vitepress'
import { nextTick, onMounted, onUnmounted, watch } from 'vue'
import LangSwitch from './LangSwitch.vue'
import { applyTitles } from './i18n'

const { Layout } = DefaultTheme
const route = useRoute()

let observer: MutationObserver | null = null
let scheduled: ReturnType<typeof setTimeout> | null = null
let applying = false

function scheduleApply() {
  if (scheduled) return
  scheduled = setTimeout(() => {
    scheduled = null
    if (applying) return
    applying = true
    applyTitles()
    applying = false
  }, 0)
}

onContentUpdated(() => {
  applyTitles()
  nextTick(applyTitles)
})

watch(
  () => route.path,
  () => nextTick(applyTitles),
  { flush: 'post' }
)

onMounted(() => {
  applyTitles()
  // 移动端菜单等界面在首屏之后才挂载，监听一次以保证标题同步
  observer = new MutationObserver(scheduleApply)
  observer.observe(document.body, { childList: true, subtree: true, characterData: true })
})

onUnmounted(() => {
  observer?.disconnect()
  observer = null
  if (scheduled) clearTimeout(scheduled)
})
</script>

<template>
  <Layout>
    <template #nav-bar-content-after>
      <LangSwitch />
    </template>
    <template #nav-screen-content-after>
      <LangSwitch class="lang-switch-screen" />
    </template>
  </Layout>
</template>
