<script setup lang="ts">
import { computed, nextTick, ref, useTemplateRef, watch } from 'vue';
import CodeMirror from 'vue-codemirror6';

import { usePreferences } from '@vben/preferences';

import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';

import { type LanguageSupport, languageSupportMap } from './data';

const props = withDefaults(
  defineProps<{
    /**
     * 语言
     */
    language: LanguageSupport;
    /**
     * 只读
     */
    readonly?: boolean;
  }>(),
  {
    language: 'js',
    readonly: false,
  },
);

const codeMirrorRef =
  useTemplateRef<InstanceType<typeof CodeMirror>>('codeMirrorRef');

const { isDark } = usePreferences();

const modelValue = defineModel({ default: '', type: String });

const lang = computed(() => languageSupportMap[props.language] ?? javascript());

// 通过v-if 卸载挂载达到更新语言的目的
const langChanged = ref(true);
watch(
  () => props.language,
  () => {
    langChanged.value = false;
    nextTick(() => (langChanged.value = true));
  },
);
/** 插件 */
const extensions = [oneDark];
</script>

<template>
  <CodeMirror
    v-if="langChanged"
    v-bind="$attrs"
    ref="codeMirrorRef"
    v-model="modelValue"
    :dark="isDark"
    :extensions="extensions"
    :lang="lang"
    :readonly="props.readonly"
    basic
    wrap
  >
    <template v-for="slotName in Object.keys($slots)" #[slotName]="scope">
      <slot :name="slotName" v-bind="scope ?? {}"></slot>
    </template>
  </CodeMirror>
</template>
