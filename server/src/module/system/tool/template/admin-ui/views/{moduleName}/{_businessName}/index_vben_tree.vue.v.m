<template>
  <PageWrapper dense>
    <BasicTable @register="registerTable">
      <template #toolbar>
        <a-button @click="expandAll">展开</a-button
        >
        <a-button @click="collapseAll">折叠</a-button
        >
        <a-button
          type="primary"
          @click="handleAdd"
          v-auth="'${permissionPrefix}:add'"
          >新增</a-button
        >
      </template>
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'action'">
          <TableAction
            stopButtonPropagation
            :actions="[
              {
                label: '修改',
                icon: IconEnum.EDIT,
                type: 'primary',
                ghost: true,
                auth: '${permissionPrefix}:edit',
                onClick: handleEdit.bind(null, record),
              },
              {
                label: '删除',
                icon: IconEnum.DELETE,
                type: 'primary',
                danger: true,
                ghost: true,
                auth: '${permissionPrefix}:remove',
                popConfirm: {
                  placement: 'left',
                  title: '是否删除${functionName}[' + record.${primaryKey} + ']?',
                  confirm: handleDelete.bind(null, record),
                },
              },
            ]"
          />
        </template>
      </template>
    </BasicTable>
    <${BusinessName}Modal @register="registerModal" @reload="reload" />
  </PageWrapper>
</template>

<script setup lang="ts">
  import { PageWrapper } from '@/components/Page';
  import { BasicTable, useTable, TableAction } from '@/components/Table';
  import { ${businessName}List, ${businessName}Remove } from '@/api/${moduleName}/${businessName}';
  import type { ${BusinessName}VO } from '@/api/${moduleName}/${businessName}/model';
  import { useModal } from '@/components/Modal';
  import ${BusinessName}Modal from './${BusinessName}Modal.vue';
  import { formSchemas, columns } from './${businessName}.data';
  import { listToTree, removeEmptyChildren } from '@/utils/helper/treeHelper';
  import { IconEnum } from '@/enums/appEnum';

  defineOptions({ name: '${BusinessName}' });

  const [registerTable, { reload, expandAll, collapseAll }] = useTable({
    api: ${businessName}List,
    title: '${functionName}列表',
    showIndexColumn: false,
    isTreeTable: true,
    pagination: false,
    rowKey: '$treeCode}',
    afterFetch(data: ${BusinessName}VO[]) {
      const ret = listToTree(data, { id: '${treeCode}', pid: '${treeParentCode}' });
      removeEmptyChildren(ret);
      return ret;
    },
    useSearchForm: true,
    formConfig: {
      schemas: formSchemas,
      baseColProps: {
        xs: 24,
        sm: 24,
        md: 24,
        lg: 6,
      },
    },
    columns: columns,
    actionColumn: {
      width: 200,
      title: '操作',
      key: 'action',
      fixed: 'right',
    },
  });

  const [registerModal, { openModal }] = useModal();

  function handleEdit(record: Recordable) {
    openModal(true, { record, update: true });
  }

  function handleAdd() {
    openModal(true, { update: false });
  }

  async function handleDelete(record: Recordable) {
    await ${businessName}Remove(record.${primaryKey});
    await reload();
  }
</script>

<style scoped></style>
