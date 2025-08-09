<script lang="ts" setup>
import type { UploadFile, UploadProps } from 'ant-design-vue';
import type { UploadRequestOption } from 'ant-design-vue/lib/vc-upload/interface';

import type { AxiosResponse } from '@vben/request';

import type { AxiosProgressEvent } from '#/api';

import { ref, toRefs, watch } from 'vue';

import { $t } from '@vben/locales';

import { UploadOutlined } from '@ant-design/icons-vue';
import { message, Upload } from 'ant-design-vue';
import { isArray, isFunction, isObject, isString } from 'lodash-es';

import { uploadApi } from '#/api';

import { checkFileType } from './helper';
import { UploadResultStatus } from './typing';
import { useUploadType } from './use-upload';

defineOptions({ name: 'FileUpload', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /**
     * 建议使用拓展名(不带.)
     * 或者文件头 image/png等(测试判断不准确)  不支持image/*类似的写法
     * 需自行改造 ./helper/checkFileType方法
     */
    accept?: string[];
    api?: (
      file: Blob | File,
      onUploadProgress?: AxiosProgressEvent,
    ) => Promise<AxiosResponse<any>>;
    disabled?: boolean;
    helpText?: string;
    // 最大数量的文件，Infinity不限制
    maxNumber?: number;
    // 文件最大多少MB
    maxSize?: number;
    // 是否支持多选
    multiple?: boolean;
    // support xxx.xxx.xx
    // 返回的字段 默认url
    resultField?: 'fileName' | 'ossId' | 'url' | string;
    /**
     * 是否显示下面的描述
     */
    showDescription?: boolean;
    value?: string[];
  }>(),
  {
    value: () => [],
    disabled: false,
    helpText: '',
    maxSize: 2,
    maxNumber: 1,
    accept: () => [],
    multiple: false,
    api: uploadApi,
    resultField: '',
    showDescription: true,
  },
);
const emit = defineEmits(['change', 'update:value', 'delete']);
const { accept, helpText, maxNumber, maxSize } = toRefs(props);
const isInnerOperate = ref<boolean>(false);
const { getStringAccept } = useUploadType({
  acceptRef: accept,
  helpTextRef: helpText,
  maxNumberRef: maxNumber,
  maxSizeRef: maxSize,
});

const fileList = ref<UploadProps['fileList']>([]);
const isLtMsg = ref<boolean>(true);
const isActMsg = ref<boolean>(true);
const isFirstRender = ref<boolean>(true);

watch(
  () => props.value,
  (v) => {
    if (isInnerOperate.value) {
      isInnerOperate.value = false;
      return;
    }
    let value: string[] = [];
    if (v) {
      if (isArray(v)) {
        value = v;
      } else {
        value.push(v);
      }
      fileList.value = value.map((item, i) => {
        if (item && isString(item)) {
          return {
            uid: `${-i}`,
            name: item.slice(Math.max(0, item.lastIndexOf('/') + 1)),
            status: 'done',
            url: item,
          };
        } else if (item && isObject(item)) {
          return item;
        }
        return null;
      }) as UploadProps['fileList'];
    }
    if (!isFirstRender.value) {
      emit('change', value);
      isFirstRender.value = false;
    }
  },
  {
    immediate: true,
    deep: true,
  },
);

const handleRemove = async (file: UploadFile) => {
  if (fileList.value) {
    const index = fileList.value.findIndex((item) => item.uid === file.uid);
    index !== -1 && fileList.value.splice(index, 1);
    const value = getValue();
    isInnerOperate.value = true;
    emit('update:value', value);
    emit('change', value);
    emit('delete', file);
  }
};

const beforeUpload = async (file: File) => {
  const { maxSize, accept } = props;
  const isAct = await checkFileType(file, accept);
  if (!isAct) {
    message.error($t('component.upload.acceptUpload', [accept]));
    isActMsg.value = false;
    // 防止弹出多个错误提示
    setTimeout(() => (isActMsg.value = true), 1000);
  }
  const isLt = file.size / 1024 / 1024 > maxSize;
  if (isLt) {
    message.error($t('component.upload.maxSizeMultiple', [maxSize]));
    isLtMsg.value = false;
    // 防止弹出多个错误提示
    setTimeout(() => (isLtMsg.value = true), 1000);
  }
  return (isAct && !isLt) || Upload.LIST_IGNORE;
};

async function customRequest(info: UploadRequestOption<any>) {
  const { api } = props;
  if (!api || !isFunction(api)) {
    console.warn('upload api must exist and be a function');
    return;
  }
  try {
    // 进度条事件
    const progressEvent: AxiosProgressEvent = (e) => {
      const percent = Math.trunc((e.loaded / e.total!) * 100);
      info.onProgress!({ percent });
    };
    const res = await api?.(info.file as File, progressEvent);
    /**
     * 由getValue处理 传对象过去
     * 直接传string(id)会被转为Number
     * 内部的逻辑由requestClient.upload处理 这里不用判断业务状态码 不符合会自动reject
     */
    info.onSuccess!(res);
    message.success($t('component.upload.uploadSuccess'));
    // 获取
    const value = getValue();
    isInnerOperate.value = true;
    emit('update:value', value);
    emit('change', value);
  } catch (error: any) {
    console.error(error);
    info.onError!(error);
  }
}

function getValue() {
  const list = (fileList.value || [])
    .filter((item) => item?.status === UploadResultStatus.DONE)
    .map((item: any) => {
      if (item?.response && props?.resultField) {
        return item?.response?.[props.resultField];
      }
      // 适用于已经有图片 回显的情况 会默认在init处理为{url: 'xx'}
      if (item?.url) {
        return item.url;
      }
      // 注意这里取的key为 url
      return item?.response?.url;
    });
  return list;
}
</script>

<template>
  <div>
    <Upload
      v-bind="$attrs"
      v-model:file-list="fileList"
      :accept="getStringAccept"
      :before-upload="beforeUpload"
      :custom-request="customRequest"
      :disabled="disabled"
      :max-count="maxNumber"
      :multiple="multiple"
      list-type="text"
      :progress="{ showInfo: true }"
      @remove="handleRemove"
    >
      <div v-if="fileList && fileList.length < maxNumber">
        <a-button>
          <UploadOutlined />
          {{ $t('component.upload.upload') }}
        </a-button>
      </div>
      <div v-if="showDescription" class="mt-2 flex flex-wrap items-center">
        请上传不超过
        <div class="text-primary mx-1 font-bold">{{ maxSize }}MB</div>
        的
        <div class="text-primary mx-1 font-bold">{{ accept.join('/') }}</div>
        格式文件
      </div>
    </Upload>
  </div>
</template>

<style>
.ant-upload-select-picture-card i {
  font-size: 32px;
  color: #999;
}

.ant-upload-select-picture-card .ant-upload-text {
  margin-top: 8px;
  color: #666;
}
</style>
