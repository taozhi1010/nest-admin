<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';

import type { VxeGridProps } from '#/adapter/vxe-table';
import type { Menu } from '#/api/system/menu/model';

import { computed } from 'vue';

import { useAccess } from '@vben/access';
import { Fallback, Page, useVbenDrawer } from '@vben/common-ui';
import { eachTree, getVxePopupContainer } from '@vben/utils';

import { Popconfirm, Space } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { menuList, menuRemove } from '#/api/system/menu';

import { columns, querySchema } from './data';
import menuDrawer from './menu-drawer.vue';

/**
 * 不要问为什么有两个根节点 v-if会控制只会渲染一个
 */

const formOptions: VbenFormProps = {
  commonConfig: {
    labelWidth: 80,
    componentProps: {
      allowClear: true,
    },
  },
  schema: querySchema(),
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
};

const gridOptions: VxeGridProps = {
  columns,
  height: 'auto',
  keepSource: true,
  pagerConfig: {
    enabled: false,
  },
  proxyConfig: {
    ajax: {
      query: async (_, formValues = {}) => {
        const resp = await menuList({
          ...formValues,
        });
        return { rows: resp };
      },
    },
  },
  rowConfig: {
    keyField: 'menuId',
  },
  /**
   * 开启虚拟滚动
   * 数据量小可以选择关闭
   * 如果遇到样式问题(空白、错位 滚动等)可以选择关闭虚拟滚动
   */
  scrollY: {
    enabled: true,
    gt: 0,
  },
  treeConfig: {
    parentField: 'parentId',
    rowField: 'menuId',
    // 自动转换为tree 由vxe处理 无需手动转换
    transform: true,
  },
  id: 'system-menu-index',
};

const [BasicTable, tableApi] = useVbenVxeGrid({
  formOptions,
  gridOptions,
  gridEvents: {
    cellDblclick: (e) => {
      const { row = {} } = e;
      if (!row?.children) {
        return;
      }
      const isExpanded = row?.expand;
      tableApi.grid.setTreeExpand(row, !isExpanded);
      row.expand = !isExpanded;
    },
    // 需要监听使用箭头展开的情况 否则展开/折叠的数据不一致
    toggleTreeExpand: (e) => {
      const { row = {}, expanded } = e;
      row.expand = expanded;
    },
  },
});
const [MenuDrawer, drawerApi] = useVbenDrawer({
  connectedComponent: menuDrawer,
});

function handleAdd() {
  drawerApi.setData({});
  drawerApi.open();
}

function handleSubAdd(row: Menu) {
  const { menuId } = row;
  drawerApi.setData({ id: menuId, update: false });
  drawerApi.open();
}

async function handleEdit(record: Menu) {
  drawerApi.setData({ id: record.menuId, update: true });
  drawerApi.open();
}

async function handleDelete(row: Menu) {
  await menuRemove([row.menuId]);
  await tableApi.query();
}

/**
 * 全部展开/折叠
 * @param expand 是否展开
 */
function setExpandOrCollapse(expand: boolean) {
  eachTree(tableApi.grid.getData(), (item) => (item.expand = expand));
  tableApi.grid?.setAllTreeExpand(expand);
}

/**
 * 与后台逻辑相同
 * 只有租户管理和超级管理能访问菜单管理
 */
const { hasAccessByRoles } = useAccess();
const isAdmin = computed(() => {
  return hasAccessByRoles(['admin', 'superadmin']);
});
</script>

<template>
  <Page v-if="isAdmin" :auto-content-height="true">
    <BasicTable table-title="菜单列表" table-title-help="双击展开/收起子菜单">
      <template #toolbar-tools>
        <Space>
          <a-button @click="setExpandOrCollapse(false)">
            {{ $t('pages.common.collapse') }}
          </a-button>
          <a-button @click="setExpandOrCollapse(true)">
            {{ $t('pages.common.expand') }}
          </a-button>
          <a-button
            type="primary"
            v-access:code="['system:menu:add']"
            @click="handleAdd"
          >
            {{ $t('pages.common.add') }}
          </a-button>
        </Space>
      </template>
      <template #action="{ row }">
        <Space>
          <ghost-button
            v-access:code="['system:menu:edit']"
            @click="handleEdit(row)"
          >
            {{ $t('pages.common.edit') }}
          </ghost-button>
          <!-- '按钮类型'无法再添加子菜单 -->
          <ghost-button
            v-if="row.menuType !== 'F'"
            class="btn-success"
            v-access:code="['system:menu:add']"
            @click="handleSubAdd(row)"
          >
            {{ $t('pages.common.add') }}
          </ghost-button>
          <Popconfirm
            :get-popup-container="getVxePopupContainer"
            placement="left"
            title="确认删除？"
            @confirm="handleDelete(row)"
          >
            <ghost-button
              danger
              v-access:code="['system:menu:remove']"
              @click.stop=""
            >
              {{ $t('pages.common.delete') }}
            </ghost-button>
          </Popconfirm>
        </Space>
      </template>
    </BasicTable>
    <MenuDrawer @reload="tableApi.query()" />
  </Page>
  <Fallback v-else description="您没有菜单管理的访问权限" status="403" />
</template>
