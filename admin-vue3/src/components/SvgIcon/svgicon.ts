/**
 * Element Plus 图标全局注册插件
 * 自动注册所有 Element Plus 图标组件
 */

import * as components from '@element-plus/icons-vue';

import type { App } from 'vue';

export default {
  install: (app: App) => {
    for (const key in components) {
      const componentConfig = components[key];
      app.component(componentConfig.name, componentConfig);
    }
  }
};
