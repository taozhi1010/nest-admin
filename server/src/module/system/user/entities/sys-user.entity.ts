import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { BaseEntity } from 'src/common/entities/base';
@Entity('sys_user', {
  comment: '用户信息表',
})
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'user_id', comment: '用户ID' })
  public userId: number;

  @Column({ type: 'int', name: 'dept_id', default: null, comment: '部门ID' })
  public deptId: number;

  @Column({ type: 'varchar', name: 'user_name', length: 30, nullable: false, comment: '用户账号' })
  public userName: string;

  @Column({ type: 'varchar', name: 'nick_name', length: 30, nullable: false, comment: '用户昵称' })
  public nickName: string;

  //00系统用户
  @Column({ type: 'varchar', name: 'user_type', length: 2, default: '00', comment: '用户类型' })
  public userType: string;

  @Column({ type: 'varchar', name: 'email', length: 50, default: '', comment: '邮箱' })
  public email: string;

  @Column({ type: 'varchar', name: 'phonenumber', default: '', length: 11, comment: '手机号码' })
  public phonenumber: string;

  //0男 1女 2未知
  @Column({ type: 'char', name: 'sex', default: '0', length: 1, comment: '性别' })
  public sex: string;

  @Column({ type: 'varchar', name: 'avatar', default: '', comment: '头像地址' })
  public avatar: string;

  @Exclude({ toPlainOnly: true }) // 输出屏蔽密码
  @Column({ type: 'varchar', length: 200, nullable: false, default: '', comment: '用户登录密码' })
  public password: string;

  @Column({ type: 'varchar', name: 'login_ip', length: 128, default: '', comment: '最后登录IP' })
  public loginIp: string;

  @Column({ type: 'timestamp', name: 'login_date', comment: '最后登录时间' })
  public loginDate: Date;
}
