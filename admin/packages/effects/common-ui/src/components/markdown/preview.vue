<script setup lang="ts">
import {
  onBeforeUnmount,
  onMounted,
  shallowRef,
  useTemplateRef,
  watch,
} from 'vue';

import { usePreferences } from '@vben/preferences';

import Vditor from 'vditor';

import 'vditor/dist/index.css';

interface Props {
  height?: number | string;
  options?: IOptions;
}

const props = withDefaults(defineProps<Props>(), {
  height: 500,
  options: () => ({}),
});

const emit = defineEmits<{
  // 初始化 cdn加载完成
  mounted: [];
}>();

// 挂载节点
const vditorRef = useTemplateRef('vditorRef');
// 编辑器实例
const vditorInstance = shallowRef<null | Vditor>(null);

// 监听主题切换x
const { isDark, locale } = usePreferences();
watch(isDark, (dark) => {
  const theme = dark ? 'dark' : 'light';
  vditorInstance.value?.setTheme(dark ? 'dark' : 'classic', theme, theme);
});

// 双向绑定
const content = defineModel('value', {
  type: String,
  default: '',
});

/**
 * 由于不能输入 需要使用watch监听
 */
watch(content, (value) => {
  vditorInstance.value?.setValue(value);
});

onMounted(() => {
  vditorInstance.value = new Vditor(vditorRef.value!, {
    mode: 'wysiwyg',
    value: content.value,
    height: props.height,
    // 开启打字机模式
    // typewriterMode: true,
    lang: locale.value.replace('-', '_') as any,
    cache: {
      enable: false,
    },
    theme: isDark.value ? 'dark' : 'classic',
    // 预览(只读模式) 不显示工具栏
    toolbar: [],
    // 加载完成的事件
    after() {
      emit('mounted');
      // 禁用编辑器
      vditorInstance.value?.disabled();
    },
    ...props.options,
  });
});

onBeforeUnmount(() => {
  vditorInstance.value?.destroy();
  vditorInstance.value = null;
});
</script>

<template>
  <div ref="vditorRef"></div>
</template>

<style>
.vditor-wysiwyg pre.vditor-reset[contenteditable='false'] {
  cursor: unset;
  opacity: 1;
}

/**
dark模式样式需要重置
*/
.vditor--dark .vditor-reset {
  color: #d1d5da;
}
</style>
