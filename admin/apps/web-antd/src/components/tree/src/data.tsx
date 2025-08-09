import type { VxeGridProps } from '#/adapter/vxe-table';
import type { ID } from '#/api/common';
import type { MenuOption } from '#/api/system/menu/model';

import { h, markRaw } from 'vue';

import { FolderIcon, MenuIcon, OkButtonIcon, VbenIcon } from '@vben/icons';

export interface Permission {
  checked: boolean;
  id: ID;
  label: string;
}

export interface MenuPermissionOption extends MenuOption {
  permissions: Permission[];
}

const menuTypes = {
  C: { icon: markRaw(MenuIcon), value: '菜单' },
  F: { icon: markRaw(OkButtonIcon), value: '按钮' },
  M: { icon: markRaw(FolderIcon), value: '目录' },
};

export const nodeOptions = [
  { label: '节点关联', value: true },
  { label: '节点独立', value: false },
];

export const columns: VxeGridProps['columns'] = [
  {
    type: 'checkbox',
    title: '菜单名称',
    field: 'label',
    treeNode: true,
    headerAlign: 'left',
    align: 'left',
    width: 230,
  },
  {
    title: '图标',
    field: 'icon',
    width: 80,
    slots: {
      default: ({ row }) => {
        if (row?.icon === '#') {
          return '';
        }
        return (
          <span class={'flex justify-center'}>
            <VbenIcon icon={row.icon} />
          </span>
        );
      },
    },
  },
  {
    title: '类型',
    field: 'menuType',
    width: 80,
    slots: {
      default: ({ row }) => {
        const current = menuTypes[row.menuType as 'C' | 'F' | 'M'];
        if (!current) {
          return '未知';
        }
        return (
          <span class="flex items-center justify-center gap-1">
            {h(current.icon, { class: 'size-[18px]' })}
            <span>{current.value}</span>
          </span>
        );
      },
    },
  },
  {
    title: '权限标识',
    field: 'permissions',
    headerAlign: 'left',
    align: 'left',
    slots: {
      default: 'permissions',
    },
  },
];
