-- 菜单权限按钮数据

-- 用户管理按钮
INSERT INTO sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time, remark, del_flag) 
VALUES
  ('1000', '用户查询', '100', '1', '', '', '', 1, 0, 'F', '0', '0', 'system:user:query', '#', 'admin', CURRENT_TIMESTAMP, '', '0'),
  ('1001', '用户新增', '100', '2', '', '', '', 1, 0, 'F', '0', '0', 'system:user:add', '#', 'admin', CURRENT_TIMESTAMP, '', '0'),
  ('1002', '用户修改', '100', '3', '', '', '', 1, 0, 'F', '0', '0', 'system:user:edit', '#', 'admin', CURRENT_TIMESTAMP, '', '0'),
  ('1003', '用户删除', '100', '4', '', '', '', 1, 0, 'F', '0', '0', 'system:user:remove', '#', 'admin', CURRENT_TIMESTAMP, '', '0'),
  ('1004', '用户导出', '100', '5', '', '', '', 1, 0, 'F', '0', '0', 'system:user:export', '#', 'admin', CURRENT_TIMESTAMP, '', '0'),
  ('1005', '用户导入', '100', '6', '', '', '', 1, 0, 'F', '0', '0', 'system:user:import', '#', 'admin', CURRENT_TIMESTAMP, '', '0'),
  ('1006', '重置密码', '100', '7', '', '', '', 1, 0, 'F', '0', '0', 'system:user:resetPwd', '#', 'admin', CURRENT_TIMESTAMP, '', '0');

-- 角色管理按钮
INSERT INTO sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time, remark, del_flag) 
VALUES
  ('1007', '角色查询', '101', '1', '', '', '', 1, 0, 'F', '0', '0', 'system:role:query', '#', 'admin', CURRENT_TIMESTAMP, '', '0'),
  ('1008', '角色新增', '101', '2', '', '', '', 1, 0, 'F', '0', '0', 'system:role:add', '#', 'admin', CURRENT_TIMESTAMP, '', '0'),
  ('1009', '角色修改', '101', '3', '', '', '', 1, 0, 'F', '0', '0', 'system:role:edit', '#', 'admin', CURRENT_TIMESTAMP, '', '0'),
  ('1010', '角色删除', '101', '4', '', '', '', 1, 0, 'F', '0', '0', 'system:role:remove', '#', 'admin', CURRENT_TIMESTAMP, '', '0'),
  ('1011', '角色导出', '101', '5', '', '', '', 1, 0, 'F', '0', '0', 'system:role:export', '#', 'admin', CURRENT_TIMESTAMP, '', '0');

-- 菜单管理按钮
INSERT INTO sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time, remark, del_flag) 
VALUES
  ('1012', '菜单查询', '102', '1', '', '', '', 1, 0, 'F', '0', '0', 'system:menu:query', '#', 'admin', CURRENT_TIMESTAMP, '', '0'),
  ('1013', '菜单新增', '102', '2', '', '', '', 1, 0, 'F', '0', '0', 'system:menu:add', '#', 'admin', CURRENT_TIMESTAMP, '', '0'),
  ('1014', '菜单修改', '102', '3', '', '', '', 1, 0, 'F', '0', '0', 'system:menu:edit', '#', 'admin', CURRENT_TIMESTAMP, '', '0'),
  ('1015', '菜单删除', '102', '4', '', '', '', 1, 0, 'F', '0', '0', 'system:menu:remove', '#', 'admin', CURRENT_TIMESTAMP, '', '0');

-- 部门管理按钮
INSERT INTO sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time, remark, del_flag) 
VALUES
  ('1016', '部门查询', '103', '1', '', '', '', 1, 0, 'F', '0', '0', 'system:dept:query', '#', 'admin', CURRENT_TIMESTAMP, '', '0'),
  ('1017', '部门新增', '103', '2', '', '', '', 1, 0, 'F', '0', '0', 'system:dept:add', '#', 'admin', CURRENT_TIMESTAMP, '', '0'),
  ('1018', '部门修改', '103', '3', '', '', '', 1, 0, 'F', '0', '0', 'system:dept:edit', '#', 'admin', CURRENT_TIMESTAMP, '', '0'),
  ('1019', '部门删除', '103', '4', '', '', '', 1, 0, 'F', '0', '0', 'system:dept:remove', '#', 'admin', CURRENT_TIMESTAMP, '', '0');

-- 岗位管理按钮
INSERT INTO sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time, remark, del_flag) 
VALUES
  ('1020', '岗位查询', '104', '1', '', '', '', 1, 0, 'F', '0', '0', 'system:post:query', '#', 'admin', CURRENT_TIMESTAMP, '', '0'),
  ('1021', '岗位新增', '104', '2', '', '', '', 1, 0, 'F', '0', '0', 'system:post:add', '#', 'admin', CURRENT_TIMESTAMP, '', '0'),
  ('1022', '岗位修改', '104', '3', '', '', '', 1, 0, 'F', '0', '0', 'system:post:edit', '#', 'admin', CURRENT_TIMESTAMP, '', '0'),
  ('1023', '岗位删除', '104', '4', '', '', '', 1, 0, 'F', '0', '0', 'system:post:remove', '#', 'admin', CURRENT_TIMESTAMP, '', '0'),
  ('1024', '岗位导出', '104', '5', '', '', '', 1, 0, 'F', '0', '0', 'system:post:export', '#', 'admin', CURRENT_TIMESTAMP, '', '0');

