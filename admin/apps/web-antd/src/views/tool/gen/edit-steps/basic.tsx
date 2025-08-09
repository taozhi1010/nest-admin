import { getPopupContainer } from '@vben/utils';

import { type FormSchemaGetter, z } from '#/adapter/form';

export const formSchema: FormSchemaGetter = () => [
  {
    component: 'Divider',
    componentProps: {
      orientation: 'left',
    },
    fieldName: 'divider1',
    formItemClass: 'col-span-2',
    label: '基本信息',
  },
  {
    component: 'Input',
    fieldName: 'tableName',
    label: '表名称',
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'tableComment',
    label: '表描述',
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'className',
    label: '实体类名称',
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'functionAuthor',
    label: '作者',
    rules: 'required',
  },
  {
    component: 'Divider',
    componentProps: {
      orientation: 'left',
    },
    fieldName: 'divider2',
    formItemClass: 'col-span-2',
    label: '生成信息',
  },
  {
    component: 'Select',
    componentProps: {
      allowClear: false,
      getPopupContainer,
      options: [
        { label: '单表(增删改查)', value: 'crud' },
        { label: '树表(增删改查)', value: 'tree' },
      ],
    },
    defaultValue: 'crud',
    fieldName: 'tplCategory',
    label: '模板类型',
    rules: 'selectRequired',
  },
  {
    component: 'Select',
    componentProps: {
      getPopupContainer,
    },
    dependencies: {
      show: (values) => values.tplCategory === 'tree',
      triggerFields: ['tplCategory'],
    },
    fieldName: 'treeCode',
    helpMessage: '树节点显示的编码字段名， 如: dept_id (相当于id)',
    label: '树编码字段',
    rules: 'selectRequired',
  },
  {
    component: 'Select',
    componentProps: {
      allowClear: false,
    },
    dependencies: {
      show: (values) => values.tplCategory === 'tree',
      triggerFields: ['tplCategory'],
    },
    fieldName: 'treeParentCode',
    help: '树节点显示的父编码字段名， 如: parent_Id (相当于parentId)',
    label: '树父编码字段',
    rules: 'selectRequired',
  },
  {
    component: 'Select',
    componentProps: {
      allowClear: false,
    },
    dependencies: {
      show: (values) => values.tplCategory === 'tree',
      triggerFields: ['tplCategory'],
    },
    fieldName: 'treeName',
    help: '树节点的显示名称字段名， 如: dept_name (相当于label)',
    label: '树名称字段',
    rules: 'selectRequired',
  },
  {
    component: 'Input',
    fieldName: 'packageName',
    help: '生成在哪个java包下, 例如 com.ruoyi.system',
    label: '生成包路径',
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'moduleName',
    help: '可理解为子系统名，例如 system',
    label: '生成模块名',
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'businessName',
    help: '可理解为功能英文名，例如 user',
    label: '生成业务名',
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'functionName',
    help: '用作类描述，例如 用户',
    label: '生成功能名',
    rules: 'required',
  },
  {
    component: 'TreeSelect',
    componentProps: {
      allowClear: false,
      getPopupContainer,
    },
    defaultValue: 0,
    fieldName: 'parentMenuId',
    label: '上级菜单',
  },
  {
    component: 'RadioGroup',
    componentProps: {
      buttonStyle: 'solid',
      options: [
        { label: 'modal弹窗', value: 'modal' },
        { label: 'drawer抽屉', value: 'drawer' },
      ],
      optionType: 'button',
    },
    help: '自定义功能, 需要后端支持',
    defaultValue: 'modal',
    fieldName: 'popupComponent',
    label: '弹窗组件类型',
  },
  {
    component: 'RadioGroup',
    componentProps: {
      buttonStyle: 'solid',
      options: [
        { label: 'zip压缩包', value: '0' },
        { label: '自定义路径', value: '1' },
      ],
      optionType: 'button',
    },
    defaultValue: '0',
    fieldName: 'genType',
    help: '默认为zip压缩包下载, 也可以自定义生成路径',
    label: '生成代码方式',
  },
  {
    component: 'Input',
    defaultValue: '/',
    dependencies: {
      show: (model) => model.genType === '1',
      triggerFields: ['genType'],
    },
    fieldName: 'genPath',
    help: '输入绝对路径, 不支持"./"相对路径',
    label: '代码生成路径',
    rules: z
      .string()
      .regex(/^(?:[a-z]:)?(?:\/|(?:\\|\/)[^\\/:*?"<>|\r\n]+)*(?:\\|\/)?$/i, {
        message: '请输入合法的路径',
      }),
  },
  {
    component: 'Textarea',
    fieldName: 'remark',
    formItemClass: 'col-span-2 items-baseline',
    label: '备注',
  },
];
