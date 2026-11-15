import submitNoEnter from './common/submitNoEnter';
import hasPermi from './permission/hasPermi';
import hasRole from './permission/hasRole';

import type { App } from 'vue';

/**
 * 注册全局自定义指令
 * @param app Vue应用实例
 */
export default function directive(app: App): void {
  app.directive('hasRole', hasRole);
  app.directive('hasPermi', hasPermi);
  app.directive('noEnter', submitNoEnter);
}
