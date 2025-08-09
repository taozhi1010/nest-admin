import type { Recordable } from '@vben/types';

import type { VxeGridProps } from '#/adapter/vxe-table';

import { reactive } from 'vue';

import { getPopupContainer } from '@vben/utils';

import { Checkbox, Input, Select } from 'ant-design-vue';

import { dictOptionSelectList } from '#/api/system/dict/dict-type';

const JavaTypes: string[] = [
  'Long',
  'String',
  'Integer',
  'Double',
  'BigDecimal',
  'Date',
  'Boolean',
  'LocalDate',
  'LocalDateTime',
];

const queryTypeOptions = [
  { label: '=', value: 'EQ' },
  { label: '!=', value: 'NE' },
  { label: '>', value: 'GT' },
  { label: '>=', value: 'GE' },
  { label: '<', value: 'LT' },
  { label: '<=', value: 'LE' },
  { label: 'LIKE', value: 'LIKE' },
  { label: 'BETWEEN', value: 'BETWEEN' },
];

const componentsOptions = [
  { label: '文本框', value: 'input' },
  { label: '文本域', value: 'textarea' },
  { label: '下拉框', value: 'select' },
  { label: '单选框', value: 'radio' },
  { label: '复选框', value: 'checkbox' },
  { label: '日期控件', value: 'datetime' },
  { label: '图片上传', value: 'imageUpload' },
  { label: '文件上传', value: 'fileUpload' },
  { label: '富文本', value: 'editor' },
];

const dictOptions = reactive<{ label: string; value: string }[]>([
  { label: '未设置', value: '' },
]);
/**
 * 在这里初始化字典下拉框
 */
(async function init() {
  const ret = await dictOptionSelectList();

  ret.forEach((dict) => {
    const option = {
      label: `${dict.dictName} | ${dict.dictType}`,
      value: dict.dictType,
    };
    dictOptions.push(option);
  });
})();

function renderBooleanTag(row: Recordable<any>, field: string) {
  const value = row[field] ? '是' : '否';
  const className = row[field] ? 'text-green-500' : 'text-red-500';
  return <span class={className}>{value}</span>;
}

function renderBooleanCheckbox(row: Recordable<any>, field: string) {
  return <Checkbox v-model:checked={row[field]}></Checkbox>;
}

export const validRules: VxeGridProps['editRules'] = {
  columnComment: [{ required: true, message: '请输入' }],
  javaField: [{ required: true, message: '请输入' }],
};

