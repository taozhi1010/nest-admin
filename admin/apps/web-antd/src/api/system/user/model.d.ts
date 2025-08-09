/**
 * @description: 用户导入
 * @param updateSupport 是否覆盖数据
 * @param file excel文件
 */
export interface UserImportParam {
  updateSupport: boolean;
  file: Blob | File;
}

/**
 * @description: 重置密码
 */
export interface ResetPwdParam {
  userId: string;
  password: string;
}

export interface Dept {
  deptId: number;
  parentId: number;
  parentName?: string;
  ancestors: string;
  deptName: string;
  orderNum: number;
  leader: string;
  phone?: string;
  email?: string;
  status: string;
  createTime?: string;
}

export interface Role {
  roleId: string;
  roleName: string;
  roleKey: string;
  roleSort: number;
  dataScope: string;
  menuCheckStrictly?: boolean;
  deptCheckStrictly?: boolean;
  status: string;
  remark: string;
  createTime?: string;
  flag: boolean;
  superAdmin: boolean;
}

export interface User {
  userId: string;
  tenantId: string;
  deptId: number;
  username: string;
  nickName: string;
  userType: string;
  email: string;
  phonenumber: string;
  sex: string;
  avatar?: string;
  status: string;
  loginIp: string;
  loginDate: string;
  remark: string;
  createTime: string;
  dept: Dept;
  roles: Role[];
  roleIds?: string[];
  postIds?: number[];
  roleId: string;
}

export interface Post {
  postId: number;
  postCode: string;
  postName: string;
  postSort: number;
  status: string;
  remark: string;
  createTime: string;
}

/**
 * @description 用户信息
 * @param user 用户个人信息
 * @param roleIds 角色IDS 不传id为空
 * @param roles 所有的角色
 * @param postIds 岗位IDS 不传id为空
 * @param posts 所有的岗位
 */
export interface UserInfoResponse {
  user?: User;
  roleIds?: string[];
  roles: Role[];
  postIds?: number[];
  posts?: Post[];
}

/**
 * @description: 部门树
 */
export interface DeptTree {
  id: number;
  /**
   * antd组件必须要这个属性 实际是没有这个属性的
   */
  key: string;
  parentId: number;
  label: string;
  weight: number;
  children?: DeptTree[];
}

export interface DeptTreeData {
  id: number;
  label: string;
  children?: DeptTreeData[];
}