-- 字典管理按钮
INSERT INTO sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time, remark, del_flag) 
VALUES
  ('1025', '字典查询', '105', '1', '#', '', '', 1, 0, 'F', '0', '0', 'system:dict:query', '#', 'admin', CURRENT_TIMESTAMP, '', '0'),
  ('1026', '字典新增', '105', '2', '#', '', '', 1, 0, 'F', '0', '0', 'system:dict:add', '#', 'admin', CURRENT_TIMESTAMP, '', '0'),
  ('1027', '字典修改', '105', '3', '#', '', '', 1, 0, 'F', '0', '0', 'system:dict:edit', '#', 'admin', CURRENT_TIMESTAMP, '', '0'),
  ('1028', '字典删除', '105', '4', '#', '', '', 1, 0, 'F', '0', '0', 'system:dict:remove', '#', 'admin', CURRENT_TIMESTAMP, '', '0'),
  ('1029', '字典导出', '105', '5', '#', '', '', 1, 0, 'F', '0', '0', 'system:dict:export', '#', 'admin', CURRENT_TIMESTAMP, '', '0');

-- 参数设置按钮
INSERT INTO sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time, remark, del_flag) 
VALUES
  ('1030', '参数查询', '106', '1', '#', '', '', 1, 0, 'F', '0', '0', 'system:config:query', '#', 'admin', CURRENT_TIMESTAMP, '', '0'),
  ('1031', '参数新增', '106', '2', '#', '', '', 1, 0, 'F', '0', '0', 'system:config:add', '#', 'admin', CURRENT_TIMESTAMP, '', '0'),
  ('1032', '参数修改', '106', '3', '#', '', '', 1, 0, 'F', '0', '0', 'system:config:edit', '#', 'admin', CURRENT_TIMESTAMP, '', '0'),
  ('1033', '参数删除', '106', '4', '#', '', '', 1, 0, 'F', '0', '0', 'system:config:remove', '#', 'admin', CURRENT_TIMESTAMP, '', '0'),
  ('1034', '参数导出', '106', '5', '#', '', '', 1, 0, 'F', '0', '0', 'system:config:export', '#', 'admin', CURRENT_TIMESTAMP, '', '0');

-- 通知公告按钮
INSERT INTO sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time, remark, del_flag) 
VALUES
  ('1035', '公告查询', '107', '1', '#', '', '', 1, 0, 'F', '0', '0', 'system:notice:query', '#', 'admin', CURRENT_TIMESTAMP, '', '0'),
  ('1036', '公告新增', '107', '2', '#', '', '', 1, 0, 'F', '0', '0', 'system:notice:add', '#', 'admin', CURRENT_TIMESTAMP, '', '0'),
  ('1037', '公告修改', '107', '3', '#', '', '', 1, 0, 'F', '0', '0', 'system:notice:edit', '#', 'admin', CURRENT_TIMESTAMP, '', '0'),
  ('1038', '公告删除', '107', '4', '#', '', '', 1, 0, 'F', '0', '0', 'system:notice:remove', '#', 'admin', CURRENT_TIMESTAMP, '', '0');

-- 操作日志按钮
INSERT INTO sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time, remark, del_flag) 
VALUES
  ('1039', '操作查询', '500', '1', '#', '', '', 1, 0, 'F', '0', '0', 'monitor:operlog:query', '#', 'admin', CURRENT_TIMESTAMP, '', '0'),
  ('1040', '操作删除', '500', '2', '#', '', '', 1, 0, 'F', '0', '0', 'monitor:operlog:remove', '#', 'admin', CURRENT_TIMESTAMP, '', '0'),
  ('1041', '日志导出', '500', '3', '#', '', '', 1, 0, 'F', '0', '0', 'monitor:operlog:export', '#', 'admin', CURRENT_TIMESTAMP, '', '0');

-- 登录日志按钮
INSERT INTO sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time, remark, del_flag) 
VALUES
  ('1042', '登录查询', '501', '1', '#', '', '', 1, 0, 'F', '0', '0', 'monitor:logininfor:query', '#', 'admin', CURRENT_TIMESTAMP, '', '0'),
  ('1043', '登录删除', '501', '2', '#', '', '', 1, 0, 'F', '0', '0', 'monitor:logininfor:remove', '#', 'admin', CURRENT_TIMESTAMP, '', '0'),
  ('1044', '日志导出', '501', '3', '#', '', '', 1, 0, 'F', '0', '0', 'monitor:logininfor:export', '#', 'admin', CURRENT_TIMESTAMP, '', '0'),
  ('1045', '账户解锁', '501', '4', '#', '', '', 1, 0, 'F', '0', '0', 'monitor:logininfor:unlock', '#', 'admin', CURRENT_TIMESTAMP, '', '0');

