<script setup lang="ts">
import type { UserProfile } from '#/api/system/profile/model';

import { computed } from 'vue';

import { preferences, usePreferences } from '@vben/preferences';

import {
  Card,
  Descriptions,
  DescriptionsItem,
  Tag,
  Tooltip,
} from 'ant-design-vue';

import { userUpdateAvatar } from '#/api/system/profile';
import { CropperAvatar } from '#/components/cropper';

const props = defineProps<{ profile?: UserProfile }>();

defineEmits<{
  // 头像上传完毕
  uploadFinish: [];
}>();

const avatar = computed(
  () => props.profile?.user.avatar || preferences.app.defaultAvatar,
);

const { isDark } = usePreferences();
const poetrySrc = computed(() => {
  const color = isDark.value ? 'white' : 'gray';
  return `https://v2.jinrishici.com/one.svg?font-size=12&color=${color}`;
});
</script>

<template>
  <Card :loading="!profile" class="h-full lg:w-1/3">
    <div v-if="profile" class="flex flex-col items-center gap-[24px]">
      <div class="flex flex-col items-center gap-[20px]">
        <Tooltip title="点击上传头像">
          <CropperAvatar
            :show-btn="false"
            :upload-api="userUpdateAvatar"
            :value="avatar"
            width="120"
            @change="$emit('uploadFinish')"
          />
        </Tooltip>
        <div class="flex flex-col items-center gap-[8px]">
          <span class="text-foreground text-xl font-bold">
            {{ profile.user.nickName ?? '未知' }}
          </span>
          <!-- https://www.jinrishici.com/doc/#image -->
          <img :src="poetrySrc" />
        </div>
      </div>
      <div class="px-[24px]">
        <Descriptions :column="1">
          <DescriptionsItem label="账号">
            {{ profile.user.username }}
          </DescriptionsItem>
          <DescriptionsItem label="手机号码">
            {{ profile.user.phonenumber || '未绑定手机号' }}
          </DescriptionsItem>
          <DescriptionsItem label="邮箱">
            {{ profile.user.email || '未绑定邮箱' }}
          </DescriptionsItem>
          <DescriptionsItem label="部门">
            <Tag color="processing">
              {{ profile.user.deptName ?? '未分配部门' }}
            </Tag>
            <Tag v-if="profile.postGroup" color="processing">
              {{ profile.postGroup }}
            </Tag>
          </DescriptionsItem>
          <DescriptionsItem label="上次登录">
            {{ profile.user.loginDate }}
          </DescriptionsItem>
        </Descriptions>
      </div>
    </div>
  </Card>
</template>
