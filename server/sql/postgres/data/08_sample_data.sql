-- 补充样例数据

-- 更多部门数据
INSERT INTO sys_dept (dept_id, parent_id, ancestors, dept_name, order_num, leader, phone, email, status, del_flag, create_by, create_time, remark) 
VALUES
  (110, 101, '0,100,101', '人事部门', 6, 'nest-admin', '15888888888', 'hr@qq.com', '0', '0', 'admin', CURRENT_TIMESTAMP, null),
  (111, 101, '0,100,101', '采购部门', 7, 'nest-admin', '15888888888', 'purchase@qq.com', '0', '0', 'admin', CURRENT_TIMESTAMP, null),
  (112, 102, '0,100,102', '技术部门', 3, 'nest-admin', '15888888888', 'tech@qq.com', '0', '0', 'admin', CURRENT_TIMESTAMP, null);

-- 更多用户数据
INSERT INTO sys_user (user_id, dept_id, user_name, nick_name, user_type, email, phonenumber, sex, avatar, password, status, del_flag, login_ip, login_date, create_by, create_time, remark) 
VALUES
  (3, 110, 'hr001', '人事专员', '00', 'hr001@163.com', '13800000001', '1', '', '$2b$10$d4Z9Iq.v9J4pjX55I9mzRuPHsOMKLupOqxlb/UfbD9oYsYxd5ezeS', '0', '0', '127.0.0.1', CURRENT_TIMESTAMP, 'admin', CURRENT_TIMESTAMP, '人事部员工'),
  (4, 106, 'finance001', '财务专员', '00', 'finance001@163.com', '13800000002', '1', '', '$2b$10$d4Z9Iq.v9J4pjX55I9mzRuPHsOMKLupOqxlb/UfbD9oYsYxd5ezeS', '0', '0', '127.0.0.1', CURRENT_TIMESTAMP, 'admin', CURRENT_TIMESTAMP, '财务部员工'),
  (5, 103, 'dev001', '前端开发', '00', 'dev001@163.com', '13800000003', '0', '', '$2b$10$d4Z9Iq.v9J4pjX55I9mzRuPHsOMKLupOqxlb/UfbD9oYsYxd5ezeS', '0', '0', '127.0.0.1', CURRENT_TIMESTAMP, 'admin', CURRENT_TIMESTAMP, '前端开发工程师'),
  (6, 103, 'dev002', '后端开发', '00', 'dev002@163.com', '13800000004', '0', '', '$2b$10$d4Z9Iq.v9J4pjX55I9mzRuPHsOMKLupOqxlb/UfbD9oYsYxd5ezeS', '0', '0', '127.0.0.1', CURRENT_TIMESTAMP, 'admin', CURRENT_TIMESTAMP, '后端开发工程师');

-- 更多岗位数据
INSERT INTO sys_post (post_id, post_code, post_name, post_sort, status, create_by, create_time, remark, del_flag) 
VALUES
  (5, 'developer', '开发工程师', 5, '0', 'admin', CURRENT_TIMESTAMP, '', '0'),
  (6, 'tester', '测试工程师', 6, '0', 'admin', CURRENT_TIMESTAMP, '', '0'),
  (7, 'ops', '运维工程师', 7, '0', 'admin', CURRENT_TIMESTAMP, '', '0'),
  (8, 'designer', 'UI设计师', 8, '0', 'admin', CURRENT_TIMESTAMP, '', '0');

-- 用户角色关联
insert into sys_user_role values (3, 2);
insert into sys_user_role values (4, 2);
insert into sys_user_role values (5, 2);
insert into sys_user_role values (6, 2);

-- 用户岗位关联  
insert into sys_user_post values (3, 3);
insert into sys_user_post values (4, 4);
insert into sys_user_post values (5, 5);
insert into sys_user_post values (6, 5); 