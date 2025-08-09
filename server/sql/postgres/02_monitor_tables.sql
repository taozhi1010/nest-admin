-- 监控相关表结构 (PostgreSQL)

-- 操作日志记录表 (根据架构图：不继承BaseEntity，直接管理时间戳)
CREATE TABLE IF NOT EXISTS sys_oper_log (
  oper_id           SERIAL PRIMARY KEY,
  title             VARCHAR(50) DEFAULT '',
  business_type     INT DEFAULT 0,
  method            VARCHAR(100) DEFAULT '',           -- 根据架构图调整长度
  request_method    VARCHAR(10) DEFAULT '',
  operator_type     INT DEFAULT 0,
  oper_name         VARCHAR(50) DEFAULT '',
  dept_name         VARCHAR(50) DEFAULT '',
  oper_url          VARCHAR(255) DEFAULT '',
  oper_ip           VARCHAR(255) DEFAULT '',            -- 根据架构图调整长度
  oper_location     VARCHAR(255) DEFAULT '',
  oper_param        VARCHAR(2000) DEFAULT '',
  json_result       VARCHAR(2000) DEFAULT '',
  oper_time         TIMESTAMP DEFAULT NULL,
  status            CHAR(1) DEFAULT '0',                -- 根据架构图调整类型
  error_msg         VARCHAR(2000) DEFAULT '',
  cost_time         INT DEFAULT 0                       -- 根据架构图调整类型
);

-- 系统访问记录
CREATE TABLE IF NOT EXISTS sys_logininfor (
  info_id        SERIAL PRIMARY KEY,
  user_name      VARCHAR(50) DEFAULT '',             -- 根据架构图保持为user_name
  ipaddr         VARCHAR(128) DEFAULT '',
  login_location VARCHAR(255) DEFAULT '',
  browser        VARCHAR(50) DEFAULT '',
  os             VARCHAR(50) DEFAULT '',
  status         CHAR(1) DEFAULT '0',
  message        VARCHAR(255) DEFAULT '',             -- 根据架构图调整字段名
  login_time     TIMESTAMP DEFAULT NULL
);

-- 定时任务调度表
CREATE TABLE IF NOT EXISTS sys_job (
  job_id              SERIAL PRIMARY KEY,
  job_name            VARCHAR(64) DEFAULT '',
  job_group           VARCHAR(64) DEFAULT 'DEFAULT',
  invoke_target       VARCHAR(500) NOT NULL,
  cron_expression     VARCHAR(255) DEFAULT '',
  misfire_policy      VARCHAR(20) DEFAULT '3',
  concurrent          CHAR(1) DEFAULT '1',
  status              CHAR(1) DEFAULT '0',
  create_by           VARCHAR(64) DEFAULT '',
  create_time         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  update_by           VARCHAR(64) DEFAULT '',
  update_time         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  remark              VARCHAR(500) DEFAULT '',
  del_flag            CHAR(1) DEFAULT '0'              -- 根据架构图添加BaseEntity字段
);

-- 定时任务调度日志表
CREATE TABLE IF NOT EXISTS sys_job_log (
  job_log_id          SERIAL PRIMARY KEY,
  job_id              INT,                             -- 根据架构图添加外键字段
  job_name            VARCHAR(64) NOT NULL,
  job_group           VARCHAR(64) NOT NULL,
  invoke_target       VARCHAR(500) NOT NULL,
  job_message         VARCHAR(500),
  status              CHAR(1) DEFAULT '0',
  exception_info      VARCHAR(2000) DEFAULT '',
  create_time         TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 