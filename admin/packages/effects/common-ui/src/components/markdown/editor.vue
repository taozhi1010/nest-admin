<script setup lang="ts">
import type { PropType } from 'vue';

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

const props = defineProps({
  // 编辑器高度
  height: {
    // string或者number类型
    type: [String, Number],
    default: 500,
  },
  /**
   * 编辑模式。默认值: 'wysiwyg'
   * wysiwyg: 所见即所得
   * ir: 即时渲染
   * sv: 分屏预览
   */
  mode: {
    type: String as PropType<'ir' | 'sv' | 'wysiwyg'>,
    default: 'wysiwyg',
  },
  // 编辑器唯一ID 缓存使用 可记录上次输入
  id: {
    type: String,
    required: false,
    default: '',
    validator(value, props) {
      if (!value && props.enableCache) {
        console.warn('The id is required when enableCache is true');
        return false;
      }
      return true;
    },
  },
  enableCache: {
    type: Boolean,
    default: false,
  },
  // 禁用编辑器
  disabled: {
    type: Boolean,
    default: false,
  },
  // 其他配置项
  options: {
    type: Object as PropType<IOptions>,
    default: () => ({}),
  },
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
 * 为了保持外部直接(v-model)与编辑器内部的同步
 * 注意: 下面的input事件也会触发watch
 */
watch(content, (value) => {
  vditorInstance.value?.setValue(value);
});

// 监听禁用
function changeDisabled(disabled: boolean) {
  if (disabled) {
    vditorInstance.value?.disabled();
  } else {
    vditorInstance.value?.enable();
  }
}
watch(() => props.disabled, changeDisabled);

onMounted(() => {
  vditorInstance.value = new Vditor(vditorRef.value!, {
    mode: props.mode,
    value: content.value,
    height: props.height,
    lang: locale.value.replace('-', '_') as any,
    cache: {
      enable: props.enableCache,
      id: props.id,
    },
    theme: isDark.value ? 'dark' : 'classic',
    // 手动响应式
    input(value) {
      content.value = value;
    },
    // 加载完成的事件
    after() {
      // 需要初始化就禁用的情况
      changeDisabled(props.disabled);
      emit('mounted');
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
