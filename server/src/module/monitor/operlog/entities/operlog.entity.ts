export class Operlog {}
import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('sys_oper_log', {
  comment: '操作日志记录',
})
export class MonitorOperlogEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'oper_id', comment: '日志主键' })
  public operId: number;

  @Column({ type: 'varchar', name: 'title', length: 50, default: '', comment: '模块标题' })
  public title: string;

  //业务类型（0其它 1新增 2修改 3删除）
  @Column({ type: 'int', name: 'business_type', default: 0, comment: '业务类型' })
  public businessType: number;

  @Column({ type: 'varchar', name: 'method', length: 100, default: '', comment: '方法名称' })
  public method: string;

  @Column({ type: 'varchar', name: 'request_method', length: 10, default: '', comment: '请求方式' })
  public requestMethod: string;

  //0其它 1后台用户 2手机端用户
  @Column({ type: 'int', name: 'operator_type', default: 0, comment: '操作类别' })
  public operatorType: string;

  @Column({ type: 'varchar', name: 'oper_name', length: 50, default: '', comment: '操作人员' })
  public operName: string;

  @Column({ type: 'varchar', name: 'dept_name', length: 50, default: '', comment: '部门名称' })
  public deptName: string;

  @Column({ type: 'varchar', name: 'oper_url', length: 255, default: '', comment: '请求URL' })
  public operUrl: string;

  @Column({ type: 'varchar', name: 'oper_ip', length: 255, default: '', comment: '主机地址' })
  public operIp: string;

  @Column({ type: 'varchar', name: 'oper_location', length: 255, default: '', comment: '操作地点' })
  public operLocation: string;

  @Column({ type: 'varchar', name: 'oper_param', length: 2000, default: '', comment: '请求参数' })
  public operParam: string;

  @Column({ type: 'varchar', name: 'json_result', length: 2000, default: '', comment: '返回参数' })
  public jsonResult: string;

  @CreateDateColumn({ type: 'timestamp', name: 'oper_time', comment: '操作时间' })
  public operTime: Date;

  //登录状态:0正常 1失败
  @Column({ type: 'char', name: 'status', length: 1, default: '0', comment: '登录状态' })
  public status: string;

  //提示消息
  @Column({ type: 'varchar', name: 'error_msg', length: 2000, default: '', comment: '错误消息' })
  public errorMsg: string;

  @Column({ type: 'int', name: 'cost_time', default: 0, comment: '消耗时间' })
  public costTime: number;
}
