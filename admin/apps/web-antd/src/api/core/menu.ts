import { requestClient } from '#/api/request';

/**
 * @description: 菜单meta
 * @param title 菜单名
 * @param icon 菜单图标
 * @param noCache 是否不缓存
 * @param link 外链链接
 */
export interface MenuMeta {
  icon: string;
  link?: string;
  noCache: boolean;
  title: string;
}

/**
 * @description: 菜单
 * @param name 菜单名
 * @param path 菜单路径
 * @param hidden 是否隐藏
 * @param component 组件名称 Layout
 * @param alwaysShow 总是显示
 * @param query 路由参数(json形式)
 * @param meta 路由信息
 * @param children 子路由信息
 */
export interface Menu {
  alwaysShow?: boolean;
  children: Menu[];
  component: string;
  hidden: boolean;
  meta: MenuMeta;
  name: string;
  path: string;
  query?: string;
  redirect?: string;
}

/**
 * 获取用户所有菜单
 */
export async function getAllMenusApi() {
  return requestClient.get<Menu[]>('/getRouters');
}
