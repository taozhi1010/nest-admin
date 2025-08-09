<script lang="ts" setup>
import type { PropType } from 'vue';

import type { CropendResult, Cropper } from './typing';

import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { $t as t } from '@vben/locales';

import { Avatar, message, Space, Tooltip, Upload } from 'ant-design-vue';
import { isFunction } from 'lodash-es';

import { dataURLtoBlob } from '#/utils/file/base64Conver';

import CropperImage from './cropper.vue';

type apiFunParams = { file: Blob; filename: string; name: string };

defineOptions({ name: 'CropperModal' });

const props = defineProps({
  circled: { default: true, type: Boolean },
  size: { default: 0, type: Number },
  src: { default: '', type: String },
  uploadApi: {
    required: true,
    type: Function as PropType<(params: apiFunParams) => Promise<any>>,
  },
});

const emit = defineEmits(['uploadSuccess', 'uploadError', 'register']);

let filename = '';
const src = ref(props.src || '');
const previewSource = ref('');
const cropper = ref<Cropper>();
let scaleX = 1;
let scaleY = 1;

const prefixCls = 'cropper-am';
const [BasicModal, modalApi] = useVbenModal({
  onConfirm: handleOk,
  onOpenChange(isOpen) {
    // 打开的时候loading CropperImage组件加载完毕关闭loading
    if (isOpen) {
      modalLoading(true);
    } else {
      // 关闭时候清空右侧预览
      previewSource.value = '';
      modalLoading(false);
    }
  },
});

function modalLoading(loading: boolean) {
  modalApi.setState({ confirmLoading: loading, loading });
}

// Block upload
function handleBeforeUpload(file: File) {
  if (props.size > 0 && file.size > 1024 * 1024 * props.size) {
    emit('uploadError', { msg: t('component.cropper.imageTooBig') });
    return false;
  }
  const reader = new FileReader();
  reader.readAsDataURL(file);
  src.value = '';
  previewSource.value = '';
  reader.addEventListener('load', (e) => {
    src.value = (e.target?.result as string) ?? '';
    filename = file.name;
  });
  return false;
}

function handleCropend({ imgBase64 }: CropendResult) {
  previewSource.value = imgBase64;
}

function handleCropendError() {
  modalLoading(false);
}

function handleReady(cropperInstance: Cropper) {
  cropper.value = cropperInstance;
  // 画布加载完毕 关闭loading
  modalLoading(false);
}

function handlerToolbar(event: string, arg?: number) {
  if (event === 'scaleX') {
    scaleX = arg = scaleX === -1 ? 1 : -1;
  }
  if (event === 'scaleY') {
    scaleY = arg = scaleY === -1 ? 1 : -1;
  }
  (cropper?.value as any)?.[event]?.(arg);
}

