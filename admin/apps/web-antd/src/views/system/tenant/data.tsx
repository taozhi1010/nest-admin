import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { getPopupContainer } from '@vben/utils';

import dayjs from 'dayjs';

import { z } from '#/adapter/form';

export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    fieldName: 'tenantId',
    label: '租户编号',
  },
  {
    component: 'Input',
    fieldName: 'companyName',
    label: '租户名称',
  },
  {
    component: 'Input',
    fieldName: 'contactUserName',
    label: '联系人',
  },
  {
    component: 'Input',
    fieldName: 'contactPhone',
    label: '联系电话',
  },
];

export const columns: VxeGridProps['columns'] = [
  { type: 'checkbox', width: 60 },
  {
    title: '租户编号',
    field: 'tenantId',
  },
  {
    title: '租户名称',
    field: 'companyName',
  },
  {
    title: '联系人',
    field: 'contactUserName',
  },
  {
    title: '联系电话',
    field: 'contactPhone',
  },
  {
    title: '到期时间',
    field: 'expireTime',
    formatter: ({ cellValue }) => {
      if (!cellValue) {
        return '无期限';
      }
      return cellValue;
    },
  },
  {
    title: '租户状态',
    field: 'status',
    slots: { default: 'status' },
  },
  {
    field: 'action',
    fixed: 'right',
    slots: { default: 'action' },
    title: '操作',
    width: 200,
  },
];

const defaultExpireTime = dayjs()
  .add(365, 'days')
  .startOf('day')
  .format('YYYY-MM-DD HH:mm:ss');

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
    dependencies: {
      show: () => false,
      triggerFields: [''],
    },
    fieldName: 'tenantId',
    label: 'tenantId',
  },
  {
    component: 'Divider',
    componentProps: {
      orientation: 'center',
    },
    fieldName: 'divider1',
    hideLabel: true,
    renderComponentContent: () => ({
      default: () => '基本信息',
    }),
  },
  {
    component: 'Input',
    fieldName: 'companyName',
    label: '企业名称',
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'contactUserName',
    label: '联系人',
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'contactPhone',
    label: '联系电话',
    rules: z
      .string()
      .regex(/^1[3-9]\d{9}$/, { message: '请输入正确的联系电话' }),
  },
  {
    component: 'Divider',
    componentProps: {
      orientation: 'center',
    },
    fieldName: 'divider2',
    hideLabel: true,
    renderComponentContent: () => ({
      default: () => '管理员信息',
    }),
    dependencies: {
      if: (values) => !values?.tenantId,
      triggerFields: ['tenantId'],
    },
  },
  {
    component: 'Input',
    fieldName: 'username',
    label: '用户账号',
    rules: 'required',
    dependencies: {
      if: (values) => !values?.tenantId,
      triggerFields: ['tenantId'],
    },
  },
  {
    component: 'InputPassword',
    fieldName: 'password',
    label: '用户密码',
    rules: 'required',
    dependencies: {
      if: (values) => !values?.tenantId,
      triggerFields: ['tenantId'],
    },
  },
  {
    component: 'Divider',
    componentProps: {
      orientation: 'center',
    },
    fieldName: 'divider3',
    hideLabel: true,
    renderComponentContent: () => ({
      default: () => '租户设置',
    }),
  },
  {
    component: 'Select',
    componentProps: {
      getPopupContainer,
    },
    fieldName: 'packageId',
    label: '租户套餐',
    rules: 'selectRequired',
  },
  {
    component: 'DatePicker',
    componentProps: {
      format: 'YYYY-MM-DD HH:mm:ss',
      showTime: true,
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
      getPopupContainer,
    },
    defaultValue: defaultExpireTime,
    fieldName: 'expireTime',
    help: `已经设置过期时间不允许重置为'无期限'\n即在开通时未设置无期限 以后都不允许设置`,
    label: '过期时间',
  },
  {
    component: 'InputNumber',
    componentProps: {
      min: -1,
    },
    defaultValue: -1,
    fieldName: 'accountCount',
    help: '-1不限制用户数量',
    label: '用户数量',
    renderComponentContent(model) {
      return {
        addonBefore: () =>
          model.accountCount === -1 ? '不限制数量' : '输入数量',
      };
    },
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'domain',
    help: '可填写域名/端口 填写域名如: www.test.com 或者 www.test.com:8080 填写ip:端口如: 127.0.0.1:8080',
    label: '绑定域名',
    renderComponentContent() {
      return {
        addonBefore: () => 'http(s)://',
      };
    },
    rules: z
      .string()
      .refine(
        (domain) =>
          !(domain.startsWith('http://') || domain.startsWith('https://')),
        { message: '请输入正确的域名, 不需要http(s)' },
      )
      .optional(),
  },
  {
    component: 'Divider',
    componentProps: {
      orientation: 'center',
    },
    fieldName: 'divider4',
    hideLabel: true,
    renderComponentContent: () => ({
      default: () => '企业信息',
    }),
  },
  {
    component: 'Input',
    fieldName: 'address',
    label: '企业地址',
  },
  {
    component: 'Input',
    fieldName: 'licenseNumber',
    label: '企业代码',
  },
  {
    component: 'Textarea',
    fieldName: 'intro',
    formItemClass: 'items-start',
    label: '企业介绍',
  },
  {
    component: 'Textarea',
    fieldName: 'remark',
    formItemClass: 'items-start',
    label: '备注',
  },
];
