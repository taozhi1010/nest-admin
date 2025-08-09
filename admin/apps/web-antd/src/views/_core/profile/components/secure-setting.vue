<script setup lang="ts">
import type { UpdatePasswordParam } from '#/api/system/profile/model';

import { Modal } from 'ant-design-vue';
import { omit } from 'lodash-es';

import { useVbenForm, z } from '#/adapter/form';
import { userUpdatePassword } from '#/api/system/profile';
import { useAuthStore } from '#/store';

const [BasicForm, formApi] = useVbenForm({
  actionWrapperClass: 'text-left mb-[16px] ml-[96px]',
  commonConfig: {
    labelWidth: 90,
  },
  handleSubmit,
  resetButtonOptions: {
    show: false,
  },
  schema: [
    {
      component: 'InputPassword',
      fieldName: 'oldPassword',
      label: '旧密码',
      rules: z
        .string({ message: '请输入密码' })
        .min(5, '密码长度不能少于5个字符')
        .max(20, '密码长度不能超过20个字符'),
    },
    {
      component: 'InputPassword',
      dependencies: {
        rules(values) {
          return z
            .string({ message: '请输入新密码' })
            .min(5, '密码长度不能少于5个字符')
            .max(20, '密码长度不能超过20个字符')
            .refine(
              (value) => value !== values.oldPassword,
              '新旧密码不能相同',
            );
        },
        triggerFields: ['newPassword', 'oldPassword'],
      },
      fieldName: 'newPassword',
      label: '新密码',
      rules: 'required',
    },
    {
      component: 'InputPassword',
      dependencies: {
        rules(values) {
          return z
            .string({ message: '请输入确认密码' })
            .min(5, '密码长度不能少于5个字符')
            .max(20, '密码长度不能超过20个字符')
            .refine(
              (value) => value === values.newPassword,
              '新密码和确认密码不一致',
            );
        },
        triggerFields: ['newPassword', 'confirmPassword'],
      },
      fieldName: 'confirmPassword',
      label: '确认密码',
      rules: 'required',
    },
  ],
  submitButtonOptions: {
    content: '修改密码',
  },
});

function buttonLoading(loading: boolean) {
  formApi.setState((prev) => ({
    ...prev,
    submitButtonOptions: { ...prev.submitButtonOptions, loading },
  }));
}

const authStore = useAuthStore();
function handleSubmit(values: any) {
  Modal.confirm({
    content: '确认修改密码吗？',
    onOk: async () => {
      try {
        buttonLoading(true);
        const data = omit(values, ['confirmPassword']) as UpdatePasswordParam;
        await userUpdatePassword(data);
        await authStore.logout(true);
      } catch (error) {
        console.error(error);
      } finally {
        buttonLoading(false);
      }
    },
    title: '提示',
  });
}
</script>

<template>
  <div class="mt-[16px] md:w-full lg:w-1/2 2xl:w-2/5">
    <BasicForm />
  </div>
</template>
