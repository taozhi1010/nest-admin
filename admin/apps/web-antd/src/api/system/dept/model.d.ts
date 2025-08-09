export interface Dept {
  createBy: string;
  createTime: string;
  updateBy?: string;
  updateTime?: string;
  remark?: string;
  deptId: number;
  parentId: number;
  ancestors: string;
  deptName: string;
  orderNum: number;
  leader: string;
  phone: string;
  email: string;
  status: string;
  delFlag: string;
  parentName?: string;
  children?: Dept[];
}
