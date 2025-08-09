-- 配置相关数据

-- 字典类型数据
INSERT INTO sys_dict_type (dict_id, dict_name, dict_type, status, create_by, create_time, remark, del_flag) 
VALUES
  (1, '用户性别', 'sys_user_sex', '0', 'admin', sysdate(), '用户性别列表', '0'),
  (2, '菜单状态', 'sys_show_hide', '0', 'admin', sysdate(), '菜单状态列表', '0'),
  (3, '系统开关', 'sys_normal_disable', '0', 'admin', sysdate(), '系统开关列表', '0'),
  (4, '任务状态', 'sys_job_status', '0', 'admin', sysdate(), '任务状态列表', '0'),
  (5, '任务分组', 'sys_job_group', '0', 'admin', sysdate(), '任务分组列表', '0'),
  (6, '系统是否', 'sys_yes_no', '0', 'admin', sysdate(), '系统是否列表', '0'),
  (7, '通知类型', 'sys_notice_type', '0', 'admin', sysdate(), '通知类型列表', '0'),
  (8, '通知状态', 'sys_notice_status', '0', 'admin', sysdate(), '通知状态列表', '0'),
  (9, '操作类型', 'sys_oper_type', '0', 'admin', sysdate(), '操作类型列表', '0'),
  (10, '系统状态', 'sys_common_status', '0', 'admin', sysdate(), '登录状态列表', '0');

-- 字典数据
INSERT INTO sys_dict_data (dict_code, dict_sort, dict_label, dict_value, dict_type, css_class, list_class, is_default, status, create_by, create_time, remark, del_flag) 
VALUES
  (1, 1, '男', '0', 'sys_user_sex', '', '', 'Y', '0', 'admin', sysdate(), '性别男', '0'),
  (2, 2, '女', '1', 'sys_user_sex', '', '', 'N', '0', 'admin', sysdate(), '性别女', '0'),
  (3, 3, '未知', '2', 'sys_user_sex', '', '', 'N', '0', 'admin', sysdate(), '性别未知', '0'),
  (4, 1, '显示', '0', 'sys_show_hide', '', 'primary', 'Y', '0', 'admin', sysdate(), '显示菜单', '0'),
  (5, 2, '隐藏', '1', 'sys_show_hide', '', 'danger', 'N', '0', 'admin', sysdate(), '隐藏菜单', '0'),
  (6, 1, '正常', '0', 'sys_normal_disable', '', 'primary', 'Y', '0', 'admin', sysdate(), '正常状态', '0'),
  (7, 2, '停用', '1', 'sys_normal_disable', '', 'danger', 'N', '0', 'admin', sysdate(), '停用状态', '0'),
  (8, 1, '正常', '0', 'sys_job_status', '', 'primary', 'Y', '0', 'admin', sysdate(), '正常状态', '0'),
  (9, 2, '暂停', '1', 'sys_job_status', '', 'danger', 'N', '0', 'admin', sysdate(), '停用状态', '0'),
  (10, 1, '默认', 'DEFAULT', 'sys_job_group', '', '', 'Y', '0', 'admin', sysdate(), '默认分组', '0'),
  (11, 2, '系统', 'SYSTEM', 'sys_job_group', '', '', 'N', '0', 'admin', sysdate(), '系统分组', '0'),
  (12, 1, '是', 'Y', 'sys_yes_no', '', 'primary', 'Y', '0', 'admin', sysdate(), '系统默认是', '0'),
  (13, 2, '否', 'N', 'sys_yes_no', '', 'danger', 'N', '0', 'admin', sysdate(), '系统默认否', '0'),
  (14, 1, '通知', '1', 'sys_notice_type', '', 'warning', 'Y', '0', 'admin', sysdate(), '通知', '0'),
  (15, 2, '公告', '2', 'sys_notice_type', '', 'success', 'N', '0', 'admin', sysdate(), '公告', '0'),
  (16, 1, '正常', '0', 'sys_notice_status', '', 'primary', 'Y', '0', 'admin', sysdate(), '正常状态', '0'),
  (17, 2, '关闭', '1', 'sys_notice_status', '', 'danger', 'N', '0', 'admin', sysdate(), '关闭状态', '0'),
  (18, 99, '其他', '0', 'sys_oper_type', '', 'info', 'N', '0', 'admin', sysdate(), '其他操作', '0'),
  (19, 1, '新增', '1', 'sys_oper_type', '', 'info', 'N', '0', 'admin', sysdate(), '新增操作', '0'),
  (20, 2, '修改', '2', 'sys_oper_type', '', 'info', 'N', '0', 'admin', sysdate(), '修改操作', '0'),
  (21, 3, '删除', '3', 'sys_oper_type', '', 'danger', 'N', '0', 'admin', sysdate(), '删除操作', '0'),
  (22, 4, '授权', '4', 'sys_oper_type', '', 'primary', 'N', '0', 'admin', sysdate(), '授权操作', '0'),
  (23, 5, '导出', '5', 'sys_oper_type', '', 'warning', 'N', '0', 'admin', sysdate(), '导出操作', '0'),
  (24, 6, '导入', '6', 'sys_oper_type', '', 'warning', 'N', '0', 'admin', sysdate(), '导入操作', '0'),
  (25, 7, '强退', '7', 'sys_oper_type', '', 'danger', 'N', '0', 'admin', sysdate(), '强退操作', '0'),
  (26, 8, '生成代码', '8', 'sys_oper_type', '', 'warning', 'N', '0', 'admin', sysdate(), '生成操作', '0'),
  (27, 9, '清空数据', '9', 'sys_oper_type', '', 'danger', 'N', '0', 'admin', sysdate(), '清空操作', '0'),
  (28, 1, '成功', '0', 'sys_common_status', '', 'primary', 'N', '0', 'admin', sysdate(), '正常状态', '0'),
  (29, 2, '失败', '1', 'sys_common_status', '', 'danger', 'N', '0', 'admin', sysdate(), '停用状态', '0');

