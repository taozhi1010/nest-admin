<script setup lang="tsx">
import type { VxeGridProps } from '@vben/plugins/vxe-table';

import type { BindItem } from '../../oauth-common';

import { computed, ref, unref } from 'vue';

import { useVbenVxeGrid } from '@vben/plugins/vxe-table';

import { Alert, Avatar, Card, List, ListItem, Modal } from 'ant-design-vue';

import { authUnbinding } from '#/api';
import { socialList } from '#/api/system/social';

import { accountBindList, handleAuthBinding } from '../../oauth-common';

function buttonText(item: BindItem) {
  return item.bound ? '已绑定' : '绑定';
}

/**
 * 已经绑定的平台
 */
const boundPlatformsList = ref<string[]>([]);
const bindList = computed<BindItem[]>(() => {
  const list = [...accountBindList];
  list.forEach((item) => {
    item.bound = !!unref(boundPlatformsList).includes(item.source);
  });
  return list;
});

const gridOptions: VxeGridProps = {
  columns: [
    {
      field: 'source',
      title: '绑定平台',
    },
    {
      slots: {
        default: ({ row }) => {
          return <Avatar src={row.avatar} />;
        },
      },
      field: 'avatar',
      title: '头像',
    },
    {
      align: 'center',
      field: 'username',
      title: '账号',
    },
    {
      align: 'center',
      slots: {
        default: 'action',
      },
      title: '操作',
    },
  ],
  height: 220,
  keepSource: true,
  pagerConfig: {
    enabled: false,
  },
  toolbarConfig: {
    enabled: false,
  },
  proxyConfig: {
    ajax: {
      query: async () => {
        const resp = await socialList();
        /**
         * 平台转小写
         * 已经绑定的平台
         */
        boundPlatformsList.value = resp.map((item) =>
          item.source.toLowerCase(),
        );
        return {
          rows: resp,
        };
      },
    },
  },
  rowConfig: {
    isCurrent: false,
    keyField: 'id',
  },
  id: 'profile-bind-table',
};

const [BasicTable, tableApi] = useVbenVxeGrid({
  gridOptions,
});

/**
 * 解绑账号
 */
function handleUnbind(record: Record<string, any>) {
  Modal.confirm({
    content: `确定解绑[${record.source}]平台的[${record.username}]账号吗？`,
    async onOk() {
      await authUnbinding(record.id);
      await tableApi.reload();
    },
    title: '提示',
    type: 'warning',
  });
}
</script>

<template>
  <div class="flex flex-col gap-[16px]">
    <BasicTable>
      <template #action="{ row }">
        <a-button type="link" @click="handleUnbind(row)">解绑</a-button>
      </template>
    </BasicTable>
    <div class="pb-3">
      <List
        :data-source="bindList"
        :grid="{ gutter: 8, xs: 1, sm: 1, md: 2, lg: 3, xl: 3, xxl: 3 }"
      >
        <template #renderItem="{ item }">
          <ListItem>
            <Card>
              <div class="flex w-full items-center gap-4">
                <component
                  :is="item.avatar"
                  v-if="item.avatar"
                  :style="item?.style ?? {}"
                  class="size-[40px]"
                />
                <div class="flex flex-1 items-center justify-between">
                  <div class="flex flex-col">
                    <h4
                      class="mb-[4px] text-[14px] text-black/85 dark:text-white/85"
                    >
                      {{ item.title }}
                    </h4>
                    <span class="text-black/45 dark:text-white/45">
                      {{ item.description }}
                    </span>
                  </div>
                  <a-button
                    :disabled="item.bound"
                    size="small"
                    type="link"
                    @click="handleAuthBinding(item.source)"
                  >
                    {{ buttonText(item) }}
                  </a-button>
                </div>
              </div>
            </Card>
          </ListItem>
        </template>
      </List>
      <Alert message="说明" type="info">
        <template #description>
          <p>
            需要添加第三方账号在
            <span class="font-bold">
              apps\web-antd\src\views\_core\oauth-common.ts
            </span>
            中accountBindList按模板添加
          </p>
        </template>
      </Alert>
    </div>
  </div>
</template>

<style lang="scss" scoped>
/**
list item 间距
*/
:deep(.ant-list-item) {
  padding: 6px;
}
</style>
