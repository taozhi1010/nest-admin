import { isURL } from 'class-validator';

/**
 * 菜单列表转树形结构
 * @param arr
 */
export const buildMenus = (arr) => {
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
const formatTreeNodeBuildMenus = (menus) => {
  return menus.map((menu) => {
    const { parentId, menuType, visible, isCache, isFrame, path, query, component, menuName, icon, children } = menu;

    const formattedNode:any = {
      name: getRouteName(menu),
      path: getRouterPath(menu),
      hidden: visible === '1',
      link: isFrame === '0' ? path : null,
      component: getComponent(menu),
      meta: {
        title: menuName,
        icon: icon,
        noCache: isCache === '1',
        path: path,
      },
    };

    // 处理目录类型及有子菜单的情况
    if (children?.length > 0 && menuType === 'M') {
      formattedNode.alwaysShow = true;
      formattedNode.redirect = 'noRedirect';
      formattedNode.children = formatTreeNodeBuildMenus(children);
    }
    // 菜单类型且需要框架展示
    else if (isMenuFrame(menu)) {
      formattedNode.meta = null;
      formattedNode.path = '/'
      formattedNode.children = [{
        path,
        component,
        name: path,
        meta: {
          title: menuName,
          icon: icon,
          noCache: isCache === '1',
          path,
          query,
        },
      }];
    }
    // 根目录且为内链
    else if (parentId === 0 && isInnerLink(menu)) {
      formattedNode.meta = { title: menuName, icon };
      const routerPath = innerLinkReplaceEach(path);
      formattedNode.children = [{
        path: routerPath,
        component: 'InnerLink',
        name: getRouteName(menu),
        meta: { title: menuName, icon, path },
      }];
    }

    return formattedNode;
  });
};

/**
 * 获取路由名称
 *
 * @param menu 菜单信息
 * @return 路由名称
 */
const getRouteName = (menu) => {
  let routerName = menu.path.replace(/^\w/, (c) => c.toUpperCase());
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
  return menu.parentId === 0 && menu.menuType === 'C' && menu.isFrame === '1';
};

/**
 * 是否为内链组件
 *
 * @param menu 菜单信息
 * @return 结果
 */
const isInnerLink = (menu): boolean => {
  return menu.isFrame === '0' && isURL(menu.path);
};

/**
 * 是否为parent_view组件
 *
 * @param menu 菜单信息
 * @return 结果
 */
const isParentView = (menu): boolean => {
  return menu.parentId !== 0 && menu.menuType === 'M';
};

/**
 * 获取组件信息
 *
 * @param menu 菜单信息
 * @return 组件信息
 */
const getComponent = (menu): string => {
  let component = 'Layout';
  if (menu.component && !isMenuFrame(menu)) {
    component = menu.component;
  } else if (!menu.component && menu.parentId !== 0 && isInnerLink(menu)) {
    component = 'InnerLink';
  } else if (!menu.component && isParentView(menu)) {
    component = 'ParentView';
  }
  return component;
};

/**
 * 内链域名特殊字符替换
 *
 * @return 替换后的内链域名
 */
const innerLinkReplaceEach = (path: string): string => {
  if (!path) {
    return path;
  }
  const urlObj = new URL(path);
  return urlObj.hostname;
};

/**
 * 获取路由地址
 *
 * @param menu 菜单信息
 * @return 路由地址
 */
const getRouterPath = (menu): string => {
  let routerPath = menu.path;
  // console.log('routerPath',routerPath);

  // 内链打开外网方式
  if (menu.parentId !== 0 && isInnerLink(menu)) {
    routerPath = innerLinkReplaceEach(routerPath);
  }
  // 非外链并且是一级目录（类型为目录）
  if (menu.parentId === 0 && menu.menuType === 'M' && menu.isFrame === '1') {
    routerPath = '/' + menu.path;
  }
  // 非外链并且是一级目录（类型为菜单）
  else if (isMenuFrame(menu)) {
    routerPath = '/' + menu.path;
    // routerPath = '/';
  }
  return routerPath;
};
