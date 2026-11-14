<script setup lang="ts">
import { lang, setLang } from './i18n'
</script>

<template>
  <div class="lang-switch" role="group" aria-label="Language">
    <button
      type="button"
      aria-label="中文"
      :class="{ active: lang === 'zh' }"
      @click="setLang('zh')"
    >
      中
    </button>
    <button
      type="button"
      aria-label="English"
      :class="{ active: lang === 'en' }"
      @click="setLang('en')"
    >
      EN
    </button>
  </div>
</template>
