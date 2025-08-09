import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';
import type { DescItem } from '#/components/description';

import { DictEnum } from '@vben/constants';

import { Tag } from 'ant-design-vue';

import { getDictOptions } from '#/utils/dict';
import {
  renderDict,
  renderHttpMethodTag,
  renderJsonPreview,
} from '#/utils/render';

export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    fieldName: 'title',
    label: '系统模块',
  },
  {
    component: 'Input',
    fieldName: 'operName',
    label: '操作人员',
  },
  {
    component: 'Select',
    componentProps: {
      options: getDictOptions(DictEnum.SYS_OPER_TYPE),
    },
    fieldName: 'businessType',
    label: '操作类型',
  },
  {
    component: 'Input',
    fieldName: 'operIp',
    label: '操作IP',
  },
  {
    component: 'Select',
    componentProps: {
      options: getDictOptions(DictEnum.SYS_COMMON_STATUS),
    },
    fieldName: 'status',
    label: '状态',
  },
  {
    component: 'RangePicker',
    fieldName: 'createTime',
    label: '操作时间',
    componentProps: {
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
    },
  },
];

export const columns: VxeGridProps['columns'] = [
  { type: 'checkbox', width: 60 },
  { field: 'title', title: '系统模块' },
  {
    title: '操作类型',
    field: 'businessType',
    slots: {
      default: ({ row }) => {
        return renderDict(row.businessType, DictEnum.SYS_OPER_TYPE);
      },
    },
  },
  { field: 'operName', title: '操作人员' },
  { field: 'operIp', title: 'IP地址' },
  { field: 'operLocation', title: 'IP信息' },
  {
    field: 'status',
    title: '操作状态',
    slots: {
      default: ({ row }) => {
        return renderDict(row.status, DictEnum.SYS_COMMON_STATUS);
      },
    },
  },
  { field: 'operTime', title: '操作日期', sortable: true },
  {
    field: 'costTime',
    title: '操作耗时',
    sortable: true,
    formatter({ cellValue }) {
      return `${cellValue} ms`;
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

export const descSchema: DescItem[] = [
  {
    field: 'operId',
    label: '日志编号',
  },
  {
    field: 'status',
    label: '操作结果',
    render(value) {
      return renderDict(value, DictEnum.SYS_COMMON_STATUS);
    },
  },
  {
    field: 'title',
    label: '操作模块',
    labelMinWidth: 80,
    render(value, { businessType }) {
      const operType = renderDict(businessType, DictEnum.SYS_OPER_TYPE);
      return (
        <div class="flex items-center">
          <Tag>{value}</Tag>
          {operType}
        </div>
      );
    },
  },
  {
    field: 'operIp',
    label: '操作信息',
    render(_, data) {
      return `账号: ${data.operName} / ${data.deptName} / ${data.operIp} / ${data.operLocation}`;
    },
  },
  {
    field: 'operUrl',
    label: '请求信息',
    render(_, data) {
      const { operUrl, requestMethod } = data;
      const methodTag = renderHttpMethodTag(requestMethod);
      return (
        <span>
          {methodTag} {operUrl}
        </span>
      );
    },
  },
  {
    field: 'errorMsg',
    label: '异常信息',
    render(value) {
      return <span class="font-bold text-red-600">{value}</span>;
    },
    show: (data) => {
      return data && data.errorMsg !== '';
    },
  },
  {
    field: 'method',
    label: '方法',
  },
  /**
   * 默认word-break: break-word;会导致json预览样式异常
   */
  {
    field: 'operParam',
    label: '请求参数',
    render(value) {
      return (
        <div class="max-h-[300px] w-full overflow-y-auto">
          {renderJsonPreview(value)}
        </div>
      );
    },
  },
  {
    field: 'jsonResult',
    label: '响应参数',
    render(value) {
      return (
        <div class="max-h-[300px] w-full overflow-y-auto">
          {renderJsonPreview(value)}
        </div>
      );
    },
    show(data) {
      return data && data.jsonResult;
    },
  },
  {
    field: 'costTime',
    label: '耗时',
    render(value) {
      return `${value} ms`;
    },
  },
  {
    field: 'operTime',
    label: '操作时间',
  },
];
