import type { VxeGridProps } from '#/adapter/vxe-table';

import { type FormSchemaGetter } from '#/adapter/form';

export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Select',
    fieldName: 'dataName',
    label: '数据源',
    defaultValue: '',
    componentProps: {
      allowClear: false,
    },
  },
  {
    component: 'Input',
    fieldName: 'tableName',
    label: '表名称',
  },
  {
    component: 'Input',
    fieldName: 'tableComment',
    label: '表描述',
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
    field: 'tableName',
    title: '表名称',
  },
  {
    field: 'tableComment',
    title: '表描述',
  },
  {
    field: 'className',
    title: '实体类',
  },
  {
    field: 'createTime',
    title: '创建时间',
  },
  {
    field: 'updateTime',
    title: '更新时间',
  },
  {
    field: 'action',
    fixed: 'right',
    slots: { default: 'action' },
    title: '操作',
    width: 300,
  },
];
