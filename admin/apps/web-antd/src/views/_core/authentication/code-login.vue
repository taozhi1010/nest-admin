<script lang="ts" setup>
import type { LoginCodeParams, VbenFormSchema } from '@vben/common-ui';

import type { TenantResp } from '#/api';

import { computed, onMounted, ref, useTemplateRef } from 'vue';

import { AuthenticationCodeLogin, z } from '@vben/common-ui';
import { DEFAULT_TENANT_ID } from '@vben/constants';
import { $t } from '@vben/locales';

import { Alert, message } from 'ant-design-vue';

import { tenantList } from '#/api';
import { sendSmsCode } from '#/api/core/captcha';
import { useAuthStore } from '#/store';

defineOptions({ name: 'CodeLogin' });

const loading = ref(false);
const CODE_LENGTH = 6;

const tenantInfo = ref<TenantResp>({
  tenantEnabled: false,
  voList: [],
});

const codeLoginRef = useTemplateRef('codeLoginRef');
async function loadTenant() {
  const resp = await tenantList();
  tenantInfo.value = resp;
  // 选中第一个租户
  if (resp.tenantEnabled && resp.voList.length > 0) {
    const firstTenantId = resp.voList[0]!.tenantId;
    codeLoginRef.value?.getFormApi().setFieldValue('tenantId', firstTenantId);
  }
}

onMounted(loadTenant);

const formSchema = computed((): VbenFormSchema[] => {
  return [
    {
      component: 'VbenSelect',
      componentProps: {
        class: 'bg-background h-[40px] focus:border-primary',
        contentClass: 'max-h-[256px] overflow-y-auto',
        options: tenantInfo.value.voList?.map((item) => ({
          label: item.companyName,
          value: item.tenantId,
        })),
        placeholder: $t('authentication.selectAccount'),
      },
      defaultValue: DEFAULT_TENANT_ID,
      dependencies: {
        if: () => tenantInfo.value.tenantEnabled,
        triggerFields: [''],
      },
      fieldName: 'tenantId',
      label: $t('authentication.selectAccount'),
      rules: z.string().min(1, { message: $t('authentication.selectAccount') }),
    },
    {
      component: 'VbenInput',
      componentProps: {
        placeholder: $t('authentication.mobile'),
      },
      fieldName: 'phoneNumber',
      label: $t('authentication.mobile'),
      rules: z
        .string()
        .min(1, { message: $t('authentication.mobileTip') })
        .refine((v) => /^\d{11}$/.test(v), {
          message: $t('authentication.mobileErrortip'),
        }),
    },
    {
      component: 'VbenPinInput',
      componentProps(_, form) {
        return {
          createText: (countdown: number) => {
            const text =
              countdown > 0
                ? $t('authentication.sendText', [countdown])
                : $t('authentication.sendCode');
            return text;
          },
          // 验证码长度 在这设置
          codeLength: 4,
          placeholder: $t('authentication.code'),
          handleSendCode: async () => {
            const { valid, value } = await form.validateField('phoneNumber');
            if (!valid) {
              // 必须抛异常 不能直接return
              throw new Error('未填写手机号');
            }
            // 调用接口发送
            await sendSmsCode(value);
            message.success('验证码发送成功');
          },
        };
      },
      fieldName: 'code',
      label: $t('authentication.code'),
      rules: z.string().length(CODE_LENGTH, {
        message: $t('authentication.codeTip', [CODE_LENGTH]),
      }),
    },
  ];
});

const authStore = useAuthStore();
async function handleLogin(values: LoginCodeParams) {
  try {
    const requestParams: any = {
      tenantId: values.tenantId,
      phonenumber: values.phoneNumber,
      smsCode: values.code,
      grantType: 'sms',
    };
    console.log('login params', requestParams);
    await authStore.authLogin(requestParams);
  } catch (error) {
    console.error(error);
  }
}
</script>

<template>
  <div>
    <Alert
      class="mb-4"
      how-icon
      message="测试手机号: 15888888888 正确验证码: 1234 演示使用 不会真的发送"
      type="info"
    />
    <AuthenticationCodeLogin
      ref="codeLoginRef"
      :form-schema="formSchema"
      :loading="loading"
      @submit="handleLogin"
    />
  </div>
</template>
