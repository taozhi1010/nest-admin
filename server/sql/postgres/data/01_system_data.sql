-- 系统基础数据

-- 部门数据
INSERT INTO sys_dept (dept_id, parent_id, ancestors, dept_name, order_num, leader, phone, email, status, del_flag, create_by, create_time, remark) 
VALUES
  (100, 0, '0', 'nest-admin科技', 0, 'nest-admin', '15888888888', 'ry@qq.com', '0', '0', 'admin', CURRENT_TIMESTAMP, null),
  (101, 100, '0,100', '深圳总公司', 1, 'nest-admin', '15888888888', 'ry@qq.com', '0', '0', 'admin', CURRENT_TIMESTAMP, null),
  (102, 100, '0,100', '长沙分公司', 2, 'nest-admin', '15888888888', 'ry@qq.com', '0', '0', 'admin', CURRENT_TIMESTAMP, null),
  (103, 101, '0,100,101', '研发部门', 1, 'nest-admin', '15888888888', 'ry@qq.com', '0', '0', 'admin', CURRENT_TIMESTAMP, null),
  (104, 101, '0,100,101', '市场部门', 2, 'nest-admin', '15888888888', 'ry@qq.com', '0', '0', 'admin', CURRENT_TIMESTAMP, null),
  (105, 101, '0,100,101', '测试部门', 3, 'nest-admin', '15888888888', 'ry@qq.com', '0', '0', 'admin', CURRENT_TIMESTAMP, null),
  (106, 101, '0,100,101', '财务部门', 4, 'nest-admin', '15888888888', 'ry@qq.com', '0', '0', 'admin', CURRENT_TIMESTAMP, null),
  (107, 101, '0,100,101', '运维部门', 5, 'nest-admin', '15888888888', 'ry@qq.com', '0', '0', 'admin', CURRENT_TIMESTAMP, null),
  (108, 102, '0,100,102', '市场部门', 1, 'nest-admin', '15888888888', 'ry@qq.com', '0', '0', 'admin', CURRENT_TIMESTAMP, null),
  (109, 102, '0,100,102', '财务部门', 2, 'nest-admin', '15888888888', 'ry@qq.com', '0', '0', 'admin', CURRENT_TIMESTAMP, null);

-- 用户数据
INSERT INTO sys_user (user_id, dept_id, user_name, nick_name, user_type, email, phonenumber, sex, avatar, password, status, del_flag, login_ip, login_date, create_by, create_time, remark) 
VALUES
  (1, 103, 'admin', 'nest-admin', '00', 'ry@163.com', '15888888888', '1', '', '$2b$10$d4Z9Iq.v9J4pjX55I9mzRuPHsOMKLupOqxlb/UfbD9oYsYxd5ezeS', '0', '0', '127.0.0.1', CURRENT_TIMESTAMP, 'admin', CURRENT_TIMESTAMP, '管理员'),
  (2, 105, 'ry', 'nest-admin', '00', 'ry@qq.com', '15666666666', '1', '', '$2b$10$d4Z9Iq.v9J4pjX55I9mzRuPHsOMKLupOqxlb/UfbD9oYsYxd5ezeS', '0', '0', '127.0.0.1', CURRENT_TIMESTAMP, 'admin', CURRENT_TIMESTAMP, '测试员');

-- 岗位数据
INSERT INTO sys_post (post_id, post_code, post_name, post_sort, status, create_by, create_time, remark, del_flag) 
VALUES
  (1, 'ceo', '董事长', 1, '0', 'admin', CURRENT_TIMESTAMP, '', '0'),
  (2, 'se', '项目经理', 2, '0', 'admin', CURRENT_TIMESTAMP, '', '0'),
  (3, 'hr', '人力资源', 3, '0', 'admin', CURRENT_TIMESTAMP, '', '0'),
  (4, 'user', '普通员工', 4, '0', 'admin', CURRENT_TIMESTAMP, '', '0');

-- 角色数据
INSERT INTO sys_role (role_id, role_name, role_key, role_sort, data_scope, menu_check_strictly, dept_check_strictly, status, del_flag, create_by, create_time, remark) 
VALUES
  ('1', '超级管理员', 'admin', 1, 1, true, true, '0', '0', 'admin', CURRENT_TIMESTAMP, '超级管理员'),
  ('2', '普通角色', 'common', 2, 2, true, true, '0', '0', 'admin', CURRENT_TIMESTAMP, '普通角色');

-- 用户和角色关联数据
INSERT INTO sys_user_role (user_id, role_id) VALUES ('1', '1');
INSERT INTO sys_user_role (user_id, role_id) VALUES ('2', '2');

-- 用户与岗位关联数据
INSERT INTO sys_user_post (user_id, post_id) VALUES ('1', '1');
INSERT INTO sys_user_post (user_id, post_id) VALUES ('2', '2');

-- 角色和部门关联数据
INSERT INTO sys_role_dept (role_id, dept_id) VALUES ('2', '100');
INSERT INTO sys_role_dept (role_id, dept_id) VALUES ('2', '101');
INSERT INTO sys_role_dept (role_id, dept_id) VALUES ('2', '105'); 