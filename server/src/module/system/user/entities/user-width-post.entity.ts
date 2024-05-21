import { Entity, PrimaryColumn } from 'typeorm';

//用户与岗位关联表  用户1-N岗位
@Entity('sys_user_post', {
  comment: '用户与岗位关联表',
})
export class SysUserWithPostEntity {
  @PrimaryColumn({ type: 'int', name: 'user_id', comment: '用户ID' })
  public userId: number;

  @PrimaryColumn({ type: 'int', name: 'post_id', comment: '岗位ID' })
  public postId: number;
}
