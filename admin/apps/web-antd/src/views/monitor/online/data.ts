import type { VNode } from 'vue';

import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import dayjs from 'dayjs';

import { renderBrowserIcon, renderOsIcon } from '#/utils/render';

export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    fieldName: 'ipaddr',
    label: 'IP地址',
  },
  {
    component: 'Input',
    fieldName: 'username',
    label: '用户账号',
  },
];

export const columns: VxeGridProps['columns'] = [
  // {
  //   title: '登录平台',
  //   field: 'deviceType',
  // },
  {
    title: '登录账号',
    field: 'username',
  },
  {
    title: '部门名称',
    field: 'deptName',
  },
  {
    title: 'IP地址',
    field: 'ipaddr',
  },
  {
    title: '登录地址',
    field: 'loginLocation',
  },
  {
    title: '浏览器',
    field: 'browser',
    slots: {
      default: ({ row }) => {
        return renderBrowserIcon(row.browser, true) as VNode;
      },
    },
  },
  {
    title: '系统',
    field: 'os',
    slots: {
      default: ({ row }) => {
        // Windows 10 or Windows Server 2016 太长了 分割一下 详情依旧能看到详细的
        let value = row.os;
        if (value) {
          const split = value.split(' or ');
          if (split.length === 2) {
            value = split[0];
          }
        }
        return renderOsIcon(value, true) as VNode;
      },
    },
  },
  {
    title: '登录时间',
    field: 'loginTime',
    formatter: ({ cellValue }) => {
      return dayjs(cellValue).format('YYYY-MM-DD HH:mm:ss');
    },
  },
  {
    field: 'action',
    fixed: 'right',
    slots: { default: 'action' },
    title: '操作',
    width: 120,
  },
];
