import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { DictEnum } from '@vben/constants';
import { getPopupContainer } from '@vben/utils';

import { getDictOptions } from '#/utils/dict';
import { renderDict, renderDictTags } from '#/utils/render';

export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    fieldName: 'clientKey',
    label: '客户端key',
  },
  {
    component: 'Input',
    fieldName: 'clientSecret',
    label: '客户端密钥',
  },
  {
    component: 'Select',
    componentProps: {
      options: getDictOptions(DictEnum.SYS_NORMAL_DISABLE),
    },
    fieldName: 'status',
    label: '状态',
  },
];

export const columns: VxeGridProps['columns'] = [
  { type: 'checkbox', width: 60 },
  {
    title: '客户端ID',
    field: 'clientId',
    showOverflow: true,
  },
  {
    title: '客户端key',
    field: 'clientKey',
  },
  {
    title: '客户端密钥',
    field: 'clientSecret',
  },
  {
    title: '授权类型',
    field: 'grantTypeList',
    slots: {
      default: ({ row }) => {
        if (!row.grantTypeList) {
          return '无';
        }
        return renderDictTags(
          row.grantTypeList,
          getDictOptions(DictEnum.SYS_GRANT_TYPE),
          true,
          4,
        );
      },
    },
  },
  {
    title: '设备类型',
    field: 'deviceType',
    slots: {
      default: ({ row }) => {
        return renderDict(row.deviceType, DictEnum.SYS_DEVICE_TYPE);
      },
    },
  },
  {
    title: 'token活跃时间',
    field: 'activeTimeout',
    formatter({ row }) {
      return `${row.activeTimeout}秒`;
    },
  },
  {
    title: 'token超时时间',
    field: 'timeout',
    formatter({ row }) {
      return `${row.timeout}秒`;
    },
  },
  {
    title: '状态',
    field: 'status',
    slots: {
      default: 'status',
    },
  },
  {
    field: 'action',
    fixed: 'right',
    slots: { default: 'action' },
    title: '操作',
    width: 180,
  },
];

export const drawerSchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    dependencies: {
      show: () => false,
      triggerFields: [''],
    },
    fieldName: 'id',
    label: 'id',
  },
  {
    component: 'Input',
    componentProps: {
      disabled: true,
    },
    dependencies: {
      show: () => false,
      triggerFields: [''],
    },
    fieldName: 'clientId',
    label: '客户端ID',
  },
  {
    component: 'Input',
    fieldName: 'clientKey',
    label: '客户端key',
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'clientSecret',
    label: '客户端密钥',
    rules: 'required',
  },
  {
    component: 'Select',
    componentProps: {
      getPopupContainer,
      mode: 'multiple',
      optionFilterProp: 'label',
      options: getDictOptions(DictEnum.SYS_GRANT_TYPE),
    },
    fieldName: 'grantTypeList',
    label: '授权类型',
    rules: 'selectRequired',
  },
  {
    component: 'Select',
    componentProps: {
      allowClear: false,
      getPopupContainer,
      options: getDictOptions(DictEnum.SYS_DEVICE_TYPE),
    },
    fieldName: 'deviceType',
    label: '设备类型',
    rules: 'selectRequired',
  },
  {
    component: 'InputNumber',
    componentProps: {
      addonAfter: '秒',
      placeholder: '请输入',
    },
    defaultValue: 1800,
    fieldName: 'activeTimeout',
    formItemClass: 'col-span-2 lg:col-span-1',
    help: '指定时间无操作则过期(单位：秒), 默认30分钟(1800秒)',
    label: 'Token活跃超时时间',
    rules: 'required',
  },
  {
    component: 'InputNumber',
    componentProps: {
      addonAfter: '秒',
    },
    defaultValue: 604_800,
    fieldName: 'timeout',
    formItemClass: 'col-span-2 lg:col-span-1 ',
    help: '指定时间必定过期(单位：秒)，默认七天(604800秒)',
    label: 'Token固定超时时间',
    rules: 'required',
  },
  {
    component: 'RadioGroup',
    componentProps: {
      buttonStyle: 'solid',
      options: getDictOptions(DictEnum.SYS_NORMAL_DISABLE),
      optionType: 'button',
    },
    defaultValue: '0',
    fieldName: 'status',
    label: '状态',
  },
];
