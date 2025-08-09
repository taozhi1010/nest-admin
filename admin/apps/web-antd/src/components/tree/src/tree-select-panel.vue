<script setup lang="ts">
import type { CheckboxChangeEvent } from 'ant-design-vue/es/checkbox/interface';
import type { DataNode } from 'ant-design-vue/es/tree';
import type { CheckInfo } from 'ant-design-vue/es/vc-tree/props';

import type { PropType, SetupContext } from 'vue';

import { computed, nextTick, onMounted, ref, useSlots, watch } from 'vue';

import { findGroupParentIds, treeToList } from '@vben/utils';

import { Checkbox, Tree } from 'ant-design-vue';
import { uniq } from 'lodash-es';

/** 需要禁止透传 */
defineOptions({ inheritAttrs: false });

const props = defineProps({
  checkStrictly: {
    default: true,
    type: Boolean,
  },
  expandAllOnInit: {
    default: false,
    type: Boolean,
  },
  fieldNames: {
    default: () => ({ key: 'id', title: 'label' }),
    type: Object as PropType<{ key: string; title: string }>,
  },
  /** 点击节点关联/独立时 清空已勾选的节点 */
  resetOnStrictlyChange: {
    default: true,
    type: Boolean,
  },
  treeData: {
    default: () => [],
    type: Array as PropType<DataNode[]>,
  },
});
const emit = defineEmits<{ checkStrictlyChange: [boolean] }>();

const expandStatus = ref(false);
const selectAllStatus = ref(false);

/**
 * 后台的这个字段跟antd/ele是反的
 * 组件库这个字段代表不关联
 * 后台这个代表关联
 */
const innerCheckedStrictly = computed(() => {
  return !props.checkStrictly;
});

const associationText = computed(() => {
  return props.checkStrictly ? '父子节点关联' : '父子节点独立';
});

/**
 * 这个只用于界面显示
 * 关联情况下 只会有最末尾的节点被选中
 */
const checkedKeys = defineModel('value', {
  default: () => [],
  type: Array as PropType<(number | string)[]>,
});
// 所有节点的ID
const allKeys = computed(() => {
  const idField = props.fieldNames.key;
  return treeToList(props.treeData).map((item: any) => item[idField]);
});

/** 已经选择的所有节点  包括子/父节点 用于提交 */
const checkedRealKeys = ref<(number | string)[]>([]);

/**
 * 取第一次的menuTree id 设置到checkedMenuKeys
 * 主要为了解决没有任何修改 直接点击保存的情况
 *
 * length为0情况(即新增时候没有勾选节点) 勾选这里会延迟触发 节点会拼接上父节点 导致ID重复
 */
const stop = watch([checkedKeys, () => props.treeData], () => {
  if (
    props.checkStrictly &&
    checkedKeys.value.length > 0 &&
    props.treeData.length > 0
  ) {
    /** 找到父节点 添加上 */
    const parentIds = findGroupParentIds(
      props.treeData,
      checkedKeys.value as any,
      { id: props.fieldNames.key },
    );
    /**
     * uniq 解决上面的id重复问题
     */
    checkedRealKeys.value = uniq([...parentIds, ...checkedKeys.value]);
    stop();
  }
  if (!props.checkStrictly && checkedKeys.value.length > 0) {
    /** 节点独立 这里是全部的节点 */
    checkedRealKeys.value = checkedKeys.value;
    stop();
  }
});

/**
 *
 * @param checkedStateKeys 已经选中的子节点的ID
 * @param info info.halfCheckedKeys为父节点的ID
 */
type CheckedState<T = number | string> =
  | T[]
  | { checked: T[]; halfChecked: T[] };
function handleChecked(checkedStateKeys: CheckedState, info: CheckInfo) {
  // 数组的话为节点关联
  if (Array.isArray(checkedStateKeys)) {
    const halfCheckedKeys: number[] = (info.halfCheckedKeys || []) as number[];
    checkedRealKeys.value = [...halfCheckedKeys, ...checkedStateKeys];
  } else {
    checkedRealKeys.value = [...checkedStateKeys.checked];
    // fix: Invalid prop: type check failed for prop "value". Expected Array, got Object
    checkedKeys.value = [...checkedStateKeys.checked];
  }
}

function handleExpandChange(e: CheckboxChangeEvent) {
  // 这个用于展示
  checkedKeys.value = e.target.checked ? allKeys.value : [];
  // 这个用于提交
  checkedRealKeys.value = e.target.checked ? allKeys.value : [];
}

const expandedKeys = ref<string[]>([]);
function handleExpandOrCollapseAll(e: CheckboxChangeEvent) {
  const expand = e.target.checked;
  expandedKeys.value = expand ? allKeys.value : [];
}

function handleCheckStrictlyChange(e: CheckboxChangeEvent) {
  emit('checkStrictlyChange', e.target.checked);
  if (props.resetOnStrictlyChange) {
    checkedKeys.value = [];
    checkedRealKeys.value = [];
  }
}

/**
 * 暴露方法来获取用于提交的全部节点
 * uniq去重(保险方案)
 */
defineExpose({
  getCheckedKeys: () => uniq(checkedRealKeys.value),
});

onMounted(async () => {
  if (props.expandAllOnInit) {
    await nextTick();
    expandedKeys.value = allKeys.value;
  }
});

const slots = useSlots() as SetupContext['slots'];
</script>

<template>
  <div class="bg-background w-full rounded-lg border-[1px] p-[12px]">
    <div class="flex items-center justify-between gap-2 border-b-[1px] pb-2">
      <div>
        <span>节点状态: </span>
        <span :class="[props.checkStrictly ? 'text-primary' : 'text-red-500']">
          {{ associationText }}
        </span>
      </div>
      <div>
        已选中
        <span class="text-primary mx-1 font-semibold">
          {{ checkedRealKeys.length }}
        </span>
        个节点
      </div>
    </div>
    <div
      class="flex flex-wrap items-center justify-between border-b-[1px] py-2"
    >
      <Checkbox
        v-model:checked="expandStatus"
        @change="handleExpandOrCollapseAll"
      >
        展开/折叠全部
      </Checkbox>
      <Checkbox v-model:checked="selectAllStatus" @change="handleExpandChange">
        全选/取消全选
      </Checkbox>
      <Checkbox :checked="checkStrictly" @change="handleCheckStrictlyChange">
        父子节点关联
      </Checkbox>
    </div>
    <div class="py-2">
      <Tree
        v-if="treeData.length > 0"
        v-model:check-strictly="innerCheckedStrictly"
        v-model:checked-keys="checkedKeys"
        v-model:expanded-keys="expandedKeys"
        :checkable="true"
        :field-names="fieldNames"
        :selectable="false"
        :tree-data="treeData"
        @check="handleChecked"
      >
        <template
          v-for="slotName in Object.keys(slots)"
          :key="slotName"
          #[slotName]="data"
        >
          <slot :name="slotName" v-bind="data ?? {}"></slot>
        </template>
      </Tree>
    </div>
  </div>
</template>
