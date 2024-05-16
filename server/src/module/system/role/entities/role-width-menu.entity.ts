import { Column, Entity, PrimaryColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

//角色和菜单关联表  角色1-N菜单
@Entity('sys_role_menu', {
  comment: '角色和菜单关联表',
})
export class SysRoleWithMenuEntity {
  @PrimaryColumn({ type: 'bigint', name: 'role_id', default: 0, comment: '角色ID' })
  public roleId: string;

  @PrimaryColumn({ type: 'bigint', name: 'menu_id', default: 0, comment: '菜单ID' })
  public menuId: string;
}
