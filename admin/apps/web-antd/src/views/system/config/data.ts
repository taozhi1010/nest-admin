import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { DictEnum } from '@vben/constants';
import { getPopupContainer } from '@vben/utils';

import { getDictOptions } from '#/utils/dict';
import { renderDict } from '#/utils/render';

export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    fieldName: 'configName',
    label: '参数名称',
  },
  {
    component: 'Input',
    fieldName: 'configKey',
    label: '参数键名',
  },
  {
    component: 'Select',
    componentProps: {
      getPopupContainer,
      options: getDictOptions(DictEnum.SYS_YES_NO),
    },
    fieldName: 'configType',
    label: '系统内置',
  },
  {
    component: 'RangePicker',
    fieldName: 'createTime',
    label: '创建时间',
  },
];

export const columns: VxeGridProps['columns'] = [
  { type: 'checkbox', width: 60 },
  {
    title: '参数名称',
    field: 'configName',
  },
  {
    title: '参数KEY',
    field: 'configKey',
  },
  {
    title: '参数Value',
    field: 'configValue',
  },
  {
    title: '系统内置',
    field: 'configType',
    width: 120,
    slots: {
      default: ({ row }) => {
        return renderDict(row.configType, DictEnum.SYS_YES_NO);
      },
    },
  },
  {
    title: '备注',
    field: 'remark',
  },
  {
    title: '创建时间',
    field: 'createTime',
  },
  {
    field: 'action',
    fixed: 'right',
    slots: { default: 'action' },
    title: '操作',
    width: 180,
  },
];

export const modalSchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    dependencies: {
      show: () => false,
      triggerFields: [''],
    },
    fieldName: 'configId',
    label: '参数主键',
  },
  {
    component: 'Input',
    fieldName: 'configName',
    label: '参数名称',
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'configKey',
    label: '参数键名',
    rules: 'required',
  },
  {
    component: 'Textarea',
    formItemClass: 'items-start',
    fieldName: 'configValue',
    label: '参数键值',
    componentProps: {
      autoSize: true,
    },
    rules: 'required',
  },
  {
    component: 'RadioGroup',
    componentProps: {
      buttonStyle: 'solid',
      options: getDictOptions(DictEnum.SYS_YES_NO),
      optionType: 'button',
    },
    defaultValue: 'N',
    fieldName: 'configType',
    label: '是否内置',
    rules: 'required',
  },
  {
    component: 'Textarea',
    fieldName: 'remark',
    formItemClass: 'items-start',
    label: '备注',
  },
];
