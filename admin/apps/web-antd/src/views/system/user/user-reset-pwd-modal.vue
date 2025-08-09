<script setup lang="ts">
import type { ResetPwdParam, User } from '#/api/system/user/model';

import { useVbenModal, z } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { userResetPassword } from '#/api/system/user';
import { Description, useDescription } from '#/components/description';

const emit = defineEmits<{ reload: [] }>();

const [BasicModal, modalApi] = useVbenModal({
  onCancel: handleCancel,
  onConfirm: handleSubmit,
  onOpenChange: handleOpenChange,
});

const [registerDescription, { setDescProps }] = useDescription({
  column: 1,
  schema: [
    {
      field: 'userId',
      label: '用户ID',
    },
    {
      field: 'username',
      label: '用户名',
    },
    {
      field: 'nickName',
      label: '昵称',
    },
  ],
});

const [BasicForm, formApi] = useVbenForm({
  schema: [
    {
      component: 'Input',
      dependencies: {
        show: () => false,
        triggerFields: [''],
      },
      fieldName: 'userId',
      label: '用户ID',
      rules: 'required',
    },
    {
      component: 'InputPassword',
      componentProps: {
        placeholder: '请输入新的密码, 密码长度为5 - 20',
      },
      fieldName: 'password',
      label: '新的密码',
      rules: z
        .string()
        .min(5, { message: '密码长度为5 - 20' })
        .max(20, { message: '密码长度为5 - 20' }),
    },
  ],
  showDefaultActions: false,
  commonConfig: {
    labelWidth: 80,
  },
});

async function handleOpenChange(open: boolean) {
  if (!open) {
    return null;
  }
  const { record } = modalApi.getData() as { record: User };
  setDescProps({ data: record }, true);
  await formApi.setValues({ userId: record.userId });
}

async function handleSubmit() {
  try {
    modalApi.modalLoading(true);
    const { valid } = await formApi.validate();
    if (!valid) {
      return;
    }
    const data = await formApi.getValues();
    await userResetPassword(data as ResetPwdParam);
    emit('reload');
    handleCancel();
  } catch (error) {
    console.error(error);
  } finally {
    modalApi.modalLoading(false);
  }
}

async function handleCancel() {
  modalApi.close();
  await formApi.resetForm();
}
</script>

<template>
  <BasicModal
    :close-on-click-modal="false"
    :fullscreen-button="false"
    title="重置密码"
  >
    <div class="flex flex-col gap-[12px]">
      <Description @register="registerDescription" />
      <BasicForm />
    </div>
  </BasicModal>
</template>
