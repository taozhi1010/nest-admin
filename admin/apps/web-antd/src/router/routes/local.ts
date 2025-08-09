import type { RouteRecordStringComponent } from '@vben/types';

import { $t } from '@vben/locales';

/**
 * 该文件放非后台返回的路由 比如个人中心 等需要跳转显示的页面
 */
const localRoutes: RouteRecordStringComponent[] = [
  {
    component: '/_core/profile/index',
    meta: {
      icon: 'mingcute:profile-line',
      title: $t('ui.widgets.profile'),
      hideInMenu: true,
    },
    name: 'Profile',
    path: '/profile',
  },
  {
    component: '/operator/oss-config/index',
    meta: {
      activePath: '/operator/oss',
      icon: 'ant-design:setting-outlined',
      title: 'oss配置',
      hideInMenu: true,
    },
    name: 'OssConfig',
    path: '/operator/oss-config',
  },
  {
    component: '/system/role-assign/index',
    meta: {
      activePath: '/system/role',
      icon: 'eos-icons:role-binding-outlined',
      title: '分配角色',
      hideInMenu: true,
    },
    name: 'RoleAssign',
    path: '/system/role-assign/:roleId',
  }
];

/**
 * 这里放本地路由
 */
export const localMenuList: RouteRecordStringComponent[] = [
  {
    component: 'BasicLayout',
    meta: {
      order: -1,
      title: 'page.dashboard.title',
      // 不使用基础布局（仅在顶级生效）
      noBasicLayout: true,
    },
    name: 'Dashboard',
    path: '/',
    redirect: '/analytics',
    children: [
      {
        name: 'Analytics',
        path: '/analytics',
        component: '/dashboard/analytics/index',
        meta: {
          affixTab: true,
          title: 'page.dashboard.analytics',
        },
      },
      {
        name: 'Workspace',
        path: '/workspace',
        component: '/dashboard/workspace/index',
        meta: {
          title: 'page.dashboard.workspace',
        },
      },
      // {
      //   name: 'VbenDocument',
      //   path: '/vben-admin/document',
      //   component: 'IFrameView',
      //   meta: {
      //     icon: 'lucide:book-open-text',
      //     iframeSrc: 'https://dapdap.top',
      //     keepAlive: true,
      //     title: $t('demos.vben.document'),
      //   },
      // },
    ],
  },
  // {
  //   component: '/_core/about/index',
  //   meta: {
  //     icon: 'lucide:copyright',
  //     order: 9999,
  //     title: $t('demos.vben.about'),
  //   },
  //   name: 'About',
  //   path: '/vben-admin/about',
  // },
  ...localRoutes,
];
