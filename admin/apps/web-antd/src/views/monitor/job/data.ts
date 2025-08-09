import type { VxeGridProps } from '#/adapter/vxe-table';
import type { DescItem } from '#/components/description';

import { DictEnum } from '@vben/constants';

import { type FormSchemaGetter } from '#/adapter/form';
import { getDictOptions } from '#/utils/dict';
import { renderDict } from '#/utils/render';
import type { ActionItem } from '#/components/table/src/types';

// 查询表单配置
export const querySchema: FormSchemaGetter = () => [
	{
		component: 'Input',
		fieldName: 'jobName',
		label: '任务名称',
	},
	{
		component: 'Select',
		componentProps: {
			options: getDictOptions(DictEnum.SYS_JOB_GROUP),
		},
		fieldName: 'jobGroup',
		label: '任务组名',
	},
	{
		component: 'Select',
		componentProps: {
			options: getDictOptions(DictEnum.SYS_NORMAL_DISABLE),
		},
		fieldName: 'status',
		label: '任务状态',
	}
];

// 表格列配置
export const columns: VxeGridProps['columns'] = [
	{ type: 'checkbox', width: 60 },
	{
		title: '任务编号',
		field: 'jobId',
		width: 100
	},
	{
		title: '任务名称',
		field: 'jobName',
	},
	{
		title: '任务组名',
		field: 'jobGroup',
		slots: {
			default: ({ row }) => {
				return renderDict(row.jobGroup, DictEnum.SYS_JOB_GROUP);
			},
		},
	},
	{
		title: '调用目标字符串',
		field: 'invokeTarget',
	},
	{
		title: 'cron执行表达式',
		field: 'cronExpression',
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
		width: 400,
	},
];

// 详情弹窗配置
export const modalSchema: FormSchemaGetter = () => [
	{
		component: 'Input',
		dependencies: {
			show: () => false,
			triggerFields: [''],
		},
		fieldName: 'jobId',
		label: '任务编号',
	},
	{
		component: 'Input',
		fieldName: 'jobName',
		label: '任务名称',
		rules: 'required',
	},
	{
		component: 'Select',
		componentProps: {
			options: getDictOptions(DictEnum.SYS_JOB_GROUP),
		},
		fieldName: 'jobGroup',
		label: '任务组名',
		rules: 'required',
	},
	{
		component: 'Input',
		fieldName: 'cronExpression',
		label: 'cron表达式',
		rules: 'required',
	},
	{
		component: 'Input',
		fieldName: 'invokeTarget',
		label: '调用目标方法',
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
		label: '任务状态',
		rules: 'required',
	},
	{
		component: 'RadioGroup',
		componentProps: {
			buttonStyle: 'solid',
			options: [
				{ label: '允许', value: '0' },
				{ label: '禁止', value: '1' }
			],
			optionType: 'button',
		},
		defaultValue: '1',
		fieldName: 'concurrent',
		label: '是否并发',
		rules: 'required',
	},
	{
		component: 'RadioGroup',
		componentProps: {
			buttonStyle: 'solid',
			options: [
				{ label: '立即执行', value: '1' },
				{ label: '执行一次', value: '2' },
				{ label: '放弃执行', value: '3' }
			],
			optionType: 'button',
		},
		defaultValue: '1',
		fieldName: 'misfirePolicy',
		label: '执行策略',
		rules: 'required',
	}
];

export const logColumns: VxeGridProps['columns'] = [
	{
		title: '任务日志ID',
		field: 'jobLogId',
		width: 100,
	},
	{
		title: '任务名称',
		field: 'jobName',
	},
	{
		title: '任务组名',
		field: 'jobGroup',
		width: 100,
		slots: {
			default: ({ row }) => {
				return renderDict(row.jobGroup, DictEnum.SYS_JOB_GROUP);
			},
		},
	},
	{
		title: '调用目标字符串',
		field: 'invokeTarget',
	},
	{
		title: '日志信息',
		field: 'jobMessage',
	},
	{
		title: '异常信息',
		field: 'exceptionInfo',
	},
	{
		title: '执行状态',
		field: 'status',
		width: 100,
		slots: {
			default: ({ row }) => {
				return row.status === '0' ? '正常' : '失败';
			},
		},
	},
	{
		title: '创建时间',
		field: 'createTime',
		width: 180,
		slots: {
			default: 'createTime',
		},
	},
];

export function logQuerySchema() {
	return [
		{
			component: 'Input',
			fieldName: 'jobName',
			label: '任务名称',
		},
		{
			component: 'Select',
			componentProps: {
				options: getDictOptions(DictEnum.SYS_JOB_GROUP),
			},
			fieldName: 'jobGroup',
			label: '任务组名',
		},
		{
			component: 'Select',
			componentProps: {
				options: [
					{ label: '正常', value: '0' },
					{ label: '失败', value: '1' },
				],
			},
			fieldName: 'status',
			label: '执行状态',
		},
		{
			component: 'RangePicker',
			fieldName: 'createTime',
			label: '执行时间',
			componentProps: {
				showTime: true,
				format: 'YYYY-MM-DD HH:mm:ss',
				valueFormat: 'YYYY-MM-DD HH:mm:ss',
			},
		},
	];
}
