<script setup lang="ts">
import type { SelectHandler } from 'ant-design-vue/es/vc-select/Select';

import type { TenantOption } from '#/api';

import { computed, onMounted, ref, unref } from 'vue';
import { useRouter } from 'vue-router';

import { useAccess } from '@vben/access';
import { DEFAULT_HOME_PATH } from '@vben/constants';
import { useTabs } from '@vben/hooks';
import { $t } from '@vben/locales';

import { message, Select } from 'ant-design-vue';
import { storeToRefs } from 'pinia';

import { tenantDynamicClear, tenantDynamicToggle } from '#/api/system/tenant';
import { useDictStore } from '#/store/dict';
import { useTenantStore } from '#/store/tenant';

const { hasAccessByRoles } = useAccess();

// 上一次选择的租户
const lastSelected = ref<string>();
// 当前选择租户的id
const selected = ref<string>();

const tenantStore = useTenantStore();
const { initTenant, setChecked } = tenantStore;
const { tenantEnable, tenantList } = storeToRefs(tenantStore);

const showToggle = computed<boolean>(() => {
  // 超级管理员 && 启用租户
  return hasAccessByRoles(['superadmin']) && unref(tenantEnable);
});

onMounted(async () => {
  if (!hasAccessByRoles(['superadmin'])) {
    return;
  }
  await initTenant();
});

const { closeAllTabs } = useTabs();
const router = useRouter();
function close(checked: boolean) {
  // store设置状态
  setChecked(checked);
  // 需要关闭全部标签页
  closeAllTabs();
  // 切换完加载首页
  router.push(DEFAULT_HOME_PATH);
}

const dictStore = useDictStore();
/**
 * 选中租户的处理
 * @param tenantId tenantId
 * @param option 当前option
 */
const onSelected: SelectHandler = async (tenantId: string, option: any) => {
  if (unref(lastSelected) === tenantId) {
    // createMessage.info('选择一致');
    return;
  }
  await tenantDynamicToggle(tenantId);
  lastSelected.value = tenantId;
  message.success(
    `${$t('component.tenantToggle.switch')} ${option.companyName}`,
  );
  close(true);
  // 需要放在宏队列处理 直接清空页面由于没有字典会有样式问题(标签变成unknown)
  setTimeout(() => dictStore.resetCache());
};

async function onDeselect() {
  await tenantDynamicClear();
  message.success($t('component.tenantToggle.reset'));
  lastSelected.value = '';
  close(false);
  // 需要放在宏队列处理 直接清空页面由于没有字典会有样式问题(标签变成unknown)
  setTimeout(() => dictStore.resetCache());
}

/**
 * select搜索使用
 * @param input 输入内容
 * @param option 选项
 */
function filterOption(input: string, option: TenantOption) {
  return option.companyName.toLowerCase().includes(input.toLowerCase());
}
</script>

<template>
  <div v-if="showToggle" class="mr-[8px] hidden md:block">
    <Select
      v-model:value="selected"
      :field-names="{ label: 'companyName', value: 'tenantId' }"
      :filter-option="filterOption"
      :options="tenantList"
      :placeholder="$t('component.tenantToggle.placeholder')"
      allow-clear
      class="w-60"
      show-search
      @deselect="onDeselect"
      @select="onSelected"
    />
  </div>
</template>

<style lang="scss" scoped>
// 当选中时 添加border样式
:deep(.ant-select-selector) {
  &:has(.ant-select-selection-item) {
    box-shadow: 0 0 10px hsl(var(--primary));
  }
}
</style>
