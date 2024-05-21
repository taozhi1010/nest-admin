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
const formatTreeNodeBuildMenus = (menus: any[]): any[] => {
  return menus.map((menu) => {
    const formattedNode: any = {};
    formattedNode.name = getRouteName(menu);
    formattedNode.path = getRouterPath(menu);
    formattedNode.hidden = menu.visible === '1';
    formattedNode.component = getComponent(menu);
    switch (menu.menuType) {
      case 'M': //目录
        formattedNode.meta = {
          title: menu.menuName,
          icon: menu.icon,
          noCache: menu.isCache === '1',
          link: menu.isFrame === '0' ? menu.path : null,
        };
        if (menu.children) {
          formattedNode.alwaysShow = true;
          formattedNode.redirect = 'noRedirect';
          formattedNode.children = menu.children;
        }
        break;
      case 'C': //菜单
        if (menu.query) {
          formattedNode.query = menu.query;
        }
        formattedNode.meta = {
          title: menu.menuName,
          icon: menu.icon,
          noCache: menu.isCache === '1',
          link: menu.isFrame === '0' ? menu.path : null,
        };

        break;
      case 'F': //按钮
        break;
      default:
        break;
    }
    // 如果节点有子节点，递归处理它们
    if (formattedNode.children) {
      formattedNode.children = formatTreeNodeBuildMenus(formattedNode.children);
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
    routerPath = '/';
  }
  return routerPath;
};
