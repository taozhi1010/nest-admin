<template>
  <el-scrollbar ref="scrollContainer" class="scroll-container" :vertical="false" @wheel.prevent="handleScroll">
    <slot></slot>
  </el-scrollbar>
</template>

<script setup lang="ts">
import { useEventListener } from '@vueuse/core';

import useTagsViewStore from '@/store/modules/tagsView';

const tagAndTagSpacing = ref(4);
const scrollContainer = ref(null);

const scrollWrapper = computed(() => {
  if (scrollContainer.value) {
    return scrollContainer.value.$refs.wrapRef;
  }
  return null;
});

function handleScroll(e) {
  const eventDelta = e.wheelDelta || -e.deltaY * 40;
  const $scrollWrapper = scrollWrapper.value;
  $scrollWrapper.scrollLeft = $scrollWrapper.scrollLeft + eventDelta / 4;
}
const emits = defineEmits(['scroll']);
const emitScroll = () => {
  emits('scroll');
};
// capture 沿用原监听；目标为 el-scrollbar 内部 wrap，挂载后 useEventListener 自动挂接并随组件卸载清理
useEventListener(scrollWrapper, 'scroll', emitScroll, { capture: true });

const tagsViewStore = useTagsViewStore();
const visitedViews = computed(() => tagsViewStore.visitedViews);

function moveToTarget(currentTag) {
  if (!scrollContainer.value) return;

  const $container = scrollContainer.value.$el;
  const $containerWidth = $container.offsetWidth;
  const $scrollWrapper = scrollWrapper.value;

  let firstTag = null;
  let lastTag = null;

  // find first tag and last tag
  if (visitedViews.value.length > 0) {
    firstTag = visitedViews.value[0];
    lastTag = visitedViews.value[visitedViews.value.length - 1];
  }

  if (firstTag === currentTag) {
    $scrollWrapper.scrollLeft = 0;
  } else if (lastTag === currentTag) {
    $scrollWrapper.scrollLeft = $scrollWrapper.scrollWidth - $containerWidth;
  } else {
    const tagListDom = document.getElementsByClassName('tags-view-item');
    const currentIndex = visitedViews.value.findIndex((item) => item === currentTag);
    let prevTag = null;
    let nextTag = null;
    for (const k in tagListDom) {
      if (k !== 'length' && Object.hasOwnProperty.call(tagListDom, k)) {
        if (tagListDom[k].dataset.path === visitedViews.value[currentIndex - 1].path) {
          prevTag = tagListDom[k];
        }
        if (tagListDom[k].dataset.path === visitedViews.value[currentIndex + 1].path) {
          nextTag = tagListDom[k];
        }
      }
    }

    // the tag's offsetLeft after of nextTag
    const afterNextTagOffsetLeft = nextTag.offsetLeft + nextTag.offsetWidth + tagAndTagSpacing.value;

    // the tag's offsetLeft before of prevTag
    const beforePrevTagOffsetLeft = prevTag.offsetLeft - tagAndTagSpacing.value;
    if (afterNextTagOffsetLeft > $scrollWrapper.scrollLeft + $containerWidth) {
      $scrollWrapper.scrollLeft = afterNextTagOffsetLeft - $containerWidth;
    } else if (beforePrevTagOffsetLeft < $scrollWrapper.scrollLeft) {
      $scrollWrapper.scrollLeft = beforePrevTagOffsetLeft;
    }
  }
}

defineExpose({
  moveToTarget
});
</script>

<style lang="scss" scoped>
.scroll-container {
  white-space: nowrap;
  position: relative;
  overflow: hidden;
  width: 100%;
  :deep(.el-scrollbar__bar) {
    bottom: 0px;
  }
  :deep(.el-scrollbar__wrap) {
    height: 39px;
  }
}
</style>
