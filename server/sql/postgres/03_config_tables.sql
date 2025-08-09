-- 配置相关表结构 (PostgreSQL)

-- 字典类型表
CREATE TABLE IF NOT EXISTS sys_dict_type (
  dict_id          SERIAL PRIMARY KEY,
  dict_name        VARCHAR(100) DEFAULT '',
  dict_type        VARCHAR(100) DEFAULT '',
  status           CHAR(1) DEFAULT '0',
  create_by        VARCHAR(64) DEFAULT '',
  create_time      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  update_by        VARCHAR(64) DEFAULT '',
  update_time      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  remark           VARCHAR(500) DEFAULT NULL,
  del_flag         CHAR(1) DEFAULT '0'
);

-- 字典数据表
CREATE TABLE IF NOT EXISTS sys_dict_data (
  dict_code        SERIAL PRIMARY KEY,
  dict_sort        INT DEFAULT 0,
  dict_label       VARCHAR(100) DEFAULT '',
  dict_value       VARCHAR(100) DEFAULT '',
  dict_type        VARCHAR(100) DEFAULT '',
  css_class        VARCHAR(100) DEFAULT NULL,
  list_class       VARCHAR(100) DEFAULT NULL,
  is_default       CHAR(1) DEFAULT 'N',
  status           CHAR(1) DEFAULT '0',
  create_by        VARCHAR(64) DEFAULT '',
  create_time      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  update_by        VARCHAR(64) DEFAULT '',
  update_time      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  remark           VARCHAR(500) DEFAULT NULL,
  del_flag         CHAR(1) DEFAULT '0'
);

-- 参数配置表
CREATE TABLE IF NOT EXISTS sys_config (
  config_id         SERIAL PRIMARY KEY,
  config_name       VARCHAR(100) DEFAULT '',
  config_key        VARCHAR(100) DEFAULT '',
  config_value      VARCHAR(500) DEFAULT '',
  config_type       CHAR(1) DEFAULT 'N',
  status            CHAR(1) DEFAULT '0',              -- 根据架构图调整字段顺序
  create_by         VARCHAR(64) DEFAULT '',
  create_time       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  update_by         VARCHAR(64) DEFAULT '',
  update_time       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  remark            VARCHAR(500) DEFAULT NULL,
  del_flag          CHAR(1) DEFAULT '0'
);

-- 通知公告表
CREATE TABLE IF NOT EXISTS sys_notice (
  notice_id         SERIAL PRIMARY KEY,
  notice_title      VARCHAR(50) NOT NULL,
  notice_type       CHAR(1) NOT NULL,
  notice_content    BYTEA DEFAULT NULL,              -- 根据架构图使用BYTEA类型存储longblob
  status            CHAR(1) DEFAULT '0',
  create_by         VARCHAR(64) DEFAULT '',
  create_time       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  update_by         VARCHAR(64) DEFAULT '',
  update_time       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  remark            VARCHAR(255) DEFAULT NULL,
  del_flag          CHAR(1) DEFAULT '0'
); 