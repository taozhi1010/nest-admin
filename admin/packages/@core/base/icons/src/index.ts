export * from './create-icon';

export * from './lucide';

export type { IconifyIcon as IconifyIconStructure } from '@iconify/vue';
export {
  addCollection,
  addIcon,
  Icon as IconifyIcon,
  listIcons,
} from '@iconify/vue';

/**
 * 从@iconify/vue/dist/offline'导出的组件为离线ICON 不支持在线
 * 从@iconify/vue'导出的组件为在能找到本地图标为离线 否则会在线获取(适用性更强)
 */