export const vxeTableColumns: VxeGridProps['columns'] = [
  {
    title: '序号',
    type: 'seq',
    fixed: 'left',
    width: '50',
    align: 'center',
  },
  {
    title: '字段列名',
    field: 'columnName',
    showOverflow: 'tooltip',
    fixed: 'left',
    minWidth: 150,
  },
  {
    title: '字段描述',
    field: 'columnComment',
    minWidth: 150,
    slots: {
      edit: ({ row }) => {
        return <Input v-model:value={row.columnComment}></Input>;
      },
    },
    editRender: {},
  },
  {
    title: 'db类型',
    field: 'columnType',
    minWidth: 120,
    showOverflow: 'tooltip',
  },
  {
    title: 'Java类型',
    field: 'javaType',
    minWidth: 150,
    slots: {
      edit: ({ row }) => {
        const javaTypeOptions = JavaTypes.map((type) => ({
          label: type,
          value: type,
        }));
        return (
          <Select
            class="w-full"
            getPopupContainer={getPopupContainer}
            options={javaTypeOptions}
            v-model:value={row.javaType}
          ></Select>
        );
      },
    },
    editRender: {},
  },
  {
    title: 'Java属性名',
    field: 'javaField',
    minWidth: 150,
    showOverflow: 'tooltip',
    slots: {
      edit: ({ row }) => {
        return <Input v-model:value={row.javaField}></Input>;
      },
    },
    editRender: {},
  },
  {
    title: '插入',
    field: 'insert',
    minWidth: 80,
    showOverflow: 'tooltip',
    align: 'center',
    slots: {
      default: ({ row }) => {
        return renderBooleanTag(row, 'insert');
      },
      edit: ({ row }) => {
        return renderBooleanCheckbox(row, 'insert');
      },
    },
    editRender: {},
  },
  {
    title: '编辑',
    field: 'edit',
    showOverflow: 'tooltip',
    align: 'center',
    minWidth: 80,
    slots: {
      default: ({ row }) => {
        return renderBooleanTag(row, 'edit');
      },
      edit: ({ row }) => {
        return renderBooleanCheckbox(row, 'edit');
      },
    },
    editRender: {},
  },
  {
    title: '列表',
    field: 'list',
    showOverflow: 'tooltip',
    align: 'center',
    minWidth: 80,
    slots: {
      default: ({ row }) => {
        return renderBooleanTag(row, 'list');
      },
      edit: ({ row }) => {
        return renderBooleanCheckbox(row, 'list');
      },
    },
    editRender: {},
  },
  {
    title: '查询',
    field: 'query',
    showOverflow: 'tooltip',
    align: 'center',
    minWidth: 80,
    slots: {
      default: ({ row }) => {
        return renderBooleanTag(row, 'query');
      },
      edit: ({ row }) => {
        return renderBooleanCheckbox(row, 'query');
      },
    },
    editRender: {},
  },
  {
    title: '查询方式',
    field: 'queryType',
    showOverflow: 'tooltip',
    align: 'center',
    minWidth: 150,
    slots: {
      default: ({ row }) => {
        const queryType = row.queryType;
        const found = queryTypeOptions.find((item) => item.value === queryType);
        if (found) {
          return found.label;
        }
        return queryType;
      },
      edit: ({ row }) => {
        return (
          <Select
            class="w-full"
            getPopupContainer={getPopupContainer}
            options={queryTypeOptions}
            v-model:value={row.queryType}
          ></Select>
        );
      },
    },
    editRender: {},
  },
  {
    title: '必填',
    field: 'required',
    showOverflow: 'tooltip',
    align: 'center',
    minWidth: 80,
    slots: {
      default: ({ row }) => {
        return renderBooleanTag(row, 'required');
      },
      edit: ({ row }) => {
        return renderBooleanCheckbox(row, 'required');
      },
    },
    editRender: {},
  },
  {
    title: '显示类型',
    field: 'htmlType',
    showOverflow: 'tooltip',
    minWidth: 150,
    align: 'center',
    slots: {
      default: ({ row }) => {
        const htmlType = row.htmlType;
        const found = componentsOptions.find((item) => item.value === htmlType);
        if (found) {
          return found.label;
        }
        return htmlType;
      },
      edit: ({ row }) => {
        return (
          <Select
            class="w-full"
            getPopupContainer={getPopupContainer}
            options={componentsOptions}
            v-model:value={row.htmlType}
          ></Select>
        );
      },
    },
    editRender: {},
  },
  {
    title: '字典类型',
    field: 'dictType',
    showOverflow: 'tooltip',
    minWidth: 230,
    align: 'center',
    titlePrefix: {
      message: `仅'下拉框', '单选框', '复选框'支持字典类型`,
    },
    slots: {
      default: ({ row }) => {
        const dictType = row.dictType;
        const found = dictOptions.find((item) => item.value === dictType);
        if (found) {
          return found.label;
        }
        return dictType;
      },
      edit: ({ row }) => {
        // 清除的回调 需要设置为空字符串 否则不会提交
        const onDeselect = () => {
          row.dictType = '';
        };
        const disabled =
          row.htmlType !== 'select' &&
          row.htmlType !== 'radio' &&
          row.htmlType !== 'checkbox';
        return (
          <Select
            allowClear={true}
            class="w-full"
            disabled={disabled}
            getPopupContainer={getPopupContainer}
            onDeselect={onDeselect}
            options={dictOptions}
            placeholder="请选择字典类型"
            v-model:value={row.dictType}
          ></Select>
        );
      },
    },
    editRender: {},
  },
];
