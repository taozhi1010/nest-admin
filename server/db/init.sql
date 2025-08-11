-- 初始化数据库
-- phpMyAdmin SQL Dump
-- version 5.0.4
-- https://www.phpmyadmin.net/
--
-- 主机： localhost
-- 生成日期： 2025-08-11 15:28:36
-- 服务器版本： 8.0.36
-- PHP 版本： 7.4.33

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- 数据库： `nest-admin-vben`
--

-- --------------------------------------------------------

--
-- 表的结构 `gen_table`
--

CREATE TABLE `gen_table` (
  `table_id` int NOT NULL COMMENT '编号',
  `table_name` varchar(200) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '表名称',
  `table_comment` varchar(500) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '表描述',
  `sub_table_name` varchar(64) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '关联子表的表名',
  `sub_table_fk_name` varchar(64) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '子表关联的外键名',
  `class_name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '实体类名称',
  `tpl_category` varchar(200) COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'crud' COMMENT '使用的模板（crud单表操作 tree树表操作）',
  `tpl_web_type` varchar(30) COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'element-plus' COMMENT '前端模板类型（element-ui模版 element-plus模版）',
  `package_name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL COMMENT '生成包路径',
  `module_name` varchar(30) COLLATE utf8mb4_general_ci NOT NULL COMMENT '生成模块名',
  `business_name` varchar(30) COLLATE utf8mb4_general_ci NOT NULL COMMENT '生成业务名',
  `function_name` varchar(50) COLLATE utf8mb4_general_ci NOT NULL COMMENT '生成功能名',
  `function_author` varchar(50) COLLATE utf8mb4_general_ci NOT NULL COMMENT '生成功能作者',
  `gen_type` char(1) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '0' COMMENT '生成代码方式（0zip压缩包 1自定义路径）',
  `gen_path` varchar(200) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '/' COMMENT '生成路径（不填默认项目路径）',
  `options` varchar(1000) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '其它生成选项',
  `parent_menu_id` int NOT NULL DEFAULT '0' COMMENT '上级菜单Id',
  `status` char(1) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '0' COMMENT '状态（0正常 1关闭）',
  `create_by` varchar(64) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '创建者',
  `create_time` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `update_by` varchar(64) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '更新者',
  `update_time` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  `remark` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '备注',
  `del_flag` char(1) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '0' COMMENT '删除标志'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='代码生成业务表';

-- --------------------------------------------------------

--
-- 表的结构 `gen_table_column`
--

CREATE TABLE `gen_table_column` (
  `column_id` int NOT NULL COMMENT '编号',
  `table_id` int NOT NULL COMMENT '归属表编号',
  `column_name` varchar(200) COLLATE utf8mb4_general_ci NOT NULL COMMENT '列名称',
  `column_comment` varchar(500) COLLATE utf8mb4_general_ci NOT NULL COMMENT '列描述',
  `column_type` varchar(100) COLLATE utf8mb4_general_ci NOT NULL COMMENT '列类型',
  `java_type` varchar(500) COLLATE utf8mb4_general_ci NOT NULL COMMENT 'JAVA类型',
  `java_field` varchar(200) COLLATE utf8mb4_general_ci NOT NULL COMMENT 'JAVA字段名',
  `is_pk` char(1) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '0' COMMENT '是否主键（1是）',
  `is_increment` char(1) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '0' COMMENT '是否自增（1是）',
  `is_required` char(1) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '0' COMMENT '是否必填（1是）',
  `is_insert` char(1) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '0' COMMENT '是否为插入字段（1是）',
  `is_edit` char(1) COLLATE utf8mb4_general_ci DEFAULT '0' COMMENT '是否编辑字段（1是）',
  `is_list` char(1) COLLATE utf8mb4_general_ci DEFAULT '0' COMMENT '是否列表字段（1是）',
  `is_query` char(1) COLLATE utf8mb4_general_ci DEFAULT '1' COMMENT '是否查询字段（1是）',
  `query_type` varchar(200) COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'EQ' COMMENT '查询方式（等于、不等于、大于、小于、范围）',
  `html_type` varchar(200) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '显示类型（文本框、文本域、下拉框、复选框、单选框、日期控件）',
  `dict_type` varchar(200) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '字典类型',
  `sort` int NOT NULL COMMENT '排序',
  `status` char(1) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '0' COMMENT '状态（0正常 1关闭）',
  `create_by` varchar(64) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '创建者',
  `create_time` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `update_by` varchar(64) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '更新者',
  `update_time` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  `remark` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '备注',
  `del_flag` char(1) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '0' COMMENT '删除标志'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='代码生成业务表字段';

-- --------------------------------------------------------

--
-- 表的结构 `sys_config`
--

CREATE TABLE `sys_config` (
  `config_id` int NOT NULL COMMENT '参数主键',
  `config_name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '参数名称',
  `config_key` varchar(100) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '参数键名',
  `config_value` varchar(500) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '参数键值',
  `config_type` char(1) COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'N' COMMENT '系统内置',
  `status` char(1) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '0' COMMENT '状态（0正常 1停用）',
  `create_by` varchar(64) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '创建者',
  `create_time` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `update_by` varchar(64) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '更新者',
  `update_time` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  `remark` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '备注',
  `del_flag` char(1) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '0' COMMENT '删除标志'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='参数配置表';

--
-- 转存表中的数据 `sys_config`
--

INSERT INTO `sys_config` (`config_id`, `config_name`, `config_key`, `config_value`, `config_type`, `status`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`, `del_flag`) VALUES
(1, '主框架页-默认皮肤样式名称', 'sys.index.skinName', 'skin-blue', 'Y', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.605623', '蓝色 skin-blue、绿色 skin-green、紫色 skin-purple、红色 skin-red、黄色 skin-yellow', '0'),
(2, '用户管理-账号初始密码', 'sys.user.initPassword', '123456', 'Y', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.605623', '初始化密码 123456', '0'),
(3, '主框架页-侧边栏主题', 'sys.index.sideTheme', 'theme-dark', 'Y', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.605623', '深色主题theme-dark，浅色主题theme-light', '0'),
(4, '账号自助-验证码开关', 'sys.account.captchaEnabled', 'true', 'Y', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.605623', '是否开启验证码功能（true开启，false关闭）', '0'),
(5, '账号自助-是否开启用户注册功能', 'sys.account.registerUser', 'false', 'Y', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.605623', '是否开启注册用户功能（true开启，false关闭）', '0'),
(6, '用户登录-黑名单列表', 'sys.login.blackIPList', '', 'Y', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.605623', '设置登录IP黑名单限制，多个匹配项以;分隔，支持匹配（*通配、网段）', '0');

-- --------------------------------------------------------

--
-- 表的结构 `sys_dept`
--

CREATE TABLE `sys_dept` (
  `dept_id` int NOT NULL COMMENT '部门ID',
  `parent_id` int NOT NULL DEFAULT '0' COMMENT '父部门ID',
  `ancestors` varchar(50) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '0' COMMENT '祖级列表',
  `dept_name` varchar(30) COLLATE utf8mb4_general_ci NOT NULL COMMENT '部门名称',
  `order_num` int NOT NULL DEFAULT '0' COMMENT '显示顺序',
  `leader` varchar(20) COLLATE utf8mb4_general_ci NOT NULL COMMENT '负责人',
  `phone` varchar(11) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '联系电话',
  `email` varchar(50) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '邮箱',
  `status` char(1) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '0' COMMENT '部门状态（0正常 1停用）',
  `create_by` varchar(64) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '创建者',
  `create_time` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `update_by` varchar(64) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '更新者',
  `update_time` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  `remark` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '备注',
  `del_flag` char(1) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '0' COMMENT '删除标志'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='部门表';

--
-- 转存表中的数据 `sys_dept`
--

INSERT INTO `sys_dept` (`dept_id`, `parent_id`, `ancestors`, `dept_name`, `order_num`, `leader`, `phone`, `email`, `status`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`, `del_flag`) VALUES
(100, 0, '0', 'nest-admin科技', 0, 'nest-admin', '15888888888', 'ry@qq.com', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.387265', NULL, '0'),
(101, 100, '0,100', '深圳总公司', 1, 'nest-admin', '15888888888', 'ry@qq.com', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.387265', NULL, '0'),
(102, 100, '0,100', '长沙分公司', 2, 'nest-admin', '15888888888', 'ry@qq.com', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.387265', NULL, '0'),
(103, 101, '0,100,101', '研发部门', 1, '后端开发', '15888888888', 'ry@qq.com', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 13:38:25.000000', NULL, '0'),
(104, 101, '0,100,101', '市场部门', 2, 'nest-admin', '15888888888', 'ry@qq.com', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.387265', NULL, '0'),
(105, 101, '0,100,101', '测试部门', 3, 'nest-admin', '15888888888', 'ry@qq.com', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.387265', NULL, '0'),
(106, 101, '0,100,101', '财务部门', 4, 'nest-admin', '15888888888', 'ry@qq.com', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.387265', NULL, '0'),
(107, 101, '0,100,101', '运维部门', 5, 'nest-admin', '15888888888', 'ry@qq.com', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.387265', NULL, '0'),
(108, 102, '0,100,102', '市场部门', 1, 'nest-admin', '15888888888', 'ry@qq.com', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.387265', NULL, '0'),
(109, 102, '0,100,102', '财务部门', 2, 'nest-admin', '15888888888', 'ry@qq.com', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.387265', NULL, '0'),
(110, 101, '0,100,101', '人事部门', 6, 'nest-admin', '15888888888', 'hr@qq.com', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.654330', NULL, '0'),
(111, 101, '0,100,101', '采购部门', 7, 'nest-admin', '15888888888', 'purchase@qq.com', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.654330', NULL, '0'),
(112, 102, '0,100,102', '技术部门', 3, 'nest-admin', '15888888888', 'tech@qq.com', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.654330', NULL, '0');

-- --------------------------------------------------------

--
-- 表的结构 `sys_dict_data`
--

CREATE TABLE `sys_dict_data` (
  `dict_code` int NOT NULL COMMENT '字典主键',
  `dict_sort` int NOT NULL DEFAULT '0' COMMENT '字典排序',
  `dict_label` varchar(100) COLLATE utf8mb4_general_ci NOT NULL COMMENT '字典标签',
  `dict_value` varchar(100) COLLATE utf8mb4_general_ci NOT NULL COMMENT '字典键值',
  `dict_type` varchar(100) COLLATE utf8mb4_general_ci NOT NULL COMMENT '字典类型',
  `css_class` varchar(100) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '样式属性',
  `list_class` varchar(100) COLLATE utf8mb4_general_ci NOT NULL COMMENT '表格回显样式',
  `is_default` char(1) COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'N' COMMENT '是否默认',
  `status` char(1) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '0' COMMENT '状态（0正常 1停用）',
  `create_by` varchar(64) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '创建者',
  `create_time` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `update_by` varchar(64) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '更新者',
  `update_time` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  `remark` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '备注',
  `del_flag` char(1) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '0' COMMENT '删除标志'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='字典数据表';

--
-- 转存表中的数据 `sys_dict_data`
--

INSERT INTO `sys_dict_data` (`dict_code`, `dict_sort`, `dict_label`, `dict_value`, `dict_type`, `css_class`, `list_class`, `is_default`, `status`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`, `del_flag`) VALUES
(1, 1, '男', '0', 'sys_user_sex', '', '', 'Y', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.604991', '性别男', '0'),
(2, 2, '女', '1', 'sys_user_sex', '', '', 'N', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.604991', '性别女', '0'),
(3, 3, '未知', '2', 'sys_user_sex', '', '', 'N', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.604991', '性别未知', '0'),
(4, 1, '显示', '0', 'sys_show_hide', '', 'primary', 'Y', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.604991', '显示菜单', '0'),
(5, 2, '隐藏', '1', 'sys_show_hide', '', 'danger', 'N', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.604991', '隐藏菜单', '0'),
(6, 1, '正常', '0', 'sys_normal_disable', '', 'primary', 'Y', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.604991', '正常状态', '0'),
(7, 2, '停用', '1', 'sys_normal_disable', '', 'danger', 'N', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.604991', '停用状态', '0'),
(8, 1, '正常', '0', 'sys_job_status', '', 'primary', 'Y', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.604991', '正常状态', '0'),
(9, 2, '暂停', '1', 'sys_job_status', '', 'danger', 'N', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.604991', '停用状态', '0'),
(10, 1, '默认', 'DEFAULT', 'sys_job_group', '', '', 'Y', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.604991', '默认分组', '0'),
(11, 2, '系统', 'SYSTEM', 'sys_job_group', '', '', 'N', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.604991', '系统分组', '0'),
(12, 1, '是', 'Y', 'sys_yes_no', '', 'primary', 'Y', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.604991', '系统默认是', '0'),
(13, 2, '否', 'N', 'sys_yes_no', '', 'danger', 'N', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.604991', '系统默认否', '0'),
(14, 1, '通知', '1', 'sys_notice_type', '', 'warning', 'Y', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.604991', '通知', '0'),
(15, 2, '公告', '2', 'sys_notice_type', '', 'success', 'N', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.604991', '公告', '0'),
(16, 1, '正常', '0', 'sys_notice_status', '', 'primary', 'Y', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.604991', '正常状态', '0'),
(17, 2, '关闭', '1', 'sys_notice_status', '', 'danger', 'N', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.604991', '关闭状态', '0'),
(18, 99, '其他', '0', 'sys_oper_type', '', 'info', 'N', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.604991', '其他操作', '0'),
(19, 1, '新增', '1', 'sys_oper_type', '', 'info', 'N', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.604991', '新增操作', '0'),
(20, 2, '修改', '2', 'sys_oper_type', '', 'info', 'N', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.604991', '修改操作', '0'),
(21, 3, '删除', '3', 'sys_oper_type', '', 'danger', 'N', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.604991', '删除操作', '0'),
(22, 4, '授权', '4', 'sys_oper_type', '', 'primary', 'N', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.604991', '授权操作', '0'),
(23, 5, '导出', '5', 'sys_oper_type', '', 'warning', 'N', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.604991', '导出操作', '0'),
(24, 6, '导入', '6', 'sys_oper_type', '', 'warning', 'N', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.604991', '导入操作', '0'),
(25, 7, '强退', '7', 'sys_oper_type', '', 'danger', 'N', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.604991', '强退操作', '0'),
(26, 8, '生成代码', '8', 'sys_oper_type', '', 'warning', 'N', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.604991', '生成操作', '0'),
(27, 9, '清空数据', '9', 'sys_oper_type', '', 'danger', 'N', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.604991', '清空操作', '0'),
(28, 1, '成功', '0', 'sys_common_status', '', 'primary', 'N', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.604991', '正常状态', '0'),
(29, 2, '失败', '1', 'sys_common_status', '', 'danger', 'N', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.604991', '停用状态', '0');

-- --------------------------------------------------------

--
-- 表的结构 `sys_dict_type`
--

CREATE TABLE `sys_dict_type` (
  `dict_id` int NOT NULL COMMENT '字典主键',
  `dict_name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL COMMENT '字典名称',
  `dict_type` varchar(100) COLLATE utf8mb4_general_ci NOT NULL COMMENT '字典类型',
  `status` char(1) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '0' COMMENT '状态（0正常 1停用）',
  `create_by` varchar(64) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '创建者',
  `create_time` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `update_by` varchar(64) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '更新者',
  `update_time` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  `remark` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '备注',
  `del_flag` char(1) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '0' COMMENT '删除标志'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='字典类型表';

--
-- 转存表中的数据 `sys_dict_type`
--

INSERT INTO `sys_dict_type` (`dict_id`, `dict_name`, `dict_type`, `status`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`, `del_flag`) VALUES
(1, '用户性别', 'sys_user_sex', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.602359', '用户性别列表', '0'),
(2, '菜单状态', 'sys_show_hide', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.602359', '菜单状态列表', '0'),
(3, '系统开关', 'sys_normal_disable', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.602359', '系统开关列表', '0'),
(4, '任务状态', 'sys_job_status', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.602359', '任务状态列表', '0'),
(5, '任务分组', 'sys_job_group', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.602359', '任务分组列表', '0'),
(6, '系统是否', 'sys_yes_no', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.602359', '系统是否列表', '0'),
(7, '通知类型', 'sys_notice_type', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.602359', '通知类型列表', '0'),
(8, '通知状态', 'sys_notice_status', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.602359', '通知状态列表', '0'),
(9, '操作类型', 'sys_oper_type', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.602359', '操作类型列表', '0'),
(10, '系统状态', 'sys_common_status', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.602359', '登录状态列表', '0');

-- --------------------------------------------------------

--
-- 表的结构 `sys_job`
--

CREATE TABLE `sys_job` (
  `job_id` int NOT NULL COMMENT '任务ID',
  `job_name` varchar(64) COLLATE utf8mb4_general_ci NOT NULL COMMENT '任务名称',
  `job_group` varchar(64) COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'DEFAULT' COMMENT '任务组名',
  `invoke_target` varchar(500) COLLATE utf8mb4_general_ci NOT NULL COMMENT '调用目标字符串',
  `cron_expression` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'cron执行表达式',
  `misfire_policy` varchar(20) COLLATE utf8mb4_general_ci DEFAULT '3' COMMENT '计划执行错误策略（1立即执行 2执行一次 3放弃执行）',
  `concurrent` char(1) COLLATE utf8mb4_general_ci DEFAULT '1' COMMENT '是否并发执行（0允许 1禁止）',
  `status` char(1) COLLATE utf8mb4_general_ci DEFAULT '0' COMMENT '状态（0正常 1暂停）',
  `create_by` varchar(64) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '创建者',
  `create_time` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `update_by` varchar(64) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '更新者',
  `update_time` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  `remark` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '备注',
  `del_flag` char(1) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '0' COMMENT '删除标志'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='定时任务表';

--
-- 转存表中的数据 `sys_job`
--

INSERT INTO `sys_job` (`job_id`, `job_name`, `job_group`, `invoke_target`, `cron_expression`, `misfire_policy`, `concurrent`, `status`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`, `del_flag`) VALUES
(1, '系统默认（无参）', 'DEFAULT', 'task.noParams', '0/10 * * * * ?', '3', '1', '1', 'admin', '2025-08-10 07:48:16.000000', 'admin', '2025-08-11 06:38:12.000000', '', '0'),
(2, '系统默认（有参）', 'DEFAULT', 'task.params(\'ry\')', '0/15 * * * * ?', '3', '1', '1', 'admin', '2025-08-10 07:48:16.000000', 'admin', '2025-08-11 06:38:31.000000', '', '0'),
(3, '系统默认（多参）', 'DEFAULT', 'task.multipleParams(\'ry\', true, 2000, 316.50, 100)', '0/20 * * * * ?', '3', '1', '1', 'admin', '2025-08-10 07:48:16.000000', 'admin', '2025-08-11 07:24:16.000000', '', '0');

-- --------------------------------------------------------

--
-- 表的结构 `sys_job_log`
--

CREATE TABLE `sys_job_log` (
  `job_log_id` int NOT NULL COMMENT '任务日志ID',
  `job_name` varchar(64) COLLATE utf8mb4_general_ci NOT NULL COMMENT '任务名称',
  `job_group` varchar(64) COLLATE utf8mb4_general_ci NOT NULL COMMENT '任务组名',
  `invoke_target` varchar(500) COLLATE utf8mb4_general_ci NOT NULL COMMENT '调用目标字符串',
  `job_message` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '日志信息',
  `status` char(1) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '0' COMMENT '执行状态（0正常 1失败）',
  `exception_info` varchar(2000) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '异常信息',
  `create_by` varchar(64) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '创建者',
  `create_time` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `update_by` varchar(64) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '更新者',
  `update_time` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  `remark` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '备注',
  `del_flag` char(1) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '0' COMMENT '删除标志'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 转存表中的数据 `sys_job_log`
--

INSERT INTO `sys_job_log` (`job_log_id`, `job_name`, `job_group`, `invoke_target`, `job_message`, `status`, `exception_info`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`, `del_flag`) VALUES
(1, '系统默认（无参）', 'DEFAULT', 'ryTask.ryNoParams', '执行失败，耗时 1ms', '1', '任务 ryTask.ryNoParams 不存在', '', '2025-08-11 06:35:06.000000', '', '2025-08-11 06:35:08.183002', NULL, '0'),
(2, '系统默认（无参）', 'DEFAULT', 'task.noParams', '执行失败，耗时 0ms', '1', '任务 task.noParams 不存在', '', '2025-08-11 06:38:47.000000', '', '2025-08-11 06:38:49.145255', NULL, '0'),
(3, '系统默认（无参）', 'DEFAULT', 'task.noParams', '执行成功，耗时 0ms', '0', '', '', '2025-08-11 06:43:04.000000', '', '2025-08-11 06:43:06.313828', NULL, '0'),
(4, '系统默认（多参）', 'DEFAULT', 'task.multipleParams(\'ry\', true, 2000L, 316.50D, 100)', '执行失败，耗时 0ms', '1', '任务 task.multipleParams 不存在', '', '2025-08-11 06:43:27.000000', '', '2025-08-11 06:43:28.713991', NULL, '0'),
(5, '系统默认（多参）', 'DEFAULT', 'task.multipleParams(\'ry\', true, 2000L, 316.50D, 100)', '执行失败，耗时 1ms', '1', '任务 task.multipleParams 不存在', '', '2025-08-11 06:52:50.000000', '', '2025-08-11 06:52:51.980204', NULL, '0'),
(6, '系统默认（多参）', 'DEFAULT', 'task.multipleParams(\'ry\', true, 2000L, 316.50D, 100)', '执行成功，耗时 1ms', '0', '', '', '2025-08-11 06:53:51.000000', '', '2025-08-11 06:53:53.006533', NULL, '0'),
(7, '系统默认（有参）', 'DEFAULT', 'task.params(\'ry\')', '执行成功，耗时 0ms', '0', '', '', '2025-08-11 06:55:21.000000', '', '2025-08-11 06:55:23.041982', NULL, '0'),
(8, '系统默认（多参）', 'DEFAULT', 'task.multipleParams(\'ry\', true, 2000L, 316.50D, 100)', '执行成功，耗时 1ms', '0', '', '', '2025-08-11 06:55:40.000000', '', '2025-08-11 06:55:41.688420', NULL, '0'),
(9, '系统默认（多参）', 'DEFAULT', 'task.multipleParams(\'ry\', true, 2000L, 316.50D, 100)', '执行成功，耗时 0ms', '0', '', '', '2025-08-11 06:56:23.000000', '', '2025-08-11 06:56:25.212635', NULL, '0'),
(10, '系统默认（多参）', 'DEFAULT', 'task.multipleParams(\'ry\', true, 2000L, 316.50D, 100)', '执行成功，耗时 1ms', '0', '', '', '2025-08-11 06:56:46.000000', '', '2025-08-11 06:56:47.795892', NULL, '0'),
(11, '系统默认（多参）', 'DEFAULT', 'task.multipleParams(\'ry\', true, 2000L, 316.50D, 100)', '执行失败，耗时 1ms', '1', '任务 task.multipleParams(\'ry\', true, 2000L, 316.50D, 100) 不存在', '', '2025-08-11 06:58:20.000000', '', '2025-08-11 06:58:22.312026', NULL, '0'),
(12, '系统默认（多参）', 'DEFAULT', 'task.multipleParams(\'ry\', true, 2000L, 316.50D, 100)', '执行失败，耗时 0ms', '1', '任务 task.multipleParams(\'ry\', true, 2000L, 316.50D, 100) 不存在', '', '2025-08-11 06:58:34.000000', '', '2025-08-11 06:58:35.716845', NULL, '0'),
(13, '系统默认（无参）', 'DEFAULT', 'task.noParams', '执行成功，耗时 2ms', '0', '', '', '2025-08-11 06:59:25.000000', '', '2025-08-11 06:59:27.434036', NULL, '0'),
(14, '系统默认（多参）', 'DEFAULT', 'task.multipleParams(\'ry\', true, 2000L, 316.50D, 100)', '执行失败，耗时 1ms', '1', '任务 task.multipleParams(\'ry\', true, 2000L, 316.50D, 100) 不存在', '', '2025-08-11 06:59:38.000000', '', '2025-08-11 06:59:39.664453', NULL, '0'),
(15, '系统默认（多参）', 'DEFAULT', 'task.multipleParams(\'ry\', true, 2000L, 316.50D, 100)', '执行成功，耗时 2ms', '0', '', '', '2025-08-11 07:01:01.000000', '', '2025-08-11 07:01:02.843357', NULL, '0'),
(16, '系统默认（多参）', 'DEFAULT', 'task.multipleParams(\'ry\', true, 2000L, 316.50D, 100)', '执行成功，耗时 1ms', '0', '', '', '2025-08-11 07:01:51.000000', '', '2025-08-11 07:01:52.688378', NULL, '0'),
(17, '系统默认（有参）', 'DEFAULT', 'task.params(\'ry\')', '执行成功，耗时 1ms', '0', '', '', '2025-08-11 07:02:06.000000', '', '2025-08-11 07:02:08.013733', NULL, '0'),
(18, '系统默认（多参）', 'DEFAULT', 'task.multipleParams(\'ry\', true, 2000L, 316.50D, 100)', '执行成功，耗时 0ms', '0', '', '', '2025-08-11 07:02:10.000000', '', '2025-08-11 07:02:11.538888', NULL, '0'),
(19, '系统默认（有参）', 'DEFAULT', 'task.params(\'ry\')', '执行成功，耗时 1ms', '0', '', '', '2025-08-11 07:02:22.000000', '', '2025-08-11 07:02:23.737922', NULL, '0'),
(20, '系统默认（多参）', 'DEFAULT', 'task.multipleParams(\'ry\', true, 2000L, 316.50D, 100)', '执行成功，耗时 1ms', '0', '', '', '2025-08-11 07:02:43.000000', '', '2025-08-11 07:02:44.955641', NULL, '0'),
(21, '系统默认（多参）', 'DEFAULT', 'task.multipleParams(\'ry\', true, 2000L, 316.50D, 100)', '执行成功，耗时 1ms', '0', '', '', '2025-08-11 07:03:37.000000', '', '2025-08-11 07:03:38.567339', NULL, '0'),
(22, '系统默认（多参）', 'DEFAULT', 'task.multipleParams(\'ry\', true, 2000L, 316.50D, 100)', '执行成功，耗时 1ms', '0', '', '', '2025-08-11 07:04:36.000000', '', '2025-08-11 07:04:37.546110', NULL, '0'),
(23, '系统默认（多参）', 'DEFAULT', 'task.multipleParams(\'ry\', true, 2000L, 316.50D, 100)', '执行成功，耗时 1ms', '0', '', '', '2025-08-11 07:05:01.000000', '', '2025-08-11 07:05:03.514788', NULL, '0'),
(24, '系统默认（有参）', 'DEFAULT', 'task.params(\'ry\')', '执行失败，耗时 0ms', '1', '任务 task.params 不存在', '', '2025-08-11 07:13:56.000000', '', '2025-08-11 07:13:58.267660', NULL, '0'),
(25, '系统默认（多参）', 'DEFAULT', 'task.multipleParams(\'ry\', true, 2000L, 316.50D, 100)', '执行成功，耗时 1ms', '0', '', '', '2025-08-11 07:14:54.000000', '', '2025-08-11 07:14:55.968073', NULL, '0'),
(26, '系统默认（有参）', 'DEFAULT', 'task.params(\'ry\')', '执行成功，耗时 1ms', '0', '', '', '2025-08-11 07:14:57.000000', '', '2025-08-11 07:14:59.046209', NULL, '0'),
(27, '系统默认（无参）', 'DEFAULT', 'task.noParams', '执行成功，耗时 0ms', '0', '', '', '2025-08-11 07:15:00.000000', '', '2025-08-11 07:15:02.323876', NULL, '0'),
(28, '系统默认（多参）', 'DEFAULT', 'task.multipleParams(\'ry\', true, 2000L, 316.50D, 100)', '执行成功，耗时 1ms', '0', '', '', '2025-08-11 07:16:55.000000', '', '2025-08-11 07:16:56.862074', NULL, '0'),
(29, '系统默认（有参）', 'DEFAULT', 'task.params(\'ry\')', '执行成功，耗时 1ms', '0', '', '', '2025-08-11 07:17:55.000000', '', '2025-08-11 07:17:57.111020', NULL, '0'),
(30, '系统默认（多参）', 'DEFAULT', 'task.multipleParams(\'ry\', true, 2000L, 316.50D, 100)', '执行成功，耗时 1ms', '0', '', '', '2025-08-11 07:18:35.000000', '', '2025-08-11 07:18:37.509563', NULL, '0'),
(31, '系统默认（多参）', 'DEFAULT', 'task.multipleParams(\'ry\', true, 2000L, 316.50D, 100)', '执行成功，耗时 1ms', '0', '', '', '2025-08-11 07:19:26.000000', '', '2025-08-11 07:19:28.153299', NULL, '0'),
(32, '系统默认（多参）', 'DEFAULT', 'task.multipleParams(\'ry\', true, 2000L, 316.50D, 100)', '执行成功，耗时 1ms', '0', '', '', '2025-08-11 07:19:43.000000', '', '2025-08-11 07:19:45.294978', NULL, '0'),
(33, '系统默认（多参）', 'DEFAULT', 'task.multipleParams(\'ry\', true, 2000L, 316.50D, 100)', '执行成功，耗时 1ms', '0', '', '', '2025-08-11 07:20:06.000000', '', '2025-08-11 07:20:07.885490', NULL, '0'),
(34, '系统默认（多参）', 'DEFAULT', 'task.multipleParams(\'ry\', true, 2000L, 316.50D, 100)', '执行成功，耗时 0ms', '0', '', '', '2025-08-11 07:21:22.000000', '', '2025-08-11 07:21:23.575965', NULL, '0'),
(35, '系统默认（多参）', 'DEFAULT', 'task.multipleParams(\'ry\', true, 2000L, 316.50D, 100)', '执行成功，耗时 0ms', '0', '', '', '2025-08-11 07:22:50.000000', '', '2025-08-11 07:22:52.052152', NULL, '0'),
(36, '系统默认（有参）', 'DEFAULT', 'task.params(\'ry\')', '执行成功，耗时 1ms', '0', '', '', '2025-08-11 07:22:53.000000', '', '2025-08-11 07:22:55.334218', NULL, '0'),
(37, '系统默认（多参）', 'DEFAULT', 'task.multipleParams(\'ry\', true, 2000, 316.50, 100)', '执行成功，耗时 0ms', '0', '', '', '2025-08-11 07:24:23.000000', '', '2025-08-11 07:24:24.605248', NULL, '0'),
(38, '系统默认（多参）', 'DEFAULT', 'task.multipleParams(\'ry\', true, 2000, 316.50, 100)', '执行成功，耗时 1ms', '0', '', '', '2025-08-11 07:24:40.000000', '', '2025-08-11 07:24:42.370861', NULL, '0');

-- --------------------------------------------------------

--
-- 表的结构 `sys_logininfor`
--

CREATE TABLE `sys_logininfor` (
  `info_id` int NOT NULL COMMENT '访问ID',
  `user_name` varchar(50) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '用户账号',
  `ipaddr` varchar(128) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '登录IP地址',
  `login_location` varchar(255) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '登录地点',
  `browser` varchar(50) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '浏览器类型',
  `os` varchar(50) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '操作系统',
  `login_time` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '访问时间',
  `message` varchar(255) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '提示消息',
  `status` char(1) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '0' COMMENT '登录状态（0成功 1失败）',
  `create_by` varchar(64) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '创建者',
  `create_time` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `update_by` varchar(64) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '更新者',
  `update_time` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  `remark` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '备注',
  `del_flag` char(1) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '0' COMMENT '删除标志'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='系统访问记录';

--
-- 转存表中的数据 `sys_logininfor`
--

INSERT INTO `sys_logininfor` (`info_id`, `user_name`, `ipaddr`, `login_location`, `browser`, `os`, `login_time`, `message`, `status`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`, `del_flag`) VALUES
(1, 'admin', '127.0.0.1', ' 本机地址', 'Chrome', 'Windows', '2025-08-10 07:55:56.689349', '登录成功', '0', '', '2025-08-10 07:55:56.689349', '', '2025-08-10 07:55:57.000000', NULL, '0'),
(2, 'admin', '127.0.0.1', ' 本机地址', 'Edge', 'Windows', '2025-08-11 02:19:58.030944', '登录成功', '0', '', '2025-08-11 02:19:58.030944', '', '2025-08-11 02:19:58.000000', NULL, '0');

-- --------------------------------------------------------

--
-- 表的结构 `sys_menu`
--

CREATE TABLE `sys_menu` (
  `menu_id` int NOT NULL COMMENT '菜单ID',
  `menu_name` varchar(50) COLLATE utf8mb4_general_ci NOT NULL COMMENT '菜单名称',
  `parent_id` int NOT NULL COMMENT '父菜单ID',
  `order_num` int NOT NULL DEFAULT '0' COMMENT '显示顺序',
  `path` varchar(200) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '路由地址',
  `component` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '组件路径',
  `query` varchar(255) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '路由参数',
  `is_frame` char(1) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '1' COMMENT '是否为外链',
  `is_cache` char(1) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '0' COMMENT '是否缓存',
  `visible` char(1) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '0' COMMENT '是否显示',
  `menu_type` char(1) COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'M' COMMENT '菜单类型',
  `perms` varchar(100) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '权限标识',
  `icon` varchar(100) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '菜单图标',
  `status` char(1) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '0' COMMENT '菜单状态（0正常 1停用）',
  `create_by` varchar(64) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '创建者',
  `create_time` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `update_by` varchar(64) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '更新者',
  `update_time` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  `remark` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '备注',
  `del_flag` char(1) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '0' COMMENT '删除标志'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='菜单权限表';

--
-- 转存表中的数据 `sys_menu`
--

INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query`, `is_frame`, `is_cache`, `visible`, `menu_type`, `perms`, `icon`, `status`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`, `del_flag`) VALUES
(1, '系统管理', 0, 1, 'system', '', '', '1', '0', '0', 'M', '', 'eos-icons:system-group', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-11 02:59:21.000000', '系统管理目录', '0'),
(2, '系统监控', 0, 2, 'monitor', '', '', '1', '0', '0', 'M', '', 'eos-icons:monitoring', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-11 03:06:15.000000', '系统监控目录', '0'),
(3, '系统工具', 0, 3, 'tool', '', '', '1', '0', '0', 'M', '', 'tabler:tool', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-11 03:14:31.000000', '系统工具目录', '0'),
(4, 'nest-admin官网', 0, 4, 'https://nest-admin.dooring.vip', NULL, '', '0', '0', '0', 'M', '', 'guide', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.451768', 'nest-admin官网地址', '0'),
(100, '用户管理', 1, 1, 'user', 'system/user/index', '', '1', '0', '0', 'C', 'system:user:list', 'ph:user-fill', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-11 03:00:17.000000', '用户管理菜单', '0'),
(101, '角色管理', 1, 2, 'role', 'system/role/index', '', '1', '0', '0', 'C', 'system:role:list', 'carbon:user-role', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-11 03:09:59.000000', '角色管理菜单', '0'),
(102, '菜单管理', 1, 3, 'menu', 'system/menu/index', '', '1', '0', '0', 'C', 'system:menu:list', 'typcn:th-menu-outline', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-11 03:00:32.000000', '菜单管理菜单', '0'),
(103, '部门管理', 1, 4, 'dept', 'system/dept/index', '', '1', '0', '0', 'C', 'system:dept:list', 'mdi:company', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-11 03:00:48.000000', '部门管理菜单', '0'),
(104, '岗位管理', 1, 5, 'post', 'system/post/index', '', '1', '0', '0', 'C', 'system:post:list', 'material-symbols:post', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-11 03:09:12.000000', '岗位管理菜单', '0'),
(105, '字典管理', 1, 6, 'dict', 'system/dict/index', '', '1', '0', '0', 'C', 'system:dict:list', 'material-symbols:dictionary', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-11 03:22:14.000000', '字典管理菜单', '0'),
(106, '参数设置', 1, 7, 'config', 'system/config/index', '', '1', '0', '0', 'C', 'system:config:list', 'tdesign:system-code', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-11 03:01:26.000000', '参数设置菜单', '0'),
(107, '通知公告', 1, 8, 'notice', 'system/notice/index', '', '1', '0', '0', 'C', 'system:notice:list', 'icon-park-solid:volume-notice', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-11 03:01:40.000000', '通知公告菜单', '0'),
(108, '日志管理', 1, 9, 'log', '', '', '1', '0', '0', 'M', '', 'icon-park-solid:log', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-11 03:01:56.000000', '日志管理菜单', '0'),
(109, '在线用户', 2, 1, 'online', 'monitor/online/index', '', '1', '0', '0', 'C', 'monitor:online:list', 'oui:online', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-11 03:03:53.000000', '在线用户菜单', '0'),
(110, '定时任务', 2, 2, 'job', 'monitor/job/index', '', '1', '0', '0', 'C', 'monitor:job:list', 'tdesign:task-time', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-11 03:07:22.000000', '定时任务菜单', '0'),
(112, '服务监控', 2, 4, 'server', 'monitor/server/index', '', '1', '0', '0', 'C', 'monitor:server:list', 'streamline:online-medical-service-monitor', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-11 03:11:25.000000', '服务监控菜单', '0'),
(113, '缓存监控', 2, 5, 'cache', 'monitor/cache/index', '', '1', '0', '0', 'C', 'monitor:cache:list', 'devicon-plain:redis-wordmark', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-11 03:13:01.000000', '缓存监控菜单', '0'),
(114, '缓存列表', 2, 6, 'cacheList', 'monitor/cache/list', '', '1', '0', '0', 'C', 'monitor:cache:list', 'octicon:cache-24', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-11 03:13:28.000000', '缓存列表菜单', '0'),
(116, '代码生成', 3, 2, 'gen', 'tool/gen/index', '', '1', '0', '0', 'C', 'tool:gen:list', 'tabler:code', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-11 03:04:50.000000', '代码生成菜单', '0'),
(117, '系统接口', 3, 3, 'swagger', 'tool/swagger/index', '', '1', '0', '0', 'C', 'tool:swagger:list', 'devicon:swagger-wordmark', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-11 03:17:28.000000', '系统接口菜单', '0'),
(500, '操作日志', 108, 1, 'operlog', 'monitor/operlog/index', '', '1', '0', '0', 'C', 'monitor:operlog:list', 'form', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.452796', '操作日志菜单', '0'),
(501, '登录日志', 108, 2, 'logininfor', 'monitor/logininfor/index', '', '1', '0', '0', 'C', 'monitor:logininfor:list', 'logininfor', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.452796', '登录日志菜单', '0'),
(1000, '用户查询', 100, 1, '', '', '', '1', '0', '0', 'F', 'system:user:query', '#', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.500660', '', '0'),
(1001, '用户新增', 100, 2, '', '', '', '1', '0', '0', 'F', 'system:user:add', '#', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.500660', '', '0'),
(1002, '用户修改', 100, 3, '', '', '', '1', '0', '0', 'F', 'system:user:edit', '#', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.500660', '', '0'),
(1003, '用户删除', 100, 4, '', '', '', '1', '0', '0', 'F', 'system:user:remove', '#', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.500660', '', '0'),
(1004, '用户导出', 100, 5, '', '', '', '1', '0', '0', 'F', 'system:user:export', '#', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.500660', '', '0'),
(1005, '用户导入', 100, 6, '', '', '', '1', '0', '0', 'F', 'system:user:import', '#', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.500660', '', '0'),
(1006, '重置密码', 100, 7, '', '', '', '1', '0', '0', 'F', 'system:user:resetPwd', '#', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.500660', '', '0'),
(1007, '角色查询', 101, 1, '', '', '', '1', '0', '0', 'F', 'system:role:query', '#', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.502820', '', '0'),
(1008, '角色新增', 101, 2, '', '', '', '1', '0', '0', 'F', 'system:role:add', '#', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.502820', '', '0'),
(1009, '角色修改', 101, 3, '', '', '', '1', '0', '0', 'F', 'system:role:edit', '#', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.502820', '', '0'),
(1010, '角色删除', 101, 4, '', '', '', '1', '0', '0', 'F', 'system:role:remove', '#', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.502820', '', '0'),
(1011, '角色导出', 101, 5, '', '', '', '1', '0', '0', 'F', 'system:role:export', '#', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.502820', '', '0'),
(1012, '菜单查询', 102, 1, '', '', '', '1', '0', '0', 'F', 'system:menu:query', '#', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.503199', '', '0'),
(1013, '菜单新增', 102, 2, '', '', '', '1', '0', '0', 'F', 'system:menu:add', '#', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.503199', '', '0'),
(1014, '菜单修改', 102, 3, '', '', '', '1', '0', '0', 'F', 'system:menu:edit', '#', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.503199', '', '0'),
(1015, '菜单删除', 102, 4, '', '', '', '1', '0', '0', 'F', 'system:menu:remove', '#', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.503199', '', '0'),
(1016, '部门查询', 103, 1, '', '', '', '1', '0', '0', 'F', 'system:dept:query', '#', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.503458', '', '0'),
(1017, '部门新增', 103, 2, '', '', '', '1', '0', '0', 'F', 'system:dept:add', '#', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.503458', '', '0'),
(1018, '部门修改', 103, 3, '', '', '', '1', '0', '0', 'F', 'system:dept:edit', '#', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.503458', '', '0'),
(1019, '部门删除', 103, 4, '', '', '', '1', '0', '0', 'F', 'system:dept:remove', '#', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.503458', '', '0'),
(1020, '岗位查询', 104, 1, '', '', '', '1', '0', '0', 'F', 'system:post:query', '#', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.503699', '', '0'),
(1021, '岗位新增', 104, 2, '', '', '', '1', '0', '0', 'F', 'system:post:add', '#', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.503699', '', '0'),
(1022, '岗位修改', 104, 3, '', '', '', '1', '0', '0', 'F', 'system:post:edit', '#', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.503699', '', '0'),
(1023, '岗位删除', 104, 4, '', '', '', '1', '0', '0', 'F', 'system:post:remove', '#', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.503699', '', '0'),
(1024, '岗位导出', 104, 5, '', '', '', '1', '0', '0', 'F', 'system:post:export', '#', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.503699', '', '0'),
(1025, '字典查询', 105, 1, '#', '', '', '1', '0', '0', 'F', 'system:dict:query', '#', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.503957', '', '0'),
(1026, '字典新增', 105, 2, '#', '', '', '1', '0', '0', 'F', 'system:dict:add', '#', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.503957', '', '0'),
(1027, '字典修改', 105, 3, '#', '', '', '1', '0', '0', 'F', 'system:dict:edit', '#', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.503957', '', '0'),
(1028, '字典删除', 105, 4, '#', '', '', '1', '0', '0', 'F', 'system:dict:remove', '#', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.503957', '', '0'),
(1029, '字典导出', 105, 5, '#', '', '', '1', '0', '0', 'F', 'system:dict:export', '#', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.503957', '', '0'),
(1030, '参数查询', 106, 1, '#', '', '', '1', '0', '0', 'F', 'system:config:query', '#', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.504246', '', '0'),
(1031, '参数新增', 106, 2, '#', '', '', '1', '0', '0', 'F', 'system:config:add', '#', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.504246', '', '0'),
(1032, '参数修改', 106, 3, '#', '', '', '1', '0', '0', 'F', 'system:config:edit', '#', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.504246', '', '0'),
(1033, '参数删除', 106, 4, '#', '', '', '1', '0', '0', 'F', 'system:config:remove', '#', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.504246', '', '0'),
(1034, '参数导出', 106, 5, '#', '', '', '1', '0', '0', 'F', 'system:config:export', '#', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.504246', '', '0'),
(1035, '公告查询', 107, 1, '#', '', '', '1', '0', '0', 'F', 'system:notice:query', '#', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.504500', '', '0'),
(1036, '公告新增', 107, 2, '#', '', '', '1', '0', '0', 'F', 'system:notice:add', '#', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.504500', '', '0'),
(1037, '公告修改', 107, 3, '#', '', '', '1', '0', '0', 'F', 'system:notice:edit', '#', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.504500', '', '0'),
(1038, '公告删除', 107, 4, '#', '', '', '1', '0', '0', 'F', 'system:notice:remove', '#', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.504500', '', '0'),
(1039, '操作查询', 500, 1, '#', '', '', '1', '0', '0', 'F', 'monitor:operlog:query', '#', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.504720', '', '0'),
(1040, '操作删除', 500, 2, '#', '', '', '1', '0', '0', 'F', 'monitor:operlog:remove', '#', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.504720', '', '0'),
(1041, '日志导出', 500, 3, '#', '', '', '1', '0', '0', 'F', 'monitor:operlog:export', '#', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.504720', '', '0'),
(1042, '登录查询', 501, 1, '#', '', '', '1', '0', '0', 'F', 'monitor:logininfor:query', '#', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.504927', '', '0'),
(1043, '登录删除', 501, 2, '#', '', '', '1', '0', '0', 'F', 'monitor:logininfor:remove', '#', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.504927', '', '0'),
(1044, '日志导出', 501, 3, '#', '', '', '1', '0', '0', 'F', 'monitor:logininfor:export', '#', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.504927', '', '0'),
(1045, '账户解锁', 501, 4, '#', '', '', '1', '0', '0', 'F', 'monitor:logininfor:unlock', '#', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.504927', '', '0'),
(1046, '在线查询', 109, 1, '#', '', '', '1', '0', '0', 'F', 'monitor:online:query', '#', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.505191', '', '0'),
(1047, '批量强退', 109, 2, '#', '', '', '1', '0', '0', 'F', 'monitor:online:batchLogout', '#', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.505191', '', '0'),
(1048, '单条强退', 109, 3, '#', '', '', '1', '0', '0', 'F', 'monitor:online:forceLogout', '#', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.505191', '', '0'),
(1049, '任务查询', 110, 1, '#', '', '', '1', '0', '0', 'F', 'monitor:job:query', '#', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.505382', '', '0'),
(1050, '任务新增', 110, 2, '#', '', '', '1', '0', '0', 'F', 'monitor:job:add', '#', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.505382', '', '0'),
(1051, '任务修改', 110, 3, '#', '', '', '1', '0', '0', 'F', 'monitor:job:edit', '#', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.505382', '', '0'),
(1052, '任务删除', 110, 4, '#', '', '', '1', '0', '0', 'F', 'monitor:job:remove', '#', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.505382', '', '0'),
(1053, '状态修改', 110, 5, '#', '', '', '1', '0', '0', 'F', 'monitor:job:changeStatus', '#', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.505382', '', '0'),
(1054, '任务导出', 110, 6, '#', '', '', '1', '0', '0', 'F', 'monitor:job:export', '#', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.505382', '', '0'),
(1055, '生成查询', 116, 1, '#', '', '', '1', '0', '0', 'F', 'tool:gen:query', '#', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.507067', '', '0'),
(1056, '生成修改', 116, 2, '#', '', '', '1', '0', '0', 'F', 'tool:gen:edit', '#', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.507067', '', '0'),
(1057, '生成删除', 116, 3, '#', '', '', '1', '0', '0', 'F', 'tool:gen:remove', '#', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.507067', '', '0'),
(1058, '导入代码', 116, 4, '#', '', '', '1', '0', '0', 'F', 'tool:gen:import', '#', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.507067', '', '0'),
(1059, '预览代码', 116, 5, '#', '', '', '1', '0', '0', 'F', 'tool:gen:preview', '#', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.507067', '', '0'),
(1060, '生成代码', 116, 6, '#', '', '', '1', '0', '0', 'F', 'tool:gen:code', '#', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.507067', '', '0');

-- --------------------------------------------------------

--
-- 表的结构 `sys_notice`
--

CREATE TABLE `sys_notice` (
  `notice_id` int NOT NULL COMMENT '公告ID',
  `notice_title` varchar(50) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '公告标题',
  `notice_type` char(1) COLLATE utf8mb4_general_ci NOT NULL COMMENT '公告类型',
  `notice_content` text COLLATE utf8mb4_general_ci COMMENT '公告内容',
  `status` char(1) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '0' COMMENT '公告状态（0正常 1关闭）',
  `create_by` varchar(64) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '创建者',
  `create_time` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `update_by` varchar(64) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '更新者',
  `update_time` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  `remark` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '备注',
  `del_flag` char(1) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '0' COMMENT '删除标志'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='通知公告表';

--
-- 转存表中的数据 `sys_notice`
--

INSERT INTO `sys_notice` (`notice_id`, `notice_title`, `notice_type`, `notice_content`, `status`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`, `del_flag`) VALUES
(1, '温馨提醒：2018-07-01 nest-admin新版本发布啦', '2', '新版本内容', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.607451', '管理员', '0'),
(2, '维护通知：2018-07-01 nest-admin系统凌晨维护', '1', '维护内容', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.607451', '管理员', '0');

-- --------------------------------------------------------

--
-- 表的结构 `sys_oper_log`
--

CREATE TABLE `sys_oper_log` (
  `oper_id` int NOT NULL COMMENT '日志主键',
  `title` varchar(50) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '模块标题',
  `business_type` int NOT NULL DEFAULT '0' COMMENT '业务类型',
  `method` varchar(100) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '方法名称',
  `request_method` varchar(10) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '请求方式',
  `operator_type` int NOT NULL DEFAULT '0' COMMENT '操作类别',
  `oper_name` varchar(50) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '操作人员',
  `dept_name` varchar(50) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '部门名称',
  `oper_url` varchar(255) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '请求URL',
  `oper_ip` varchar(255) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '主机地址',
  `oper_location` varchar(255) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '操作地点',
  `oper_param` varchar(2000) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '请求参数',
  `json_result` varchar(2000) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '返回参数',
  `oper_time` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '操作时间',
  `status` char(1) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '0' COMMENT '操作状态',
  `error_msg` varchar(2000) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '错误消息',
  `cost_time` int NOT NULL DEFAULT '0' COMMENT '消耗时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='操作日志记录';

-- --------------------------------------------------------

--
-- 表的结构 `sys_post`
--

CREATE TABLE `sys_post` (
  `post_id` int NOT NULL COMMENT '岗位ID',
  `post_code` varchar(64) COLLATE utf8mb4_general_ci NOT NULL COMMENT '岗位编码',
  `post_name` varchar(50) COLLATE utf8mb4_general_ci NOT NULL COMMENT '岗位名称',
  `post_sort` int NOT NULL DEFAULT '0' COMMENT '显示顺序',
  `status` char(1) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '0' COMMENT '状态（0正常 1停用）',
  `create_by` varchar(64) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '创建者',
  `create_time` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `update_by` varchar(64) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '更新者',
  `update_time` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  `remark` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '备注',
  `del_flag` char(1) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '0' COMMENT '删除标志',
  `belong_dept_id` int NOT NULL DEFAULT '100' COMMENT '部门ID'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='岗位信息表';

--
-- 转存表中的数据 `sys_post`
--

INSERT INTO `sys_post` (`post_id`, `post_code`, `post_name`, `post_sort`, `status`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`, `del_flag`, `belong_dept_id`) VALUES
(1, 'ceo', '董事长', 1, '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 13:59:55.000000', '1', '0', 100),
(2, 'se', '项目经理', 2, '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 14:01:44.000000', '', '0', 100),
(3, 'hr', '人力资源', 3, '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 14:01:48.000000', '', '0', 100),
(4, 'user', '普通员工', 4, '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 14:01:54.000000', '', '0', 100),
(5, 'developer', '开发工程师', 5, '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 14:01:58.000000', '', '0', 100),
(6, 'tester', '测试工程师', 6, '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 14:02:06.000000', '', '0', 100),
(7, 'ops', '运维工程师', 7, '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 14:02:09.000000', '', '0', 100),
(8, 'designer', 'UI设计师', 8, '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 14:02:14.000000', '', '0', 100);

-- --------------------------------------------------------

--
-- 表的结构 `sys_role`
--

CREATE TABLE `sys_role` (
  `role_id` int NOT NULL COMMENT '角色ID',
  `role_name` varchar(30) COLLATE utf8mb4_general_ci NOT NULL COMMENT '角色名称',
  `role_sort` int NOT NULL DEFAULT '0' COMMENT '显示顺序',
  `role_key` varchar(100) COLLATE utf8mb4_general_ci NOT NULL COMMENT '角色权限字符串',
  `data_scope` char(1) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '1' COMMENT '数据范围',
  `menu_check_strictly` tinyint NOT NULL DEFAULT '0' COMMENT '菜单树选择项是否关联显示',
  `dept_check_strictly` tinyint NOT NULL DEFAULT '0' COMMENT '部门树选择项是否关联显示',
  `status` char(1) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '0' COMMENT '角色状态（0正常 1停用）',
  `create_by` varchar(64) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '创建者',
  `create_time` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `update_by` varchar(64) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '更新者',
  `update_time` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  `remark` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '备注',
  `del_flag` char(1) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '0' COMMENT '删除标志'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='角色信息表';

--
-- 转存表中的数据 `sys_role`
--

INSERT INTO `sys_role` (`role_id`, `role_name`, `role_sort`, `role_key`, `data_scope`, `menu_check_strictly`, `dept_check_strictly`, `status`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`, `del_flag`) VALUES
(1, '超级管理员', 1, 'admin', '1', 1, 1, '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.399689', '超级管理员', '0'),
(2, '普通角色', 2, 'common', '2', 1, 1, '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.399689', '普通角色', '0');

-- --------------------------------------------------------

--
-- 表的结构 `sys_role_dept`
--

CREATE TABLE `sys_role_dept` (
  `role_id` int NOT NULL DEFAULT '0' COMMENT '角色ID',
  `dept_id` int NOT NULL DEFAULT '0' COMMENT '部门ID'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='角色和部门关联表';

--
-- 转存表中的数据 `sys_role_dept`
--

INSERT INTO `sys_role_dept` (`role_id`, `dept_id`) VALUES
(2, 100),
(2, 101),
(2, 105);

-- --------------------------------------------------------

--
-- 表的结构 `sys_role_menu`
--

CREATE TABLE `sys_role_menu` (
  `role_id` int NOT NULL DEFAULT '0' COMMENT '角色ID',
  `menu_id` int NOT NULL DEFAULT '0' COMMENT '菜单ID'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='角色和菜单关联表';

--
-- 转存表中的数据 `sys_role_menu`
--

INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES
(2, 1),
(2, 2),
(2, 3),
(2, 4),
(2, 100),
(2, 101),
(2, 102),
(2, 103),
(2, 104),
(2, 105),
(2, 106),
(2, 107),
(2, 108),
(2, 109),
(2, 110),
(2, 111),
(2, 112),
(2, 113),
(2, 114),
(2, 115),
(2, 116),
(2, 117),
(2, 118),
(2, 500),
(2, 501),
(2, 1000),
(2, 1001),
(2, 1002),
(2, 1003),
(2, 1004),
(2, 1005),
(2, 1006),
(2, 1007),
(2, 1008),
(2, 1009),
(2, 1010),
(2, 1011),
(2, 1012),
(2, 1013),
(2, 1014),
(2, 1015),
(2, 1016),
(2, 1017),
(2, 1018),
(2, 1019),
(2, 1020),
(2, 1021),
(2, 1022),
(2, 1023),
(2, 1024),
(2, 1025),
(2, 1026),
(2, 1027),
(2, 1028),
(2, 1029),
(2, 1030),
(2, 1031),
(2, 1032),
(2, 1033),
(2, 1034),
(2, 1035),
(2, 1036),
(2, 1037),
(2, 1038),
(2, 1039),
(2, 1040),
(2, 1041),
(2, 1042),
(2, 1043),
(2, 1044),
(2, 1045),
(2, 1046),
(2, 1047),
(2, 1048),
(2, 1049),
(2, 1050),
(2, 1051),
(2, 1052),
(2, 1053),
(2, 1054),
(2, 1055),
(2, 1056),
(2, 1057),
(2, 1058),
(2, 1059),
(2, 1060),
(2, 1061),
(2, 1062),
(2, 1063),
(2, 1064),
(2, 1065),
(2, 1066),
(2, 1067);

-- --------------------------------------------------------

--
-- 表的结构 `sys_upload`
--

CREATE TABLE `sys_upload` (
  `upload_id` varchar(255) COLLATE utf8mb4_general_ci NOT NULL COMMENT '任务Id',
  `size` int NOT NULL COMMENT '文件大小',
  `file_name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL COMMENT '文件路径',
  `new_file_name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL COMMENT '文件名',
  `url` varchar(255) COLLATE utf8mb4_general_ci NOT NULL COMMENT '文件地址',
  `ext` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '拓展名',
  `status` char(1) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '0' COMMENT '状态（0正常 1关闭）',
  `create_by` varchar(64) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '创建者',
  `create_time` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `update_by` varchar(64) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '更新者',
  `update_time` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  `remark` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '备注',
  `del_flag` char(1) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '0' COMMENT '删除标志'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='文件上传记录';

-- --------------------------------------------------------

--
-- 表的结构 `sys_user`
--

CREATE TABLE `sys_user` (
  `user_id` int NOT NULL COMMENT '用户ID',
  `dept_id` int DEFAULT NULL COMMENT '部门ID',
  `user_name` varchar(30) COLLATE utf8mb4_general_ci NOT NULL COMMENT '用户账号',
  `nick_name` varchar(30) COLLATE utf8mb4_general_ci NOT NULL COMMENT '用户昵称',
  `user_type` varchar(2) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '00' COMMENT '用户类型',
  `email` varchar(50) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '邮箱',
  `phonenumber` varchar(11) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '手机号码',
  `sex` char(1) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '0' COMMENT '性别',
  `avatar` varchar(255) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '头像地址',
  `password` varchar(200) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '用户登录密码',
  `login_ip` varchar(128) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '最后登录IP',
  `login_date` timestamp NULL DEFAULT NULL COMMENT '最后登录时间',
  `status` char(1) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '0' COMMENT '账号状态（0正常 1停用）',
  `create_by` varchar(64) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '创建者',
  `create_time` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `update_by` varchar(64) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '更新者',
  `update_time` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  `remark` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '备注',
  `del_flag` char(1) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '0' COMMENT '删除标志'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='用户信息表';

--
-- 转存表中的数据 `sys_user`
--

INSERT INTO `sys_user` (`user_id`, `dept_id`, `user_name`, `nick_name`, `user_type`, `email`, `phonenumber`, `sex`, `avatar`, `password`, `login_ip`, `login_date`, `status`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`, `del_flag`) VALUES
(1, 103, 'admin', 'nest-admin', '00', 'ry@163.com', '15888888888', '1', '', '$2b$10$d4Z9Iq.v9J4pjX55I9mzRuPHsOMKLupOqxlb/UfbD9oYsYxd5ezeS', '127.0.0.1', '2025-08-11 02:19:56', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-11 02:19:57.000000', '管理员', '0'),
(2, 105, 'ry', 'nest-admin', '00', 'ry@qq.com', '15666666666', '1', '', '$2b$10$d4Z9Iq.v9J4pjX55I9mzRuPHsOMKLupOqxlb/UfbD9oYsYxd5ezeS', '127.0.0.1', '2025-08-10 07:48:16', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 13:51:40.000000', '测试员', '0'),
(3, 110, 'hr001', '人事专员', '00', 'hr001@163.com', '13800000001', '1', '', '$2b$10$d4Z9Iq.v9J4pjX55I9mzRuPHsOMKLupOqxlb/UfbD9oYsYxd5ezeS', '127.0.0.1', '2025-08-10 07:48:16', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.657353', '人事部员工', '0'),
(4, 106, 'finance001', '财务专员', '00', 'finance001@163.com', '13800000002', '1', '', '$2b$10$q8eE6mozJstglqvL/nCqKe1zoymDZmp0YeJds4xar18wlHqD3za6S', '127.0.0.1', '2025-08-10 07:48:16', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 09:13:17.000000', '财务部员工', '0'),
(5, 103, 'dev001', '前端开发', '00', 'dev001@163.com', '13800000003', '0', '', '$2b$10$d4Z9Iq.v9J4pjX55I9mzRuPHsOMKLupOqxlb/UfbD9oYsYxd5ezeS', '127.0.0.1', '2025-08-10 07:48:16', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.657353', '前端开发工程师', '0'),
(6, 103, 'dev002', '后端开发', '00', 'dev002@163.com', '13800000004', '0', '', '$2b$10$d4Z9Iq.v9J4pjX55I9mzRuPHsOMKLupOqxlb/UfbD9oYsYxd5ezeS', '127.0.0.1', '2025-08-10 07:48:16', '0', 'admin', '2025-08-10 07:48:16.000000', '', '2025-08-10 07:48:16.657353', '后端开发工程师', '0');

-- --------------------------------------------------------

--
-- 表的结构 `sys_user_post`
--

CREATE TABLE `sys_user_post` (
  `user_id` int NOT NULL COMMENT '用户ID',
  `post_id` int NOT NULL COMMENT '岗位ID'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='用户与岗位关联表';

--
-- 转存表中的数据 `sys_user_post`
--

INSERT INTO `sys_user_post` (`user_id`, `post_id`) VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 4),
(5, 5),
(6, 5);

-- --------------------------------------------------------

--
-- 表的结构 `sys_user_role`
--

CREATE TABLE `sys_user_role` (
  `user_id` int NOT NULL COMMENT '用户ID',
  `role_id` int NOT NULL COMMENT '角色ID'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='用户和角色关联表';

--
-- 转存表中的数据 `sys_user_role`
--

INSERT INTO `sys_user_role` (`user_id`, `role_id`) VALUES
(1, 1),
(2, 2),
(3, 2),
(4, 2),
(5, 2),
(6, 2);

--
-- 转储表的索引
--

--
-- 表的索引 `gen_table`
--
ALTER TABLE `gen_table`
  ADD PRIMARY KEY (`table_id`);

--
-- 表的索引 `gen_table_column`
--
ALTER TABLE `gen_table_column`
  ADD PRIMARY KEY (`column_id`);

--
-- 表的索引 `sys_config`
--
ALTER TABLE `sys_config`
  ADD PRIMARY KEY (`config_id`);

--
-- 表的索引 `sys_dept`
--
ALTER TABLE `sys_dept`
  ADD PRIMARY KEY (`dept_id`);

--
-- 表的索引 `sys_dict_data`
--
ALTER TABLE `sys_dict_data`
  ADD PRIMARY KEY (`dict_code`);

--
-- 表的索引 `sys_dict_type`
--
ALTER TABLE `sys_dict_type`
  ADD PRIMARY KEY (`dict_id`),
  ADD UNIQUE KEY `IDX_f4e4273658733a3bbe6a2479bf` (`dict_type`);

--
-- 表的索引 `sys_job`
--
ALTER TABLE `sys_job`
  ADD PRIMARY KEY (`job_id`);

--
-- 表的索引 `sys_job_log`
--
ALTER TABLE `sys_job_log`
  ADD PRIMARY KEY (`job_log_id`);

--
-- 表的索引 `sys_logininfor`
--
ALTER TABLE `sys_logininfor`
  ADD PRIMARY KEY (`info_id`);

--
-- 表的索引 `sys_menu`
--
ALTER TABLE `sys_menu`
  ADD PRIMARY KEY (`menu_id`);

--
-- 表的索引 `sys_notice`
--
ALTER TABLE `sys_notice`
  ADD PRIMARY KEY (`notice_id`);

--
-- 表的索引 `sys_oper_log`
--
ALTER TABLE `sys_oper_log`
  ADD PRIMARY KEY (`oper_id`);

--
-- 表的索引 `sys_post`
--
ALTER TABLE `sys_post`
  ADD PRIMARY KEY (`post_id`);

--
-- 表的索引 `sys_role`
--
ALTER TABLE `sys_role`
  ADD PRIMARY KEY (`role_id`);

--
-- 表的索引 `sys_role_dept`
--
ALTER TABLE `sys_role_dept`
  ADD PRIMARY KEY (`role_id`,`dept_id`);

--
-- 表的索引 `sys_role_menu`
--
ALTER TABLE `sys_role_menu`
  ADD PRIMARY KEY (`role_id`,`menu_id`);

--
-- 表的索引 `sys_upload`
--
ALTER TABLE `sys_upload`
  ADD PRIMARY KEY (`upload_id`);

--
-- 表的索引 `sys_user`
--
ALTER TABLE `sys_user`
  ADD PRIMARY KEY (`user_id`);

--
-- 表的索引 `sys_user_post`
--
ALTER TABLE `sys_user_post`
  ADD PRIMARY KEY (`user_id`,`post_id`);

--
-- 表的索引 `sys_user_role`
--
ALTER TABLE `sys_user_role`
  ADD PRIMARY KEY (`user_id`,`role_id`);

--
-- 在导出的表使用AUTO_INCREMENT
--

--
-- 使用表AUTO_INCREMENT `gen_table`
--
ALTER TABLE `gen_table`
  MODIFY `table_id` int NOT NULL AUTO_INCREMENT COMMENT '编号', AUTO_INCREMENT=2;

--
-- 使用表AUTO_INCREMENT `gen_table_column`
--
ALTER TABLE `gen_table_column`
  MODIFY `column_id` int NOT NULL AUTO_INCREMENT COMMENT '编号', AUTO_INCREMENT=21;

--
-- 使用表AUTO_INCREMENT `sys_config`
--
ALTER TABLE `sys_config`
  MODIFY `config_id` int NOT NULL AUTO_INCREMENT COMMENT '参数主键', AUTO_INCREMENT=7;

--
-- 使用表AUTO_INCREMENT `sys_dept`
--
ALTER TABLE `sys_dept`
  MODIFY `dept_id` int NOT NULL AUTO_INCREMENT COMMENT '部门ID', AUTO_INCREMENT=113;

--
-- 使用表AUTO_INCREMENT `sys_dict_data`
--
ALTER TABLE `sys_dict_data`
  MODIFY `dict_code` int NOT NULL AUTO_INCREMENT COMMENT '字典主键', AUTO_INCREMENT=30;

--
-- 使用表AUTO_INCREMENT `sys_dict_type`
--
ALTER TABLE `sys_dict_type`
  MODIFY `dict_id` int NOT NULL AUTO_INCREMENT COMMENT '字典主键', AUTO_INCREMENT=11;

--
-- 使用表AUTO_INCREMENT `sys_job`
--
ALTER TABLE `sys_job`
  MODIFY `job_id` int NOT NULL AUTO_INCREMENT COMMENT '任务ID', AUTO_INCREMENT=4;

--
-- 使用表AUTO_INCREMENT `sys_job_log`
--
ALTER TABLE `sys_job_log`
  MODIFY `job_log_id` int NOT NULL AUTO_INCREMENT COMMENT '任务日志ID', AUTO_INCREMENT=39;

--
-- 使用表AUTO_INCREMENT `sys_logininfor`
--
ALTER TABLE `sys_logininfor`
  MODIFY `info_id` int NOT NULL AUTO_INCREMENT COMMENT '访问ID', AUTO_INCREMENT=3;

--
-- 使用表AUTO_INCREMENT `sys_menu`
--
ALTER TABLE `sys_menu`
  MODIFY `menu_id` int NOT NULL AUTO_INCREMENT COMMENT '菜单ID', AUTO_INCREMENT=1069;

--
-- 使用表AUTO_INCREMENT `sys_notice`
--
ALTER TABLE `sys_notice`
  MODIFY `notice_id` int NOT NULL AUTO_INCREMENT COMMENT '公告ID', AUTO_INCREMENT=3;

--
-- 使用表AUTO_INCREMENT `sys_oper_log`
--
ALTER TABLE `sys_oper_log`
  MODIFY `oper_id` int NOT NULL AUTO_INCREMENT COMMENT '日志主键';

--
-- 使用表AUTO_INCREMENT `sys_post`
--
ALTER TABLE `sys_post`
  MODIFY `post_id` int NOT NULL AUTO_INCREMENT COMMENT '岗位ID', AUTO_INCREMENT=9;

--
-- 使用表AUTO_INCREMENT `sys_role`
--
ALTER TABLE `sys_role`
  MODIFY `role_id` int NOT NULL AUTO_INCREMENT COMMENT '角色ID', AUTO_INCREMENT=3;

--
-- 使用表AUTO_INCREMENT `sys_user`
--
ALTER TABLE `sys_user`
  MODIFY `user_id` int NOT NULL AUTO_INCREMENT COMMENT '用户ID', AUTO_INCREMENT=7;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
