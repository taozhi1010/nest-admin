import type { VNode } from 'vue';

import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';
import type { DescItem } from '#/components/description';

import { DictEnum } from '@vben/constants';

import { getDictOptions } from '#/utils/dict';
import { renderBrowserIcon, renderDict, renderOsIcon } from '#/utils/render';

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
  {
    component: 'Select',
    componentProps: {
      options: getDictOptions(DictEnum.SYS_COMMON_STATUS),
    },
    fieldName: 'status',
    label: '登录状态',
  },
  {
    component: 'RangePicker',
    fieldName: 'dateTime',
    label: '登录日期',
  },
];

export const columns: VxeGridProps['columns'] = [
  { type: 'checkbox', width: 60 },
  {
    title: '用户账号',
    field: 'username',
  },
  {
    title: '登录平台',
    field: 'clientKey',
  },
  {
    title: 'IP地址',
    field: 'ipaddr',
  },
  {
    title: 'IP地点',
    field: 'loginLocation',
    width: 200,
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
        /**
         *  Windows 10 or Windows Server 2016 太长了 分割一下 详情依旧能看到详细的
         */
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
    title: '登录结果',
    field: 'status',
    slots: {
      default: ({ row }) => {
        return renderDict(row.status, DictEnum.SYS_COMMON_STATUS);
      },
    },
  },
  {
    title: '信息',
    field: 'msg',
  },
  {
    title: '日期',
    field: 'loginTime',
  },
  {
    field: 'action',
    fixed: 'right',
    slots: { default: 'action' },
    title: '操作',
    width: 150,
  },
];

export const modalSchema: () => DescItem[] = () => [
  {
    field: 'status',
    label: '登录状态',
    labelMinWidth: 80,
    render(value) {
      return renderDict(value, DictEnum.SYS_COMMON_STATUS);
    },
  },
  {
    field: 'clientKey',
    label: '登录平台',
    render(value) {
      if (value) {
        return value.toUpperCase();
      }
      return '';
    },
  },
  {
    field: 'ipaddr',
    label: '账号信息',
    render(_, data) {
      const { ipaddr, loginLocation, username } = data;
      return `账号: ${username} / ${ipaddr} / ${loginLocation}`;
    },
  },
  {
    field: 'loginTime',
    label: '登录时间',
  },
  {
    field: 'msg',
    label: '登录信息',
    render(_, data: any) {
      const { msg, status } = data;
      return (
        <span class={['font-bold', status === '0' ? '' : 'text-red-500']}>
          {msg}
        </span>
      );
    },
  },
  {
    field: 'os',
    label: '登录设备',
    render(value) {
      return renderOsIcon(value);
    },
  },
  {
    field: 'browser',
    label: '浏览器',
    render(value) {
      return renderBrowserIcon(value);
    },
  },
];
