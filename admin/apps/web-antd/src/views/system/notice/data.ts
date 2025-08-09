import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { DictEnum } from '@vben/constants';
import { getPopupContainer } from '@vben/utils';

import { getDictOptions } from '#/utils/dict';
import { renderDict } from '#/utils/render';

export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    fieldName: 'noticeTitle',
    label: '公告标题',
  },
  {
    component: 'Input',
    fieldName: 'createBy',
    label: '创建人',
  },
  {
    component: 'Select',
    componentProps: {
      getPopupContainer,
      options: getDictOptions(DictEnum.SYS_NOTICE_TYPE),
    },
    fieldName: 'noticeType',
    label: '公告类型',
  },
];

export const columns: VxeGridProps['columns'] = [
  { type: 'checkbox', width: 60 },
  {
    title: '公告标题',
    field: 'noticeTitle',
  },
  {
    title: '公告类型',
    field: 'noticeType',
    width: 120,
    slots: {
      default: ({ row }) => {
        return renderDict(row.noticeType, DictEnum.SYS_NOTICE_TYPE);
      },
    },
  },
  {
    title: '状态',
    field: 'status',
    width: 120,
    slots: {
      default: ({ row }) => {
        return renderDict(row.status, DictEnum.SYS_NOTICE_STATUS);
      },
    },
  },
  {
    title: '创建人',
    field: 'createByName',
    width: 150,
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
    fieldName: 'noticeId',
    label: '主键',
  },
  {
    component: 'Input',
    fieldName: 'noticeTitle',
    label: '公告标题',
    rules: 'required',
  },
  {
    component: 'RadioGroup',
    componentProps: {
      buttonStyle: 'solid',
      options: getDictOptions(DictEnum.SYS_NOTICE_STATUS),
      optionType: 'button',
    },
    defaultValue: '0',
    fieldName: 'status',
    label: '公告状态',
    rules: 'required',
    formItemClass: 'col-span-1',
  },
  {
    component: 'RadioGroup',
    componentProps: {
      buttonStyle: 'solid',
      options: getDictOptions(DictEnum.SYS_NOTICE_TYPE),
      optionType: 'button',
    },
    defaultValue: '1',
    fieldName: 'noticeType',
    label: '公告类型',
    rules: 'required',
    formItemClass: 'col-span-1',
  },
  {
    component: 'RichTextarea',
    componentProps: {
      width: '100%',
    },
    fieldName: 'noticeContent',
    label: '公告内容',
    rules: 'required',
  },
];
