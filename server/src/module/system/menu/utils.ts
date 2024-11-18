import { isURL } from 'class-validator';
import * as Lodash from 'lodash';
import * as UserConstants from 'src/module/system/user/user.constant';

/**
 * 菜单列表转树形结构
 * @param arr
 */
export const buildMenus = (arr) => {
  //保证父级菜单排在前面
  arr.sort((a, b) => a.parentId - b.parentId);
  const kData = {}; // 以id做key的对象 暂时储存数据
  const lData = []; // 最终的数据 arr
  arr.forEach((m) => {
    m = {
      ...m,
      id: m.menuId,
      parentId: m.parentId,
    };
    kData[m.id] = {
      ...m,
      id: m.id,
      parentId: m.parentId,
    };
    if (m.parentId === 0) {
      lData.push(kData[m.id]);
    } else {
      kData[m.parentId] = kData[m.parentId] || {};
      kData[m.parentId].children = kData[m.parentId].children || [];
      kData[m.parentId].children.push(kData[m.id]);
    }
  });
  return formatTreeNodeBuildMenus(lData);
};

/**
 * 格式化菜单数据
 * @param arr
 * @param getId
 * @returns
 */
const formatTreeNodeBuildMenus = (menus: any[]): any[] => {
  return menus.map((menu) => {
    const router: any = {};
    router.hidden = menu.visible === '1';
    router.name = getRouteName(menu);
    router.path = getRouterPath(menu);
    router.component = getComponent(menu);
    router.query = menu.query;
    router.meta = setMeta(menu);

    if (menu.children && menu.children.length > 0 && menu.menuType === UserConstants.TYPE_DIR) {
      router.alwaysShow = true;
      router.redirect = 'noRedirect';
      router.children = formatTreeNodeBuildMenus(menu.children);
    } else if (isMenuFrame(menu)) {
      router.meta = null;
      const childrenList = [];
      const childrenRouter: any = {};
      childrenRouter.path = menu.path;
      childrenRouter.component = menu.component;
      childrenRouter.name = Lodash.capitalize(menu.path);
      childrenRouter.meta = setMeta(menu);
      childrenRouter.query = menu.query;
      childrenList.push(childrenRouter);
      router.children = childrenList;
    } else if (menu.parentId === 0 && isInnerLink(menu)) {
      router.meta = {
        name: menu.name,
        icon: menu.icon,
      };
      router.path = '/';
      const childrenList = [];
      const childrenRouter: any = {};
      childrenRouter.path = innerLinkReplaceEach(menu.path);
      childrenRouter.component = UserConstants.INNER_LINK;
      childrenRouter.name = Lodash.capitalize(menu.name);
      childrenRouter.meta = {
        name: menu.name,
        icon: menu.icon,
        path: menu.path,
      };
      childrenList.push(childrenRouter);
      router.children = childrenList;
    }

    return router;
  });
};

/**
 * 设置meta信息
 */
const setMeta = (menu) => {
  const meta = {
    title: menu.menuName,
    icon: menu.icon,
    noCache: menu.isCache === '1',
  };

  if (isURL(menu.link)) {
    meta['link'] = menu.link;
  }

  return meta;
};

/**
 * 获取路由名称
 *
 * @param menu 菜单信息
 * @return 路由名称
 */
const getRouteName = (menu) => {
  let routerName = Lodash.capitalize(menu.path);
  // 非外链并且是一级目录（类型为目录）
  if (isMenuFrame(menu)) {
    routerName = '';
  }
  return routerName;
};
/**
 * 是否为菜单内部跳转
 *
 * @param menu 菜单信息
 * @return 结果
 */
const isMenuFrame = (menu): boolean => {
  return menu.parentId === 0 && menu.menuType === UserConstants.TYPE_MENU && menu.isFrame === UserConstants.NO_FRAME;
};

/**
 * 是否为内链组件
 *
 * @param menu 菜单信息
 * @return 结果
 */
const isInnerLink = (menu): boolean => {
  return menu.isFrame === UserConstants.NO_FRAME && isURL(menu.path);
};

/**
 * 是否为parent_view组件
 *
 * @param menu 菜单信息
 * @return 结果
 */
const isParentView = (menu): boolean => {
  return menu.parentId !== 0 && menu.menuType === UserConstants.TYPE_DIR;
};

/**
 * 获取组件信息
 *
 * @param menu 菜单信息
 * @return 组件信息
 */
const getComponent = (menu): string => {
  let component = UserConstants.LAYOUT;
  if (menu.component && !isMenuFrame(menu)) {
    component = menu.component;
  } else if (!menu.component && menu.parentId !== 0 && isInnerLink(menu)) {
    component = UserConstants.INNER_LINK;
  } else if (!menu.component && isParentView(menu)) {
    component = UserConstants.PARENT_VIEW;
  }
  return component;
};

/**
 * 内链域名特殊字符替换
 *
 * @return 替换后的内链域名
 */
const innerLinkReplaceEach = (path: string): string => {
  const replacements = [
    ['http://', ''],
    ['https://', ''],
    ['www.', ''],
    ['.', '/'],
    [':', '/'],
  ];

  // 遍历替换规则并应用到路径上
  for (const [oldValue, newValue] of replacements) {
    path = path.replace(new RegExp(oldValue, 'g'), newValue);
  }

  return path;
};

/**
 * 获取路由地址
 *
 * @param menu 菜单信息
 * @return 路由地址
 */
const getRouterPath = (menu): string => {
  let routerPath = menu.path;
  // 内链打开外网方式
  if (menu.parentId !== 0 && isInnerLink(menu)) {
    routerPath = innerLinkReplaceEach(routerPath);
  }
  // 非外链并且是一级目录（类型为目录）
  if (menu.parentId === 0 && menu.menuType === UserConstants.TYPE_DIR && menu.isFrame === UserConstants.NO_FRAME) {
    routerPath = '/' + menu.path;
  }
  // 非外链并且是一级目录（类型为菜单）
  else if (isMenuFrame(menu)) {
    routerPath = '/';
  }
  return routerPath;
};
