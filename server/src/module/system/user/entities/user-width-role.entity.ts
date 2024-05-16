import { Entity, PrimaryColumn } from 'typeorm';

//用户和角色关联表  用户N-1角色
@Entity('sys_user_role', {
  comment: '用户和角色关联表',
})
export class SysUserWithRoleEntity {
  @PrimaryColumn({ type: 'bigint', name: 'user_id', comment: '用户ID' })
  public userId: string;

  @PrimaryColumn({ type: 'bigint', name: 'role_id', comment: '角色ID' })
  public roleId: string;
}