-- 参数配置数据
INSERT INTO sys_config (config_id, config_name, config_key, config_value, config_type, create_by, create_time, remark, status, del_flag) 
VALUES
  (1, '主框架页-默认皮肤样式名称', 'sys.index.skinName', 'skin-blue', 'Y', 'admin', sysdate(), '蓝色 skin-blue、绿色 skin-green、紫色 skin-purple、红色 skin-red、黄色 skin-yellow', '0', '0'),
  (2, '用户管理-账号初始密码', 'sys.user.initPassword', '123456', 'Y', 'admin', sysdate(), '初始化密码 123456', '0', '0'),
  (3, '主框架页-侧边栏主题', 'sys.index.sideTheme', 'theme-dark', 'Y', 'admin', sysdate(), '深色主题theme-dark，浅色主题theme-light', '0', '0'),
  (4, '账号自助-验证码开关', 'sys.account.captchaEnabled', 'true', 'Y', 'admin', sysdate(), '是否开启验证码功能（true开启，false关闭）', '0', '0'),
  (5, '账号自助-是否开启用户注册功能', 'sys.account.registerUser', 'false', 'Y', 'admin', sysdate(), '是否开启注册用户功能（true开启，false关闭）', '0', '0'),
  (6, '用户登录-黑名单列表', 'sys.login.blackIPList', '', 'Y', 'admin', sysdate(), '设置登录IP黑名单限制，多个匹配项以;分隔，支持匹配（*通配、网段）', '0', '0');

-- 定时任务数据
INSERT INTO sys_job (job_id, job_name, job_group, invoke_target, cron_expression, misfire_policy, concurrent, status, create_by, create_time, remark) 
VALUES
  (1, '系统默认（无参）', 'DEFAULT', 'ryTask.ryNoParams', '0/10 * * * * ?', '3', '1', '1', 'admin', sysdate(), ''),
  (2, '系统默认（有参）', 'DEFAULT', 'ryTask.ryParams(\'ry\')', '0/15 * * * * ?', '3', '1', '1', 'admin', sysdate(), ''),
  (3, '系统默认（多参）', 'DEFAULT', 'ryTask.ryMultipleParams(\'ry\', true, 2000L, 316.50D, 100)', '0/20 * * * * ?', '3', '1', '1', 'admin', sysdate(), '');

-- 通知公告数据
INSERT INTO sys_notice (notice_id, notice_title, notice_type, notice_content, status, create_by, create_time, remark, del_flag) 
VALUES
  ('1', '温馨提醒：2018-07-01 nest-admin新版本发布啦', '2', '新版本内容', '0', 'admin', sysdate(), '管理员', '0'),
  ('2', '维护通知：2018-07-01 nest-admin系统凌晨维护', '1', '维护内容', '0', 'admin', sysdate(), '管理员', '0'); 