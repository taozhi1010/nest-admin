import { defineComponent, h } from 'vue';

import { Button } from 'ant-design-vue';
import buttonProps from 'ant-design-vue/es/button/buttonTypes';
import { omit } from 'lodash-es';
/**
 * 表格操作列按钮专用
 */
export const GhostButton = defineComponent({
  name: 'GhostButton',
  props: omit(buttonProps(), ['type', 'ghost', 'size']),
  setup(props, { attrs, slots }) {
    return () =>
      h(
        Button,
        {
          ...props,
          ...attrs,
          type: 'link',
          // ghost: true,
          size: 'small',
          style: {
            // background: 'rgba(255, 255, 255, 0.7)', // 磨砂透明白色
            // borderRadius: '4px', // 圆角
          },
        },
        slots,
      );
  },
});
