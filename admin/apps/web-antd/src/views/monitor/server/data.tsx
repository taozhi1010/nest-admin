import type { DescItem } from '#/components/description';
import { Progress } from 'ant-design-vue';

export const cpuSchema: DescItem[] = [
  {
    field: 'cpuNum',
    label: 'CPU核心数',
		span: 4,
  },
  {
    field: 'free',
    label: '当前空闲率',
		span: 4,
    render: (val) => {
      return (
        <div class="flex items-center">
          <div class="mr-2">空闲率: {Number(val).toFixed(2)}%</div>
          <Progress percent={100} success={{ percent: Number(val) }} showInfo={false} />
          <div class="ml-2">使用率: {(100 - Number(val)).toFixed(2)}%</div>
        </div>
      );
    },
  },
];

export const memSchema: DescItem[] = [
  {
    field: 'total',
    label: '内存总量',
		span: 4,
    render: (val) => `${val} GB`,
  },
  {
    field: 'used',
    label: '已用内存',
		span: 1,
    render: (val) => `${val} GB`,
  },
  {
    field: 'free',
    label: '剩余内存',
		span: 1,
    render: (val) => `${val} GB`,
  },
  {
    field: 'usage',
    label: '使用率',
		span: 4,
    render: (val) => {
      return (
        <div class="w-full pr-2">
          <Progress percent={Number(val)} status="active" />
        </div>
      );
    },
  },
];

export const sysSchema: DescItem[] = [
  {
    field: 'computerName',
    label: '服务器名称',
  },
  {
    field: 'computerIp',
    label: '服务器IP',
  },
  {
    field: 'userDir',
    label: '项目路径',
  },
  {
    field: 'osName',
    label: '操作系统',
  },
  {
    field: 'osArch',
    label: '系统架构',
  },
];

export const columns = [
  {
    title: '盘符路径',
    dataIndex: 'dirName',
    key: 'dirName',
  },
  {
    title: '文件系统',
    dataIndex: 'typeName',
    key: 'typeName',
  },
  {
    title: '总大小',
    dataIndex: 'total',
    key: 'total',
  },
  {
    title: '已用大小',
    dataIndex: 'used',
    key: 'used',
  },
  {
    title: '可用大小',
    dataIndex: 'free',
    key: 'free',
  },
  {
    title: '使用率',
    dataIndex: 'usage',
    key: 'usage',
  },
];
