<template>
  <Space>
    <!-- 主操作按钮 -->
    <template v-for="action in mainActions" :key="action.key">
      <template v-if="action.popConfirm">
        <Popconfirm
          :placement="action.popConfirm?.placement || 'left'"
          :title="action.popConfirm?.title"
          @confirm="handleAction(action, row)"
        >
          <ghost-button v-if="!action.hide" v-access:code="action.auth || []" :danger="action.danger" @click.stop="">
            {{ action.label }}
          </ghost-button>
        </Popconfirm>
      </template>
      <ghost-button
        v-else-if="!action.hide"
        v-access:code="action.auth || []"
        :danger="action.danger"
        @click.stop="handleAction(action, row)"
      >
        {{ action.label }}
      </ghost-button>
    </template>

    <!-- 下拉菜单 -->
    <Dropdown v-if="dropdownActions.length" placement="bottomRight">
      <template #overlay>
        <Menu>
          <MenuItem v-for="action in dropdownActions" :key="action.key" @click="handleAction(action, row)">
            <Popconfirm v-if="action.popConfirm" :title="action.popConfirm?.title" @confirm="handleAction(action, row)">
              {{ action.label }}
            </Popconfirm>
            <div v-else :danger="action.danger" @click.stop="handleAction(action, row)">
              {{ action.label }}
            </div>
          </MenuItem>
        </Menu>
      </template>
      <a-button size="small" type="link">
        {{ dropdownText }}
      </a-button>
    </Dropdown>
  </Space>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { Space, Popconfirm, Dropdown, Menu, MenuItem, Button } from 'ant-design-vue';
import type { ActionItem } from './types';

defineOptions({
  name: 'TableAction',
});

interface Props {
  actions: ActionItem[];
  row: any;
  dropdownText?: string;
  maxMainActions?: number;
}

const props = withDefaults(defineProps<Props>(), {
  dropdownText: '更多',
  maxMainActions: 2,
});

const emit = defineEmits(['action']);

// 将操作分为主操作和下拉菜单操作
const mainActions = computed(() => {
  return props.actions.slice(0, props.maxMainActions);
});

const dropdownActions = computed(() => {
  return props.actions.slice(props.maxMainActions);
});

// 处理操作点击
const handleAction = (action: ActionItem, row: any) => {
  if (action.onClick) {
    action.onClick(row);
  } else {
    emit('action', { action, row });
  }
};
</script>
