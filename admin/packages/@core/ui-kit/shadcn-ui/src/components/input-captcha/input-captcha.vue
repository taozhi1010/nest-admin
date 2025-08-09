<script setup lang="ts">
import { Input as VbenInput } from '../../ui/input';

withDefaults(
  defineProps<{
    captcha?: string;
    label?: string;
    placeholder?: string;
  }>(),
  {
    captcha: '',
    label: '验证码',
    placeholder: '请输入验证码',
  },
);

defineEmits<{ captchaClick: [] }>();

const modelValue = defineModel({ default: '', type: String });
</script>

<!-- 图片验证码 -->
<template>
  <div class="flex w-full">
    <div class="flex-1">
      <VbenInput
        autocomplete="off"
        id="code"
        v-model="modelValue"
        :class="$attrs?.class ?? {}"
        :label="label"
        :placeholder="placeholder"
        name="code"
        required
        type="text"
      />
    </div>
    <img
      :src="captcha"
      class="h-[40px] w-[115px] cursor-pointer rounded-r-md"
      @click="$emit('captchaClick')"
    />
  </div>
</template>

<style lang="scss">
/**
  验证码输入框样式
  去除右边的圆角
*/
input[id='code'] {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}
</style>
