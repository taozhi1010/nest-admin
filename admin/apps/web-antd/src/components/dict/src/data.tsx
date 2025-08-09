import type { VNode } from 'vue';

import { Tag } from 'ant-design-vue';

interface TagType {
  [key: string]: { color: string; label: string };
}

export const tagTypes: TagType = {
  cyan: { color: 'cyan', label: 'cyan' },
  danger: { color: 'error', label: '危险(danger)' },
  /** 由于和elementUI不同 用于替换颜色 */
  default: { color: 'default', label: '默认(default)' },
  green: { color: 'green', label: 'green' },
  info: { color: 'default', label: '信息(info)' },
  orange: { color: 'orange', label: 'orange' },
  /** 自定义预设 color可以为16进制颜色 */
  pink: { color: 'pink', label: 'pink' },
  primary: { color: 'processing', label: '主要(primary)' },
  purple: { color: 'purple', label: 'purple' },
  red: { color: 'red', label: 'red' },
  success: { color: 'success', label: '成功(success)' },
  warning: { color: 'warning', label: '警告(warning)' },
};

// 字典选择使用 { label: string; value: string }[]
interface Options {
  label: string | VNode;
  value: string;
}

export function tagSelectOptions() {
  const selectArray: Options[] = [];
  Object.keys(tagTypes).forEach((key) => {
    if (!tagTypes[key]) return;
    const label = tagTypes[key].label;
    const color = tagTypes[key].color;
    selectArray.push({
      label: <Tag color={color}>{label}</Tag>,
      value: key,
    });
  });
  return selectArray;
}
