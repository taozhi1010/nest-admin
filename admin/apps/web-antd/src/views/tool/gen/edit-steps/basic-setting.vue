<script setup lang="ts">
import type { Column, GenInfo } from '#/api/tool/gen/model';

import { inject, onMounted, type Ref } from 'vue';

import { useVbenForm } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { addFullName, listToTree } from '@vben/utils';

import { Col, Row } from 'ant-design-vue';

import { menuList } from '#/api/system/menu';

import { toCurrentStep } from '../mitt';
import { formSchema } from './basic';

/**
 * 从父组件注入
 */
const genInfoData = inject('genInfoData') as Ref<GenInfo['info']>;

const [BasicForm, formApi] = useVbenForm({
  commonConfig: {
    componentProps: {
      class: 'w-full',
      formItemClass: 'col-span-1',
    },
    labelWidth: 150,
  },
  schema: formSchema(),
  showDefaultActions: false,
  wrapperClass: 'grid-cols-2',
});

/**
 * 树表需要用到的数据
 */
async function initTreeSelect(columns: Column[]) {
  const options = columns.map((item) => {
    const label = `${item.columnName} | ${item.columnComment}`;
    return { label, value: item.columnName };
  });
  formApi.updateSchema([
    {
      componentProps: {
        options,
      },
      fieldName: 'treeCode',
    },
    {
      componentProps: {
        options,
      },
      fieldName: 'treeParentCode',
    },
    {
      componentProps: {
        options,
      },
      fieldName: 'treeName',
    },
  ]);
}

/**
 * 加载菜单选择
 */
async function initMenuSelect() {
  const list = await menuList();
  // support i18n
  list.forEach((item) => {
    item.menuName = $t(item.menuName);
  });
  const tree = listToTree(list, { id: 'menuId', pid: 'parentId' });
  const treeData = [
    {
      fullName: $t('menu.root'),
      menuId: 0,
      menuName: $t('menu.root'),
      children: tree,
    },
  ];
  addFullName(treeData, 'menuName', ' / ');

  formApi.updateSchema([
    {
      componentProps: {
        fieldNames: {
          label: 'menuName',
          value: 'menuId',
        },
        // 设置弹窗滚动高度 默认256
        listHeight: 300,
        treeData,
        treeDefaultExpandAll: false,
        // 默认展开的树节点
        treeDefaultExpandedKeys: [0],
        treeLine: { showLeafIcon: false },
        treeNodeLabelProp: 'fullName',
      },
      fieldName: 'parentMenuId',
    },
  ]);
}

onMounted(async () => {
  const info = genInfoData.value;
  await formApi.setValues(info);
  // 弹出框类型需要手动赋值
  if (info.options) {
    const popupComponent = JSON.parse(info.options)?.popupComponent;
    if (popupComponent) {
      await formApi.setFieldValue('popupComponent', popupComponent);
    }
  }
  await Promise.all([initTreeSelect(info.columns), initMenuSelect()]);
});

async function handleNext() {
  try {
    const { valid } = await formApi.validate();
    if (!valid) {
      return null;
    }
    const data = await formApi.getValues();
    Object.assign(genInfoData.value, data);
    toCurrentStep(1);
  } catch (error) {
    console.error(error);
  }
}
</script>

<template>
  <Row justify="center">
    <Col v-bind="{ xs: 24, sm: 24, md: 20, lg: 16, xl: 16 }">
      <BasicForm />
      <div class="flex justify-center">
        <a-button type="primary" @click="handleNext">下一步</a-button>
      </div>
    </Col>
  </Row>
</template>
