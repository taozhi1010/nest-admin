import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

// 缓存列表列配置
export const columns: VxeGridProps['columns'] = [
  {
    type: 'seq',
    title: '序号',
    width: 60,
  },
  {
    title: '缓存名称',
    field: 'cacheName',
  },
  {
    title: '备注',
    field: 'remark',
  },
  {
    title: '操作',
    field: 'action',
    width: 100,
    fixed: 'right',
    slots: { default: 'action' },
  },
];

// 键名列表列配置
export const keyColumns: VxeGridProps['columns'] = [
  {
    type: 'seq',
    title: '序号',
    width: 60,
  },
  {
    title: '缓存键名',
    field: 'cacheKey',
  },
  {
    title: '操作',
    field: 'action',
    width: 100,
    fixed: 'right',
    slots: { default: 'action' },
  },
]; 