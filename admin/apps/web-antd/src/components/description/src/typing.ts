import type { DescriptionsProps } from 'ant-design-vue/es/descriptions';
import type { JSX } from 'vue/jsx-runtime';

import type { CSSProperties, VNode } from 'vue';

import type { Recordable } from '@vben/types';

export interface DescItem {
  labelMinWidth?: number;
  contentMinWidth?: number;
  labelStyle?: CSSProperties;
  field: string;
  label: JSX.Element | string | VNode;
  // Merge column
  span?: number;
  show?: (...arg: any) => boolean;
  // render
  render?: (
    val: any,
    data: Recordable<any>,
  ) => Element | JSX.Element | number | string | undefined | VNode;
}

export interface DescriptionProps extends DescriptionsProps {
  // Whether to include the collapse component
  useCollapse?: boolean;
  /**
   * item configuration
   * @type DescItem
   */
  schema: DescItem[];
  /**
   * 数据
   * @type object
   */
  data: Recordable<any>;
}

export interface DescInstance {
  setDescProps(descProps: Partial<DescriptionProps>, delay?: boolean): void;
}

export type Register = (descInstance: DescInstance) => void;

/**
 * @description:
 */
export type UseDescReturnType = [Register, DescInstance];
