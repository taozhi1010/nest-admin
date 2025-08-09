export interface Dept {
  deptId: number;
  parentId: number;
  parentName?: any;
  ancestors: string;
  deptName: string;
  orderNum: number;
  leader: string;
  phone?: any;
  email: string;
  status: string;
  createTime?: any;
}

export interface Role {
  roleId: number;
  roleName: string;
  roleKey: string;
  roleSort: number;
  dataScope: string;
  menuCheckStrictly?: any;
  deptCheckStrictly?: any;
  status: string;
  remark: string;
  createTime?: any;
  flag: boolean;
  superAdmin: boolean;
}

export interface User {
  userId: number;
  tenantId: string;
  deptId: number;
  username: string;
  nickName: string;
  userType: string;
  email: string;
  phonenumber: string;
  sex: string;
  avatar: string;
  status: string;
  loginIp: string;
  loginDate: string;
  remark: string;
  createTime: string;
  dept: Dept;
  roles: Role[];
  roleIds?: string[];
  postIds?: string[];
  roleId: number;
  deptName: string;
}

/**
 * @description 用户个人主页信息
 * @param user 用户信息
 * @param roleGroup 角色名称
 * @param postGroup 岗位名称
 */
export interface UserProfile {
  user: User;
  roleGroup: string;
  postGroup: string;
}

export interface UpdatePasswordParam {
  oldPassword: string;
  newPassword: string;
}

interface FileCallBack {
  name: string;
  file: Blob;
  filename: string;
}
