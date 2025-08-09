import type { PropType } from 'vue';

import type { Menu } from '#/api/system/menu/model';

import { computed, defineComponent } from 'vue';

import { Tag } from 'ant-design-vue';

export default defineComponent({
  name: 'TreeItem',
  props: {
    data: {
      required: true,
      type: Object as PropType<Menu>,
    },
  },
  setup(props, { expose }) {
    expose();

    interface TagProp {
      color: string;
      text: string;
    }

    const menuTagProp = computed<TagProp>(() => {
      // 正则判断是否为链接
      if (/^https?:\/\/[^\s/$.?#].\S*$/i.test(props.data.path)) {
        return { color: 'pink', text: '外链' };
      }
      const type = props.data.menuType;
      if (type === 'M') return { color: 'green', text: '目录' };
      if (type === 'C') return { color: 'blue', text: '菜单' };
      if (type === 'F') return { color: '', text: '按钮' };
      return { color: 'error', text: '未知' };
    });

    return () => (
      <div class="flex gap-[6px]">
        <span>{props.data.menuName}</span>
        <Tag color={menuTagProp.value.color}>{menuTagProp.value.text}</Tag>
      </div>
    );
  },
});
