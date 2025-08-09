<template>
  <BasicModal
    v-bind="$attrs"
    :title="title"
    @register="registerInnerModal"
    @ok="handleSubmit"
    @cancel="resetForm"
  >
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>

<script setup lang="ts">
  import { BasicModal, useModalInner } from '@/components/Modal';
  import { BasicForm, useForm } from '@/components/Form';
  import { computed, ref, unref } from 'vue';
  import { ${businessName}Info, ${businessName}Add, ${businessName}Update, ${businessName}List } from '@/api/${moduleName}/${businessName}';
  import { modalSchemas } from './${businessName}.data';
  import { listToTree } from '@/utils/helper/treeHelper';

  defineOptions({ name: '${BusinessName}Modal' });

  const emit = defineEmits(['register', 'reload']);

  const isUpdate = ref<boolean>(false);
  const title = computed<string>(() => {
    return isUpdate.value ? '编辑${functionName}' : '新增${functionName}';
  });

  const [registerInnerModal, { modalLoading, closeModal }] = useModalInner(
    async (data: { record?: Recordable; update: boolean }) => {
      modalLoading(true);
      const { record, update } = data;
      isUpdate.value = update;
      if (update && record) {
        const ret = await ${businessName}Info(record.${primaryKey});
        await setFieldsValue(ret);
      }
      // 下拉框初始化
      await init${BusinessName}Select();
      modalLoading(false);
    },
  );

  async function init${BusinessName}Select() {
    // 需要动态更新TreeSelect组件 这里允许为空
    const listData = await ${businessName}List();
    const treeData = listToTree(listData, { id: '${treeCode}', pid: '${treeParentCode}' });
    await updateSchema({
      field: '${treeParentCode}',
      componentProps: {
        treeData,
        treeLine: { showLeafIcon: false },
        fieldNames: { label: '${businessName}Name', value: '${businessName}Id' },
        treeDefaultExpandAll: true,
      },
    });
  }

  const [registerForm, { setFieldsValue, resetForm, validate, updateSchema }] = useForm({
    labelWidth: 100,
    showActionButtonGroup: false,
    baseColProps: { span: 24 },
    schemas: modalSchemas,
  });

  async function handleSubmit() {
    try {
      modalLoading(true);
      const data = await validate();
      if (unref(isUpdate)) {
        await ${businessName}Update(data);
      } else {
        await ${businessName}Add(data);
      }
      emit('reload');
      closeModal();
      await resetForm();
    } catch (e) {
    } finally {
      modalLoading(false);
    }
  }
</script>

<style scoped></style>
