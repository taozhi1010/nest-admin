import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    fieldName: 'packageName',
    label: '套餐名称',
  },
];

export const columns: VxeGridProps['columns'] = [
  { type: 'checkbox', width: 60 },
  {
    title: '套餐名称',
    field: 'packageName',
  },
  {
    title: '备注',
    field: 'remark',
  },
  {
    title: '状态',
    field: 'status',
    slots: { default: 'status' },
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
    fieldName: 'packageId',
  },
  {
    component: 'Radio',
    dependencies: {
      show: () => false,
      triggerFields: [''],
    },
    fieldName: 'menuCheckStrictly',
  },
  {
    component: 'Input',
    fieldName: 'packageName',
    label: '套餐名称',
    rules: 'required',
  },
  {
    component: 'menuIds',
    defaultValue: [],
    fieldName: 'menuIds',
    label: '关联菜单',
  },
  {
    component: 'Textarea',
    fieldName: 'remark',
    formItemClass: 'items-start',
    label: '备注',
  },
];

// 租户管理 不可分配  只有superadmin有权限操作 分配了也没用
export const excludeIds = [
  6, 121, 122, 1606, 1607, 1608, 1609, 1610, 1611, 1612, 1613, 1614, 1615,
];
