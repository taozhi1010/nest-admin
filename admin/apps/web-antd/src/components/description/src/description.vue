<script lang="tsx">
import type { CardSize } from 'ant-design-vue/es/card/Card';
import type { DescriptionsProps } from 'ant-design-vue/es/descriptions';

import type { CSSProperties, PropType, Slots } from 'vue';

import type { DescInstance, DescItem, DescriptionProps } from './typing';

import { computed, defineComponent, ref, toRefs, unref, useAttrs } from 'vue';

import { Card, Descriptions } from 'ant-design-vue';
import { get, isFunction } from 'lodash-es';

const props = {
  bordered: { default: true, type: Boolean },
  column: {
    default: () => {
      return { lg: 3, md: 3, sm: 2, xl: 3, xs: 1, xxl: 4 };
    },
    type: [Number, Object],
  },
  data: { type: Object },
  schema: {
    default: () => [],
    type: Array as PropType<DescItem[]>,
  },
  size: {
    default: 'small',
    type: String,
    validator: (v: string) =>
      ['default', 'middle', 'small', undefined].includes(v),
  },
  title: { default: '', type: String },
  useCollapse: { default: true, type: Boolean },
};

export default defineComponent({
  emits: ['register'],
  // eslint-disable-next-line vue/order-in-components
  name: 'Description',
  // eslint-disable-next-line vue/order-in-components
  props,
  setup(props, { emit, slots }) {
    const propsRef = ref<null | Partial<DescriptionProps>>(null);

    const prefixCls = 'description';
    const attrs = useAttrs();

    // Custom title component: get title
    const getMergeProps = computed(() => {
      return {
        ...props,
        ...(unref(propsRef) as any),
      } as DescriptionProps;
    });

    const getProps = computed(() => {
      const opt = {
        ...unref(getMergeProps),
        title: undefined,
      };
      return opt as DescriptionProps;
    });

    /**
     * @description: Whether to setting title
     */
    const useWrapper = computed(() => !!unref(getMergeProps).title);

    const getDescriptionsProps = computed(() => {
      return { ...unref(attrs), ...unref(getProps) } as DescriptionsProps;
    });

    /**
     * @description:设置desc
     */
    function setDescProps(descProps: Partial<DescriptionProps>): void {
      // Keep the last setDrawerProps
      propsRef.value = {
        ...(unref(propsRef) as Record<string, any>),
        ...descProps,
      } as Record<string, any>;
    }

    // Prevent line breaks
    function renderLabel({ label, labelMinWidth, labelStyle }: DescItem) {
      if (!labelStyle && !labelMinWidth) {
        return label;
      }

      const labelStyles: CSSProperties = {
        ...labelStyle,
        minWidth: `${labelMinWidth}px `,
      };
      return <div style={labelStyles}>{label}</div>;
    }

    function renderItem() {
      const { data, schema } = unref(getProps);
      return unref(schema)
        .map((item) => {
          const { contentMinWidth, field, render, show, span } = item;

          if (show && isFunction(show) && !show(data)) {
            return null;
          }

          const getContent = () => {
            const _data = unref(getProps)?.data;
            if (!_data) {
              return null;
            }
            const getField = get(_data, field);
            // eslint-disable-next-line no-prototype-builtins
            if (getField && !toRefs(_data).hasOwnProperty(field)) {
              return isFunction(render) ? render!('', _data) : '';
            }
            return isFunction(render)
              ? render!(getField, _data)
              : (getField ?? '');
          };

          const width = contentMinWidth;
          return (
            <Descriptions.Item
              key={field}
              label={renderLabel(item)}
              span={span}
            >
              {() => {
                if (!contentMinWidth) {
                  return getContent();
                }
                const style: CSSProperties = {
                  minWidth: `${width}px`,
                };
                return <div style={style}>{getContent()}</div>;
              }}
            </Descriptions.Item>
          );
        })
        .filter((item) => !!item);
    }

    const renderDesc = () => {
      return (
        <Descriptions
          class={`${prefixCls}`}
          {...(unref(getDescriptionsProps) as any)}
        >
          {renderItem()}
        </Descriptions>
      );
    };

    const renderContainer = () => {
      const content = props.useCollapse ? (
        renderDesc()
      ) : (
        <div>{renderDesc()}</div>
      );
      // Reduce the dom level
      if (!props.useCollapse) {
        return content;
      }

      // const { canExpand, helpMessage } = unref(getCollapseOptions);
      const { title } = unref(getMergeProps);

      function getSlot(slots: Slots, slot = 'default', data?: any) {
        if (!slots || !Reflect.has(slots, slot)) {
          return null;
        }
        if (!isFunction(slots[slot])) {
          console.error(`${slot} is not a function!`);
          return null;
        }
        const slotFn = slots[slot];
        if (!slotFn) return null;
        const params = { ...data };
        return slotFn(params);
      }

      return (
        <Card size={props.size as CardSize} title={title}>
          {{
            default: () => content,
            extra: () => getSlot(slots, 'extra'),
          }}
        </Card>
      );
    };

    const methods: DescInstance = {
      setDescProps,
    };

    emit('register', methods);
    return () => (unref(useWrapper) ? renderContainer() : renderDesc());
  },
});
</script>
