import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { z } from '#/adapter/form';

export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    fieldName: 'dictName',
    label: '字典名称',
  },
  {
    component: 'Input',
    fieldName: 'dictType',
    label: '字典类型',
  },
];

export const columns: VxeGridProps['columns'] = [
  { type: 'checkbox', width: 60 },
  {
    title: '字典名称',
    field: 'dictName',
  },
  {
    title: '字典类型',
    field: 'dictType',
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
    fieldName: 'dictId',
    label: 'dictId',
  },
  {
    component: 'Input',
    fieldName: 'dictName',
    label: '字典名称',
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'dictType',
    help: '使用英文/下划线命名, 如:sys_normal_disable',
    label: '字典类型',
    rules: z
      .string()
      .regex(/^[a-z_]+$/i, { message: '字典类型只能使用英文/下划线命名' }),
  },
  {
    component: 'Textarea',
    fieldName: 'remark',
    formItemClass: 'items-start',
    label: '备注',
  },
];
