-- 系统核心表结构 (MySQL)

-- 部门表
CREATE TABLE IF NOT EXISTS sys_dept (
  dept_id           INT AUTO_INCREMENT PRIMARY KEY,
  parent_id         INT DEFAULT 0,
  ancestors         VARCHAR(50) DEFAULT '',
  dept_name         VARCHAR(30) DEFAULT '',
  order_num         INT DEFAULT 0,
  leader            VARCHAR(20) DEFAULT NULL,
  phone             VARCHAR(11) DEFAULT NULL,
  email             VARCHAR(50) DEFAULT NULL,
  status            CHAR(1) DEFAULT '0',
  del_flag          CHAR(1) DEFAULT '0',
  create_by         VARCHAR(64) DEFAULT '',
  create_time       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  update_by         VARCHAR(64) DEFAULT '',
  update_time       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  remark            VARCHAR(500) DEFAULT NULL
) ENGINE=InnoDB;

-- 用户表
CREATE TABLE IF NOT EXISTS sys_user (
  user_id           INT AUTO_INCREMENT PRIMARY KEY,
  dept_id           INT DEFAULT NULL,
  user_name         VARCHAR(30) NOT NULL,           -- 根据实体调整字段名
  nick_name         VARCHAR(30) NOT NULL,
  user_type         VARCHAR(2) DEFAULT '00',
  email             VARCHAR(50) DEFAULT '',
  phonenumber       VARCHAR(11) DEFAULT '',
  sex               CHAR(1) DEFAULT '0',
  avatar            VARCHAR(100) DEFAULT '',
  password          VARCHAR(200) DEFAULT '',
  status            CHAR(1) DEFAULT '0',
  del_flag          CHAR(1) DEFAULT '0',
  login_ip          VARCHAR(128) DEFAULT '',
  login_date        TIMESTAMP DEFAULT NULL,
  create_by         VARCHAR(64) DEFAULT '',
  create_time       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  update_by         VARCHAR(64) DEFAULT '',
  update_time       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  remark            VARCHAR(500) DEFAULT NULL
) ENGINE=InnoDB;

-- 岗位表
CREATE TABLE IF NOT EXISTS sys_post (
  post_id       INT AUTO_INCREMENT PRIMARY KEY,
  post_code     VARCHAR(64) NOT NULL,
  post_name     VARCHAR(50) NOT NULL,
  post_sort     INT NOT NULL,
  status        CHAR(1) NOT NULL,
  create_by     VARCHAR(64) DEFAULT '',
  create_time   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  update_by     VARCHAR(64) DEFAULT '',
  update_time   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  remark        VARCHAR(500) DEFAULT NULL,
  del_flag      CHAR(1) DEFAULT '0'
) ENGINE=InnoDB;

-- 角色表
CREATE TABLE IF NOT EXISTS sys_role (
  role_id              INT AUTO_INCREMENT PRIMARY KEY,
  role_name            VARCHAR(30) NOT NULL,
  role_key             VARCHAR(100) NOT NULL,
  role_sort            INT NOT NULL,
  data_scope           CHAR(1) DEFAULT '1',
  menu_check_strictly  BOOLEAN DEFAULT TRUE,
  dept_check_strictly  BOOLEAN DEFAULT TRUE,
  status               CHAR(1) NOT NULL,
  del_flag             CHAR(1) DEFAULT '0',
  create_by            VARCHAR(64) DEFAULT '',
  create_time          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  update_by            VARCHAR(64) DEFAULT '',
  update_time          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  remark               VARCHAR(500) DEFAULT NULL
) ENGINE=InnoDB;

-- 菜单表
CREATE TABLE IF NOT EXISTS sys_menu (
  menu_id           INT AUTO_INCREMENT PRIMARY KEY,
  menu_name         VARCHAR(50) NOT NULL,
  parent_id         INT DEFAULT 0,
  order_num         INT DEFAULT 0,
  path              VARCHAR(200) DEFAULT '',
  component         VARCHAR(255) DEFAULT NULL,
  query             VARCHAR(255) DEFAULT NULL,
  is_frame          CHAR(1) DEFAULT '1',
  is_cache          CHAR(1) DEFAULT '0',
  menu_type         CHAR(1) DEFAULT '',
  visible           CHAR(1) DEFAULT '0',
  status            CHAR(1) DEFAULT '0',
  perms             VARCHAR(100) DEFAULT NULL,
  icon              VARCHAR(100) DEFAULT '#',
  create_by         VARCHAR(64) DEFAULT '',
  create_time       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  update_by         VARCHAR(64) DEFAULT '',
  update_time       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  remark            VARCHAR(500) DEFAULT '',
  del_flag          CHAR(1) DEFAULT '0'
) ENGINE=InnoDB;

-- 用户和角色关联表
CREATE TABLE IF NOT EXISTS sys_user_role (
  user_id   INT NOT NULL,
  role_id   INT NOT NULL,
  PRIMARY KEY(user_id, role_id)
) ENGINE=InnoDB;

-- 角色和菜单关联表
CREATE TABLE IF NOT EXISTS sys_role_menu (
  role_id   INT NOT NULL,
  menu_id   INT NOT NULL,
  PRIMARY KEY(role_id, menu_id)
) ENGINE=InnoDB;

-- 角色和部门关联表
CREATE TABLE IF NOT EXISTS sys_role_dept (
  role_id   INT NOT NULL,
  dept_id   INT NOT NULL,
  PRIMARY KEY(role_id, dept_id)
) ENGINE=InnoDB;

-- 用户与岗位关联表
CREATE TABLE IF NOT EXISTS sys_user_post (
  user_id   INT NOT NULL,
  post_id   INT NOT NULL,
  PRIMARY KEY(user_id, post_id)
) ENGINE=InnoDB; 