import { SysDeptEntity } from '../../dept/entities/dept.entity';
import { SysPostEntity } from '../../post/entities/post.entity';
import { SysRoleEntity } from '../../role/entities/role.entity';
import { UserEntity } from '../entities/sys-user.entity';

export type UserType = {
  browser: string;
  ipaddr: string;
  loginLocation: string;
  loginTime: Date;
  os: string;
  permissions: string[];
  roles: string[];
  token: string;
  user: {
    dept: SysDeptEntity;
    roles: Array<SysRoleEntity>;
    posts: Array<SysPostEntity>;
  } & UserEntity;
  userId: number;
  userName: string;
  deptId: number;
};
