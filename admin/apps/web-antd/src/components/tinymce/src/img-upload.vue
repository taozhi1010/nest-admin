<script lang="ts" setup>
import { computed } from 'vue';

import { useAppConfig } from '@vben/hooks';
import { useAccessStore } from '@vben/stores';

import { message, Upload } from 'ant-design-vue';

defineOptions({ name: 'TinymceImageUpload' });

const props = defineProps({
  disabled: {
    default: false,
    type: Boolean,
  },
  fullscreen: {
    type: Boolean,
  },
});

const emit = defineEmits(['uploading', 'done', 'error']);

let uploading = false;

const { apiURL, clientId } = useAppConfig(
  import.meta.env,
  import.meta.env.PROD,
);
const accessStore = useAccessStore();
const uploadUrl = `${apiURL}/resource/oss/upload`;
// 使用upload组件只能这样上传
const headers = {
  Authorization: `Bearer ${accessStore.accessToken}`,
  clientId,
};

const getButtonProps = computed(() => {
  const { disabled } = props;
  return {
    disabled,
  };
});

function handleChange(info: Record<string, any>) {
  const file = info.file;
  const status = file?.status;
  // const url = file?.response?.data.url;
  const name = file?.name;

  switch (status) {
    case 'done': {
      // http 200会走到这里  需要再次判断
      const { response } = file;
      const { code, data, msg = '服务器错误' } = response;
      if (code === 200) {
        const { url } = data;
        emit('done', name, url);
      } else {
        message.error(msg);
      }
      // emit('done', name, url);
      uploading = false;

      break;
    }
    case 'error': {
      emit('error');
      uploading = false;

      break;
    }
    case 'uploading': {
      if (!uploading) {
        emit('uploading', name);
        uploading = true;
      }

      break;
    }
    // No default
  }
}
</script>
<template>
  <div :class="[{ fullscreen }]" class="tinymce-image-upload">
    <Upload
      :action="uploadUrl"
      :headers="headers"
      :show-upload-list="false"
      accept=".jpg,.jpeg,.gif,.png,.webp"
      multiple
      name="file"
      @change="handleChange"
    >
      <!-- 这里要改成i18n -->
      <a-button type="primary" v-bind="{ ...getButtonProps }">
        图片上传
      </a-button>
    </Upload>
  </div>
</template>

<style lang="scss" scoped>
.tinymce-image-upload {
  position: absolute;
  top: 4px;
  right: 10px;
  z-index: 20;

  &.fullscreen {
    position: fixed;
    z-index: 10000;
  }
}
</style>
