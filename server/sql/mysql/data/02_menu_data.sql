-- 菜单基础数据

-- 一级菜单
INSERT INTO sys_menu 
  (menu_id, menu_name, parent_id, order_num, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time, remark) 
VALUES 
  (1, '系统管理', 0, 1, 'system', NULL, '1', '0', 'M', '0', '0', '', 'system', 'admin', CURRENT_TIMESTAMP, '系统管理目录'),
  (2, '系统监控', 0, 2, 'monitor', NULL, '1', '0', 'M', '0', '0', '', 'monitor', 'admin', CURRENT_TIMESTAMP, '系统监控目录'),
  (3, '系统工具', 0, 3, 'tool', NULL, '1', '0', 'M', '0', '0', '', 'tool', 'admin', CURRENT_TIMESTAMP, '系统工具目录'),
  (4, 'nest-admin官网', 0, 4, 'https://nest-admin.dooring.vip', NULL, '0', '0', 'M', '0', '0', '', 'guide', 'admin', CURRENT_TIMESTAMP, 'nest-admin官网地址');

-- 二级菜单
INSERT INTO sys_menu 
  (menu_id, menu_name, parent_id, order_num, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time, remark) 
VALUES 
  (100, '用户管理', 1, 1, 'user', 'system/user/index', '1', '0', 'C', '0', '0', 'system:user:list', 'user', 'admin', CURRENT_TIMESTAMP, '用户管理菜单'),
  (101, '角色管理', 1, 2, 'role', 'system/role/index', '1', '0', 'C', '0', '0', 'system:role:list', 'peoples', 'admin', CURRENT_TIMESTAMP, '角色管理菜单'),
  (102, '菜单管理', 1, 3, 'menu', 'system/menu/index', '1', '0', 'C', '0', '0', 'system:menu:list', 'tree-table', 'admin', CURRENT_TIMESTAMP, '菜单管理菜单'),
  (103, '部门管理', 1, 4, 'dept', 'system/dept/index', '1', '0', 'C', '0', '0', 'system:dept:list', 'tree', 'admin', CURRENT_TIMESTAMP, '部门管理菜单'),
  (104, '岗位管理', 1, 5, 'post', 'system/post/index', '1', '0', 'C', '0', '0', 'system:post:list', 'post', 'admin', CURRENT_TIMESTAMP, '岗位管理菜单'),
  (105, '字典管理', 1, 6, 'dict', 'system/dict/index', '1', '0', 'C', '0', '0', 'system:dict:list', 'dict', 'admin', CURRENT_TIMESTAMP, '字典管理菜单'),
  (106, '参数设置', 1, 7, 'config', 'system/config/index', '1', '0', 'C', '0', '0', 'system:config:list', 'edit', 'admin', CURRENT_TIMESTAMP, '参数设置菜单'),
  (107, '通知公告', 1, 8, 'notice', 'system/notice/index', '1', '0', 'C', '0', '0', 'system:notice:list', 'message', 'admin', CURRENT_TIMESTAMP, '通知公告菜单'),
  (108, '日志管理', 1, 9, 'log', '', '1', '0', 'M', '0', '0', '', 'log', 'admin', CURRENT_TIMESTAMP, '日志管理菜单'),
  (109, '在线用户', 2, 1, 'online', 'monitor/online/index', '1', '0', 'C', '0', '0', 'monitor:online:list', 'online', 'admin', CURRENT_TIMESTAMP, '在线用户菜单'),
  (110, '定时任务', 2, 2, 'job', 'monitor/job/index', '1', '0', 'C', '0', '0', 'monitor:job:list', 'job', 'admin', CURRENT_TIMESTAMP, '定时任务菜单'),
  (111, '数据监控', 2, 3, 'druid', 'monitor/druid/index', '1', '0', 'C', '0', '0', 'monitor:druid:list', 'druid', 'admin', CURRENT_TIMESTAMP, '数据监控菜单'),
  (112, '服务监控', 2, 4, 'server', 'monitor/server/index', '1', '0', 'C', '0', '0', 'monitor:server:list', 'server', 'admin', CURRENT_TIMESTAMP, '服务监控菜单'),
  (113, '缓存监控', 2, 5, 'cache', 'monitor/cache/index', '1', '0', 'C', '0', '0', 'monitor:cache:list', 'redis', 'admin', CURRENT_TIMESTAMP, '缓存监控菜单'),
  (114, '缓存列表', 2, 6, 'cacheList', 'monitor/cache/list', '1', '0', 'C', '0', '0', 'monitor:cache:list', 'redis-list', 'admin', CURRENT_TIMESTAMP, '缓存列表菜单'),
  (115, '表单构建', 3, 1, 'build', 'tool/build/index', '1', '0', 'C', '0', '0', 'tool:build:list', 'build', 'admin', CURRENT_TIMESTAMP, '表单构建菜单'),
  (116, '代码生成', 3, 2, 'gen', 'tool/gen/index', '1', '0', 'C', '0', '0', 'tool:gen:list', 'code', 'admin', CURRENT_TIMESTAMP, '代码生成菜单'),
  (117, '系统接口', 3, 3, 'swagger', 'tool/swagger/index', '1', '0', 'C', '0', '0', 'tool:swagger:list', 'swagger', 'admin', CURRENT_TIMESTAMP, '系统接口菜单'),
  (118, 'API代理', 3, 4, 'api-proxy', 'tool/api-proxy/index', '1', '0', 'C', '0', '0', 'tool:api-proxy:list', 'proxy', 'admin', CURRENT_TIMESTAMP, 'API代理管理菜单');

-- 三级菜单
INSERT INTO sys_menu 
  (menu_id, menu_name, parent_id, order_num, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time, remark) 
VALUES 
  (500, '操作日志', 108, 1, 'operlog', 'monitor/operlog/index', '1', '0', 'C', '0', '0', 'monitor:operlog:list', 'form', 'admin', CURRENT_TIMESTAMP, '操作日志菜单'),
  (501, '登录日志', 108, 2, 'logininfor', 'monitor/logininfor/index', '1', '0', 'C', '0', '0', 'monitor:logininfor:list', 'logininfor', 'admin', CURRENT_TIMESTAMP, '登录日志菜单'); 