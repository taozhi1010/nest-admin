import type { App } from 'vue';

import { Button as AButton } from 'ant-design-vue';

import { GhostButton } from './button';

/**
 * 全局组件注册
 */
export function setupGlobalComponent(app: App) {
  app.use(AButton);
  // 表格操作列专用按钮
  app.component('GhostButton', GhostButton);
}