-- 在线用户按钮
INSERT INTO sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time, remark, del_flag) 
VALUES
  ('1046', '在线查询', '109', '1', '#', '', '', 1, 0, 'F', '0', '0', 'monitor:online:query', '#', 'admin', CURRENT_TIMESTAMP, '', '0'),
  ('1047', '批量强退', '109', '2', '#', '', '', 1, 0, 'F', '0', '0', 'monitor:online:batchLogout', '#', 'admin', CURRENT_TIMESTAMP, '', '0'),
  ('1048', '单条强退', '109', '3', '#', '', '', 1, 0, 'F', '0', '0', 'monitor:online:forceLogout', '#', 'admin', CURRENT_TIMESTAMP, '', '0');

-- 定时任务按钮
INSERT INTO sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time, remark, del_flag) 
VALUES
  ('1049', '任务查询', '110', '1', '#', '', '', 1, 0, 'F', '0', '0', 'monitor:job:query', '#', 'admin', CURRENT_TIMESTAMP, '', '0'),
  ('1050', '任务新增', '110', '2', '#', '', '', 1, 0, 'F', '0', '0', 'monitor:job:add', '#', 'admin', CURRENT_TIMESTAMP, '', '0'),
  ('1051', '任务修改', '110', '3', '#', '', '', 1, 0, 'F', '0', '0', 'monitor:job:edit', '#', 'admin', CURRENT_TIMESTAMP, '', '0'),
  ('1052', '任务删除', '110', '4', '#', '', '', 1, 0, 'F', '0', '0', 'monitor:job:remove', '#', 'admin', CURRENT_TIMESTAMP, '', '0'),
  ('1053', '状态修改', '110', '5', '#', '', '', 1, 0, 'F', '0', '0', 'monitor:job:changeStatus', '#', 'admin', CURRENT_TIMESTAMP, '', '0'),
  ('1054', '任务导出', '110', '6', '#', '', '', 1, 0, 'F', '0', '0', 'monitor:job:export', '#', 'admin', CURRENT_TIMESTAMP, '', '0');

-- 代码生成按钮
INSERT INTO sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time, remark, del_flag) 
VALUES
  ('1055', '生成查询', '116', '1', '#', '', '', 1, 0, 'F', '0', '0', 'tool:gen:query', '#', 'admin', CURRENT_TIMESTAMP, '', '0'),
  ('1056', '生成修改', '116', '2', '#', '', '', 1, 0, 'F', '0', '0', 'tool:gen:edit', '#', 'admin', CURRENT_TIMESTAMP, '', '0'),
  ('1057', '生成删除', '116', '3', '#', '', '', 1, 0, 'F', '0', '0', 'tool:gen:remove', '#', 'admin', CURRENT_TIMESTAMP, '', '0'),
  ('1058', '导入代码', '116', '4', '#', '', '', 1, 0, 'F', '0', '0', 'tool:gen:import', '#', 'admin', CURRENT_TIMESTAMP, '', '0'),
  ('1059', '预览代码', '116', '5', '#', '', '', 1, 0, 'F', '0', '0', 'tool:gen:preview', '#', 'admin', CURRENT_TIMESTAMP, '', '0'),
  ('1060', '生成代码', '116', '6', '#', '', '', 1, 0, 'F', '0', '0', 'tool:gen:code', '#', 'admin', CURRENT_TIMESTAMP, '', '0');

-- API代理管理按钮
INSERT INTO sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time, remark, del_flag) 
VALUES
  ('1061', '代理查询', '118', '1', '#', '', '', 1, 0, 'F', '0', '0', 'tool:api-proxy:query', '#', 'admin', CURRENT_TIMESTAMP, '', '0'),
  ('1062', '代理新增', '118', '2', '#', '', '', 1, 0, 'F', '0', '0', 'tool:api-proxy:add', '#', 'admin', CURRENT_TIMESTAMP, '', '0'),
  ('1063', '代理修改', '118', '3', '#', '', '', 1, 0, 'F', '0', '0', 'tool:api-proxy:edit', '#', 'admin', CURRENT_TIMESTAMP, '', '0'),
  ('1064', '代理删除', '118', '4', '#', '', '', 1, 0, 'F', '0', '0', 'tool:api-proxy:remove', '#', 'admin', CURRENT_TIMESTAMP, '', '0'),
  ('1065', '代理导出', '118', '5', '#', '', '', 1, 0, 'F', '0', '0', 'tool:api-proxy:export', '#', 'admin', CURRENT_TIMESTAMP, '', '0'),
  ('1066', '代理测试', '118', '6', '#', '', '', 1, 0, 'F', '0', '0', 'tool:api-proxy:test', '#', 'admin', CURRENT_TIMESTAMP, '', '0'),
  ('1067', '状态修改', '118', '7', '#', '', '', 1, 0, 'F', '0', '0', 'tool:api-proxy:changeStatus', '#', 'admin', CURRENT_TIMESTAMP, '', '0'); 