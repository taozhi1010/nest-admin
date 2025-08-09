<script lang="ts">
import { defineComponent } from 'vue';

import { Switch } from 'ant-design-vue';
import { isFunction } from 'lodash-es';

export default defineComponent({
  name: 'TableSwitch',
  components: {
    Switch,
  },
  inheritAttrs: false,
  props: {
    modelValue: {
      type: [Boolean, String, Number],
      default: false,
    },
    checkedText: {
      type: String,
      default: '启用',
    },
    unCheckedText: {
      type: String,
      default: '禁用',
    },
    // 使用严格相等判断  类型要正确
    checkedValue: {
      type: [Boolean, String, Number],
      default: '0',
    },
    unCheckedValue: {
      type: [Boolean, String, Number],
      default: '1',
    },
    api: {
      type: Function,
      required: false,
      default: null,
    },
    reload: {
      type: Function,
      required: false,
      default: null,
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    type CheckedType = boolean | number | string;
    async function onChange(checked: CheckedType, e: Event) {
      // 阻止事件冒泡 否则会跟行选中冲突
      e.stopPropagation();
      const { checkedValue, unCheckedValue } = props;
      // 原本的状态
      const lastStatus =
        checked === checkedValue ? unCheckedValue : checkedValue;
      // 切换状态
      emit('update:modelValue', checked);
      const { api, reload } = props;
      try {
        isFunction(api) && (await api());
        isFunction(reload) && (await reload());
      } catch {
        emit('update:modelValue', lastStatus);
      }
    }

    return {
      onChange,
    };
  },
});
</script>

<template>
  <Switch
    v-bind="$attrs"
    :checked="modelValue"
    :checked-children="checkedText"
    :checked-value="checkedValue"
    :un-checked-children="unCheckedText"
    :un-checked-value="unCheckedValue"
    @change="onChange"
  />
</template>