async function handleOk() {
  const uploadApi = props.uploadApi;
  if (uploadApi && isFunction(uploadApi)) {
    if (!previewSource.value) {
      message.warn('未选择图片');
      return;
    }
    const blob = dataURLtoBlob(previewSource.value);
    try {
      modalLoading(true);
      const result = await uploadApi({ file: blob, filename, name: 'file' });
      emit('uploadSuccess', { data: result.url, source: previewSource.value });
      modalApi.close();
    } finally {
      modalLoading(false);
    }
  }
}
</script>
<template>
  <BasicModal
    v-bind="$attrs"
    :confirm-text="t('component.cropper.okText')"
    :fullscreen-button="false"
    :title="t('component.cropper.modalTitle')"
    class="w-[800px]"
  >
    <div :class="prefixCls">
      <div :class="`${prefixCls}-left`" class="w-full">
        <div :class="`${prefixCls}-cropper`">
          <CropperImage
            v-if="src"
            :circled="circled"
            :src="src"
            height="300px"
            @cropend-error="handleCropendError"
            @cropend="handleCropend"
            @ready="handleReady"
          />
        </div>

        <div :class="`${prefixCls}-toolbar`">
          <Upload :before-upload="handleBeforeUpload" :file-list="[]" accept="image/*">
            <Tooltip :title="t('component.cropper.selectImage')" placement="bottom">
              <a-button size="small" type="primary">
                <template #icon>
                  <div class="flex items-center justify-center">
                    <span class="icon-[ant-design--upload-outlined]"></span>
                  </div>
                </template>
              </a-button>
            </Tooltip>
          </Upload>
          <Space>
            <Tooltip :title="t('component.cropper.btn_reset')" placement="bottom">
              <a-button :disabled="!src" size="small" type="primary" @click="handlerToolbar('reset')">
                <template #icon>
                  <div class="flex items-center justify-center">
                    <span class="icon-[ant-design--reload-outlined]"></span>
                  </div>
                </template>
              </a-button>
            </Tooltip>
            <Tooltip :title="t('component.cropper.btn_rotate_left')" placement="bottom">
              <a-button :disabled="!src" size="small" type="primary" @click="handlerToolbar('rotate', -45)">
                <template #icon>
                  <div class="flex items-center justify-center">
                    <span class="icon-[ant-design--rotate-left-outlined]"></span>
                  </div>
                </template>
              </a-button>
            </Tooltip>
            <Tooltip :title="t('component.cropper.btn_rotate_right')" placement="bottom">
              <a-button
                :disabled="!src"
                pre-icon="ant-design:rotate-right-outlined"
                size="small"
                type="primary"
                @click="handlerToolbar('rotate', 45)"
              >
                <template #icon>
                  <div class="flex items-center justify-center">
                    <span class="icon-[ant-design--rotate-right-outlined]"></span>
                  </div>
                </template>
              </a-button>
            </Tooltip>
            <Tooltip :title="t('component.cropper.btn_scale_x')" placement="bottom">
              <a-button :disabled="!src" size="small" type="primary" @click="handlerToolbar('scaleX')">
                <template #icon>
                  <div class="flex items-center justify-center">
                    <span class="icon-[vaadin--arrows-long-h]"></span>
                  </div>
                </template>
              </a-button>
            </Tooltip>
            <Tooltip :title="t('component.cropper.btn_scale_y')" placement="bottom">
              <a-button :disabled="!src" size="small" type="primary" @click="handlerToolbar('scaleY')">
                <template #icon>
                  <div class="flex items-center justify-center">
                    <span class="icon-[vaadin--arrows-long-v]"></span>
                  </div>
                </template>
              </a-button>
            </Tooltip>
            <Tooltip :title="t('component.cropper.btn_zoom_in')" placement="bottom">
              <a-button :disabled="!src" size="small" type="primary" @click="handlerToolbar('zoom', 0.1)">
                <template #icon>
                  <div class="flex items-center justify-center">
                    <span class="icon-[ant-design--zoom-in-outlined]"></span>
                  </div>
                </template>
              </a-button>
            </Tooltip>
            <Tooltip :title="t('component.cropper.btn_zoom_out')" placement="bottom">
              <a-button :disabled="!src" size="small" type="primary" @click="handlerToolbar('zoom', -0.1)">
                <template #icon>
                  <div class="flex items-center justify-center">
                    <span class="icon-[ant-design--zoom-out-outlined]"></span>
                  </div>
                </template>
              </a-button>
            </Tooltip>
          </Space>
        </div>
      </div>
      <div :class="`${prefixCls}-right`">
        <div :class="`${prefixCls}-preview`">
          <img v-if="previewSource" :alt="t('component.cropper.preview')" :src="previewSource" />
        </div>
        <template v-if="previewSource">
          <div :class="`${prefixCls}-group`">
            <Avatar :src="previewSource" size="large" />
            <Avatar :size="48" :src="previewSource" />
            <Avatar :size="64" :src="previewSource" />
            <Avatar :size="80" :src="previewSource" />
          </div>
        </template>
      </div>
    </div>
  </BasicModal>
</template>

<style lang="scss">
.cropper-am {
  display: flex;

  &-left,
  &-right {
    height: 340px;
  }

  &-left {
    width: 55%;
  }

  &-right {
    width: 45%;
  }

  &-cropper {
    height: 300px;
    background: #eee;
    background-image:
      linear-gradient(45deg, rgb(0 0 0 / 25%) 25%, transparent 0, transparent 75%, rgb(0 0 0 / 25%) 0),
      linear-gradient(45deg, rgb(0 0 0 / 25%) 25%, transparent 0, transparent 75%, rgb(0 0 0 / 25%) 0);
    background-position:
      0 0,
      12px 12px;
    background-size: 24px 24px;
  }

  &-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 10px;
  }

  &-preview {
    width: 220px;
    height: 220px;
    margin: 0 auto;
    overflow: hidden;
    border: 1px solid #eee;
    border-radius: 50%;

    img {
      width: 100%;
      height: 100%;
    }
  }

  &-group {
    display: flex;
    align-items: center;
    justify-content: space-around;
    padding-top: 8px;
    margin-top: 8px;
    border-top: 1px solid #eee;
  }
}
</style>
