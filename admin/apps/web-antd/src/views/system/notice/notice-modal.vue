<!--
2025年03月08日重构为原生表单(反向重构??)
该文件作为例子 使用原生表单而非useVbenForm
-->
<script setup lang="ts">
import type { RuleObject } from 'ant-design-vue/es/form';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { DictEnum } from '@vben/constants';
import { $t } from '@vben/locales';
import { cloneDeep } from '@vben/utils';

import { Form, FormItem, Input, RadioGroup } from 'ant-design-vue';
import { pick } from 'lodash-es';

import { noticeAdd, noticeInfo, noticeUpdate } from '#/api/system/notice';
import { Tinymce } from '#/components/tinymce';
import { getDictOptions } from '#/utils/dict';

const emit = defineEmits<{ reload: [] }>();

const isUpdate = ref(false);
const title = computed(() => {
  return isUpdate.value ? $t('pages.common.edit') : $t('pages.common.add');
});

/**
 * 定义表单数据类型
 */
interface FormData {
  noticeId?: number;
  noticeTitle?: string;
  status?: string;
  noticeType?: string;
  noticeContent?: string;
}

/**
 * 定义默认值 用于reset
 */
const defaultValues: FormData = {
  noticeId: undefined,
  noticeTitle: '',
  status: '0',
  noticeType: '1',
  noticeContent: '',
};

/**
 * 表单数据ref
 */
const formData = ref(defaultValues);

type AntdFormRules<T> = Partial<Record<keyof T, RuleObject[]>> & {
  [key: string]: RuleObject[];
};
/**
 * 表单校验规则
 */
const formRules = ref<AntdFormRules<FormData>>({
  status: [{ required: true, message: $t('ui.formRules.selectRequired') }],
  noticeContent: [{ required: true, message: $t('ui.formRules.required') }],
  noticeType: [{ required: true, message: $t('ui.formRules.selectRequired') }],
  noticeTitle: [{ required: true, message: $t('ui.formRules.required') }],
});

/**
 * useForm解构出表单方法
 */
const { validate, validateInfos, resetFields } = Form.useForm(
  formData,
  formRules,
);

const [BasicModal, modalApi] = useVbenModal({
  class: 'w-[800px]',
  fullscreenButton: true,
  closeOnClickModal: false,
  onClosed: handleCancel,
  onConfirm: handleConfirm,
  onOpenChange: async (isOpen) => {
    if (!isOpen) {
      return null;
    }
    modalApi.modalLoading(true);
    const { id } = modalApi.getData() as { id?: number | string };
    isUpdate.value = !!id;
    if (isUpdate.value && id) {
      const record = await noticeInfo(id);
      // 只赋值存在的字段
      const filterRecord = pick(record, Object.keys(defaultValues));
      formData.value = filterRecord;
    }
    modalApi.modalLoading(false);
  },
});

async function handleConfirm() {
  try {
    modalApi.modalLoading(true);
    await validate();
    // 可能会做数据处理 使用cloneDeep深拷贝
    const data = cloneDeep(formData.value);
    await (isUpdate.value ? noticeUpdate(data) : noticeAdd(data));
    emit('reload');
    await handleCancel();
  } catch (error) {
    console.error(error);
  } finally {
    modalApi.modalLoading(false);
  }
}

async function handleCancel() {
  modalApi.close();
  formData.value = defaultValues;
  resetFields();
}
</script>

<template>
  <BasicModal :title="title">
    <Form layout="vertical">
      <FormItem label="公告标题" v-bind="validateInfos.noticeTitle">
        <Input
          :placeholder="$t('ui.formRules.required')"
          v-model:value="formData.noticeTitle"
        />
      </FormItem>
      <div class="grid sm:grid-cols-1 lg:grid-cols-2">
        <FormItem label="公告状态" v-bind="validateInfos.status">
          <RadioGroup
            button-style="solid"
            option-type="button"
            v-model:value="formData.status"
            :options="getDictOptions(DictEnum.SYS_NOTICE_STATUS)"
          />
        </FormItem>
        <FormItem label="公告类型" v-bind="validateInfos.noticeType">
          <RadioGroup
            button-style="solid"
            option-type="button"
            v-model:value="formData.noticeType"
            :options="getDictOptions(DictEnum.SYS_NOTICE_TYPE)"
          />
        </FormItem>
      </div>
      <FormItem label="公告内容" v-bind="validateInfos.noticeContent">
        <Tinymce v-model="formData.noticeContent" />
      </FormItem>
    </Form>
  </BasicModal>
</template>
