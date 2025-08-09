-- 工具相关表结构 (MySQL)

-- 代码生成业务表
CREATE TABLE IF NOT EXISTS gen_table (
  table_id          INT AUTO_INCREMENT PRIMARY KEY,
  table_name        VARCHAR(200) DEFAULT '',
  table_comment     VARCHAR(500) DEFAULT '',
  sub_table_name    VARCHAR(64) DEFAULT NULL,
  sub_table_fk_name VARCHAR(64) DEFAULT NULL,
  class_name        VARCHAR(100) DEFAULT '',
  tpl_category      VARCHAR(200) DEFAULT 'crud',
  tpl_web_type      VARCHAR(30) DEFAULT '',
  package_name      VARCHAR(100),
  module_name       VARCHAR(30),
  business_name     VARCHAR(30),
  function_name     VARCHAR(50),
  function_author   VARCHAR(50),
  gen_type          CHAR(1) DEFAULT '0',
  gen_path          VARCHAR(200) DEFAULT '/',
  options           VARCHAR(1000) DEFAULT '',
  parent_menu_id    INT DEFAULT 0,
  status            CHAR(1) DEFAULT '0',
  del_flag          CHAR(1) DEFAULT '0',
  create_by         VARCHAR(64) DEFAULT '',
  create_time       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  update_by         VARCHAR(64) DEFAULT '',
  update_time       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  remark            VARCHAR(500) DEFAULT ''
) ENGINE=InnoDB;

-- 代码生成业务表字段
CREATE TABLE IF NOT EXISTS gen_table_column (
  column_id         INT AUTO_INCREMENT PRIMARY KEY,
  table_id          INT,
  column_name       VARCHAR(200),
  column_comment    VARCHAR(500),
  column_type       VARCHAR(100),
  java_type         VARCHAR(500),
  java_field        VARCHAR(200),
  is_pk             CHAR(1),
  is_increment      CHAR(1),
  is_required       CHAR(1),
  is_insert         CHAR(1),
  is_edit           CHAR(1),
  is_list           CHAR(1),
  is_query          CHAR(1),
  query_type        VARCHAR(200) DEFAULT 'EQ',
  html_type         VARCHAR(200),
  dict_type         VARCHAR(200) DEFAULT '',
  sort              INT,
  create_by         VARCHAR(64) DEFAULT '',
  create_time       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  update_by         VARCHAR(64) DEFAULT '',
  update_time       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  remark            VARCHAR(255) DEFAULT '',
  del_flag          CHAR(1) DEFAULT '0'
) ENGINE=InnoDB;

-- 文件上传记录
CREATE TABLE IF NOT EXISTS sys_upload (
  upload_id         VARCHAR(255) PRIMARY KEY,
  size              INT NOT NULL,
  file_name         VARCHAR(255) NOT NULL,
  new_file_name     VARCHAR(255) NOT NULL,
  url               VARCHAR(255) NOT NULL,
  ext               VARCHAR(255) DEFAULT NULL,
  status            CHAR(1) DEFAULT '0',
  del_flag          CHAR(1) DEFAULT '0',
  create_by         VARCHAR(64) DEFAULT '',
  create_time       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  update_by         VARCHAR(64) DEFAULT '',
  update_time       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  remark            VARCHAR(500) DEFAULT NULL
) ENGINE=InnoDB; 