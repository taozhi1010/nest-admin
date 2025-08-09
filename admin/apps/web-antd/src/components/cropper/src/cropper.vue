<script lang="ts" setup>
import type { CSSProperties, PropType } from 'vue';

import { computed, onMounted, onUnmounted, ref, unref, useAttrs } from 'vue';

import { useDebounceFn } from '@vueuse/core';
import Cropper from 'cropperjs';

import 'cropperjs/dist/cropper.css';

type Options = Cropper.Options;

defineOptions({ name: 'CropperImage' });

const props = defineProps({
  alt: { default: '', type: String },
  circled: { default: false, type: Boolean },
  crossorigin: {
    default: undefined,
    type: String as PropType<'' | 'anonymous' | 'use-credentials' | undefined>,
  },
  height: { default: '360px', type: [String, Number] },
  imageStyle: { default: () => ({}), type: Object as PropType<CSSProperties> },
  options: { default: () => ({}), type: Object as PropType<Options> },
  realTimePreview: { default: true, type: Boolean },
  src: { required: true, type: String },
});

const emit = defineEmits(['cropend', 'ready', 'cropendError']);

const defaultOptions: Options = {
  aspectRatio: 1,
  autoCrop: true,
  background: true,
  center: true,
  checkCrossOrigin: true,
  checkOrientation: true,
  cropBoxMovable: true,
  cropBoxResizable: true,
  guides: true,
  highlight: true,
  modal: true,
  movable: true,
  responsive: true,
  restore: true,
  rotatable: true,
  scalable: true,
  toggleDragModeOnDblclick: true,
  zoomable: true,
  zoomOnTouch: true,
  zoomOnWheel: true,
};

const attrs = useAttrs();

type ElRef<T extends HTMLElement = HTMLDivElement> = null | T;
const imgElRef = ref<ElRef<HTMLImageElement>>();
const cropper = ref<Cropper | null>();
const isReady = ref(false);

const prefixCls = 'cropper-image';
const debounceRealTimeCroppered = useDebounceFn(realTimeCroppered, 80);

const getImageStyle = computed((): CSSProperties => {
  return {
    height: props.height,
    maxWidth: '100%',
    ...props.imageStyle,
  };
});

const getClass = computed(() => {
  return [
    prefixCls,
    attrs.class,
    {
      [`${prefixCls}--circled`]: props.circled,
    },
  ];
});

const getWrapperStyle = computed((): CSSProperties => {
  return { height: `${`${props.height}`.replace(/px/, '')}px` };
});

onMounted(init);

onUnmounted(() => {
  cropper.value?.destroy();
});

async function init() {
  const imgEl = unref(imgElRef);
  if (!imgEl) {
    return;
  }
  cropper.value = new Cropper(imgEl, {
    ...defaultOptions,
    crop() {
      debounceRealTimeCroppered();
    },
    cropmove() {
      debounceRealTimeCroppered();
    },
    ready: () => {
      isReady.value = true;
      realTimeCroppered();
      emit('ready', cropper.value);
    },
    zoom() {
      debounceRealTimeCroppered();
    },
    ...props.options,
  });
}

// Real-time display preview
function realTimeCroppered() {
  props.realTimePreview && croppered();
}

// event: return base64 and width and height information after cropping
function croppered() {
  if (!cropper.value) {
    return;
  }
  const imgInfo = cropper.value.getData();
  const canvas = props.circled
    ? getRoundedCanvas()
    : cropper.value.getCroppedCanvas();
  canvas.toBlob((blob) => {
    if (!blob) {
      return;
    }
    const fileReader: FileReader = new FileReader();
    fileReader.readAsDataURL(blob);
    fileReader.onloadend = (e) => {
      emit('cropend', {
        imgBase64: e.target?.result ?? '',
        imgInfo,
      });
    };
    // eslint-disable-next-line unicorn/prefer-add-event-listener
    fileReader.onerror = () => {
      emit('cropendError');
    };
  }, 'image/png');
}

// Get a circular picture canvas
function getRoundedCanvas() {
  const sourceCanvas = cropper.value!.getCroppedCanvas();
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d')!;
  const width = sourceCanvas.width;
  const height = sourceCanvas.height;
  canvas.width = width;
  canvas.height = height;
  context.imageSmoothingEnabled = true;
  context.drawImage(sourceCanvas, 0, 0, width, height);
  context.globalCompositeOperation = 'destination-in';
  context.beginPath();
  context.arc(
    width / 2,
    height / 2,
    Math.min(width, height) / 2,
    0,
    2 * Math.PI,
    true,
  );
  context.fill();
  return canvas;
}
</script>
<template>
  <div :class="getClass" :style="getWrapperStyle">
    <img
      v-show="isReady"
      ref="imgElRef"
      :alt="alt"
      @error="emit('cropendError')"
      :crossorigin="crossorigin"
      :src="src"
      :style="getImageStyle"
    />
  </div>
</template>
<style lang="scss">
.cropper-image {
  &--circled {
    .cropper-view-box,
    .cropper-face {
      border-radius: 50%;
    }
  }
}
</style>
