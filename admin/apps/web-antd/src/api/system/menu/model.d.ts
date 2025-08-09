export interface Menu {
  createBy?: any;
  createTime: string;
  updateBy?: any;
  updateTime?: any;
  remark?: any;
  menuId: number;
  menuName: string;
  parentName?: string;
  parentId: number;
  orderNum: number;
  path: string;
  component?: string;
  query: string;
  isFrame: string;
  isCache: string;
  menuType: string;
  visible: string;
  status: string;
  perms: string;
  icon: string;
  children: Menu[];
}

/**
 * @description 菜单信息
 * @param label 菜单名称
 */
export interface MenuOption {
  id: number;
  parentId: number;
  label: string;
  weight: number;
  children: MenuOption[];
  key: string; // 实际上不存在 ide报错
  menuType: string;
  icon: string;
}

/**
 * @description 菜单返回
 * @param checkedKeys 选中的菜单id
 * @param menus 菜单信息
 */
export interface MenuResp {
  checkedKeys: number[];
  menus: MenuOption[];
}

/**
 * 菜单表单查询
 */
export interface MenuQuery {
  menuName?: string;
  visible?: string;
  status?: string;
}
