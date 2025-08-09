<script setup lang="ts">
import type { UploadFile } from 'ant-design-vue/es/upload/interface';

import { h, ref, unref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { ExcelIcon, InBoxIcon } from '@vben/icons';

import { Modal, Switch, Upload } from 'ant-design-vue';

import { downloadImportTemplate, userImportData } from '#/api/system/user';
import { commonDownloadExcel } from '#/utils/file/download';

const emit = defineEmits<{ reload: [] }>();

const UploadDragger = Upload.Dragger;

const [BasicModal, modalApi] = useVbenModal({
  onCancel: handleCancel,
  onConfirm: handleSubmit,
});

const fileList = ref<UploadFile[]>([]);
const checked = ref(false);

async function handleSubmit() {
  try {
    modalApi.modalLoading(true);
    if (fileList.value.length !== 1) {
      handleCancel();
      return;
    }
    const data = {
      file: fileList.value[0]!.originFileObj as Blob,
      updateSupport: unref(checked),
    };
    const { code, msg } = await userImportData(data);
    let modal = Modal.success;
    if (code === 200) {
      emit('reload');
    } else {
      modal = Modal.error;
    }
    handleCancel();
    modal({
      content: h('div', {
        class: 'max-h-[260px] overflow-y-auto',
        innerHTML: msg, // 后台已经处理xss问题
      }),
      title: '提示',
    });
  } catch (error) {
    console.warn(error);
    modalApi.close();
  } finally {
    modalApi.modalLoading(false);
  }
}

function handleCancel() {
  modalApi.close();
  fileList.value = [];
  checked.value = false;
}
</script>

<template>
  <BasicModal
    :close-on-click-modal="false"
    :fullscreen-button="false"
    title="用户导入"
  >
    <!-- z-index不设置会遮挡模板下载loading -->
    <!-- 手动处理 而不是放入文件就上传 -->
    <UploadDragger
      v-model:file-list="fileList"
      :before-upload="() => false"
      :max-count="1"
      :show-upload-list="true"
      accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
    >
      <p class="ant-upload-drag-icon flex items-center justify-center">
        <InBoxIcon class="text-primary size-[48px]" />
      </p>
      <p class="ant-upload-text">点击或者拖拽到此处上传文件</p>
    </UploadDragger>
    <div class="mt-2 flex flex-col gap-2">
      <div class="flex items-center gap-2">
        <span>允许导入xlsx, xls文件</span>
        <a-button
          type="link"
          @click="commonDownloadExcel(downloadImportTemplate, '用户导入模板')"
        >
          <div class="flex items-center gap-[4px]">
            <ExcelIcon />
            <span>下载模板</span>
          </div>
        </a-button>
      </div>
      <div class="flex items-center gap-2">
        <span :class="{ 'text-red-500': checked }">
          是否更新/覆盖已存在的用户数据
        </span>
        <Switch v-model:checked="checked" />
      </div>
    </div>
  </BasicModal>
</template>
