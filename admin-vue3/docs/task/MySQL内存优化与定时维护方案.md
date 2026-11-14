# MySQL 内存优化与定时维护方案

## 问题描述

服务器配置：4GB 内存，MySQL 8.4.9  
现象：运行一个月后，MySQL 内存占用从 2.2GB 增长到 3.2GB  
影响：需要手动重启才能释放内存

## 解决方案概览

本方案提供三个层次的解决策略：
1. **短期方案**：设置定时重启，快速缓解问题
2. **中期方案**：优化 MySQL 配置，减少内存泄漏
3. **长期方案**：建立监控体系，从根本上解决问题

---

## 一、短期方案：设置定时重启

### 1.1 使用 Crontab 定时任务（推荐）

#### 步骤 1：编辑 crontab
```bash
crontab -e
```

#### 步骤 2：添加定时重启任务

**选项 A：每周日凌晨 3 点重启**
```bash
0 3 * * 0 systemctl restart mysql
```

**选项 B：每 10 天重启一次（凌晨 3 点）**
```bash
0 3 */10 * * systemctl restart mysql
```

**选项 C：每月 1 号和 15 号重启**
```bash
0 3 1,15 * * systemctl restart mysql
```

#### 步骤 3：保存并验证
```bash
# 查看已设置的定时任务
crontab -l

# 查看 cron 服务状态
systemctl status cron
```

### 1.2 使用 Systemd Timer（更现代的方式）

#### 步骤 1：创建服务文件
```bash
sudo nano /etc/systemd/system/mysql-restart.service
```

添加以下内容：
```ini
[Unit]
Description=Restart MySQL Service
After=network.target

[Service]
Type=oneshot
ExecStart=/usr/bin/systemctl restart mysql
```

#### 步骤 2：创建定时器文件
```bash
sudo nano /etc/systemd/system/mysql-restart.timer
```

添加以下内容：
```ini
[Unit]
Description=Weekly MySQL Restart Timer

[Timer]
OnCalendar=*-*0 03:00:00
Persistent=true

[Install]
WantedBy=timers.target
```

#### 步骤 3：启用定时器
```bash
# 重新加载 systemd 配置
sudo systemctl daemon-reload

# 启用并启动定时器
sudo systemctl enable mysql-restart.timer
sudo systemctl start mysql-restart.timer

# 查看定时器状态
systemctl list-timers --all | grep mysql
```

---

## 二、中期方案：优化 MySQL 配置

### 2.1 备份当前配置

```bash
# 备份配置文件
sudo cp /etc/mysql/my.cnf /etc/mysql/my.cnf.backup.$(date +%Y%m%d)

# 或者对于某些系统
sudo cp /etc/my.cnf /etc/my.cnf.backup.$(date +%Y%m%d)
```

### 2.2 修改 MySQL 配置文件

编辑配置文件：
```bash
sudo nano /etc/mysql/my.cnf
# 或
sudo nano /etc/my.cnf
```

在 `[mysqld]` 部分添加或修改以下配置：

```ini
[mysqld]
# ==================== 内存优化配置 ====================

# InnoDB 缓冲池大小（4GB 内存服务器建议 1-1.5GB）
innodb_buffer_pool_size = 1G

# 限制最大连接数
max_connections = 50

# 连接超时设置（自动清理空闲连接）
wait_timeout = 600
interactive_timeout = 600

# 临时表大小限制
tmp_table_size = 32M
max_heap_table_size = 32M

# 线程栈大小
thread_stack = 192K

# 日志缓冲区
innodb_log_buffer_size = 16M

# 排序和读取缓冲区（减小单个查询的内存占用）
sort_buffer_size = 256K
read_buffer_size = 256K
read_rnd_buffer_size = 512K
join_buffer_size = 256K

# 表缓存
table_open_cache = 400
table_definition_cache = 400

# 禁用性能模式以减少内存使用（生产环境谨慎使用）
performance_schema = OFF

# ==================== 其他优化 ====================

# 字符集
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci

# 慢查询日志（用于后续优化）
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow-query.log
long_query_time = 2
```

### 2.3 重启 MySQL 使配置生效

```bash
sudo systemctl restart mysql

# 检查 MySQL 状态
sudo systemctl status mysql

# 查看错误日志确认启动正常
sudo tail -n 50 /var/log/mysql/error.log
```

### 2.4 验证配置是否生效

登录 MySQL：
```bash
mysql -u root -p
```

执行以下查询验证配置：
```sql
-- 查看缓冲池大小
SHOW VARIABLES LIKE 'innodb_buffer_pool_size';

-- 查看最大连接数
SHOW VARIABLES LIKE 'max_connections';

-- 查看超时设置
SHOW VARIABLES LIKE 'wait_timeout';
SHOW VARIABLES LIKE 'interactive_timeout';

-- 查看当前内存使用情况
SHOW STATUS LIKE 'Innodb_buffer_pool_pages%';

-- 查看当前连接数
SHOW STATUS LIKE 'Threads_connected';
SHOW STATUS LIKE 'Max_used_connections';
```

---

## 三、长期方案：建立监控体系

### 3.1 创建内存监控脚本

创建监控脚本：
```bash
sudo nano /usr/local/bin/monitor_mysql_memory.sh
```

添加以下内容：
```bash
#!/bin/bash

# MySQL 内存监控脚本

# 配置
THRESHOLD=3000  # 内存阈值（MB），超过此值发送警告
EMAIL="admin@example.com"  # 接收警告的邮箱
LOG_FILE="/var/log/mysql_memory_monitor.log"

# 获取 MySQL 进程内存使用（KB 转 MB）
MEMORY_USAGE=$(ps aux | grep '[m]ysqld' | awk '{sum += $6} END {printf "%.2f", sum/1024}')

# 记录日志
echo "$(date '+%Y-%m-%d %H:%M:%S') - MySQL 内存使用: ${MEMORY_USAGE}MB" >> $LOG_FILE

# 检查是否超过阈值
if (( $(echo "$MEMORY_USAGE > $THRESHOLD" | bc -l) )); then
    echo "警告: MySQL 内存使用过高: ${MEMORY_USAGE}MB (阈值: ${THRESHOLD}MB)" >> $LOG_FILE
    
    # 发送邮件警告（如果安装了 mail 命令）
    if command -v mail &> /dev/null; then
        echo "MySQL 内存使用过高: ${MEMORY_USAGE}MB" | mail -s "MySQL 内存警告" $EMAIL
    fi
    
    # 可选：自动重启（谨慎使用）
    # echo "$(date '+%Y-%m-%d %H:%M:%S') - 自动重启 MySQL" >> $LOG_FILE
    # systemctl restart mysql
fi

# 输出当前状态
echo "当前 MySQL 内存使用: ${MEMORY_USAGE}MB"
```

设置执行权限：
```bash
sudo chmod +x /usr/local/bin/monitor_mysql_memory.sh
```

### 3.2 设置定时监控

编辑 crontab：
```bash
crontab -e
```

添加每小时检查一次：
```bash
# 每小时检查 MySQL 内存使用
0 * * * * /usr/local/bin/monitor_mysql_memory.sh
```

### 3.3 查看监控日志

```bash
# 查看最近的监控记录
tail -n 50 /var/log/mysql_memory_monitor.log

# 实时查看监控日志
tail -f /var/log/mysql_memory_monitor.log
```

### 3.4 定期清理二进制日志

创建日志清理脚本：
```bash
sudo nano /usr/local/bin/cleanup_mysql_logs.sh
```

添加内容：
```bash
#!/bin/bash

# MySQL 日志清理脚本

echo "$(date '+%Y-%m-%d %H:%M:%S') - 开始清理 MySQL 日志" >> /var/log/mysql_cleanup.log

# 登录 MySQL 并清理 7 天前的二进制日志
mysql -u root -p'your_password' -e "PURGE BINARY LOGS BEFORE DATE(NOW() - INTERVAL 7 DAY);"

# 优化重要表格（根据需要调整表名）
mysql -u root -p'your_password' -e "
OPTIMIZE TABLE your_database.important_table1;
OPTIMIZE TABLE your_database.important_table2;
"

echo "$(date '+%Y-%m-%d %H:%M:%S') - 日志清理完成" >> /var/log/mysql_cleanup.log
```

设置每周执行一次：
```bash
crontab -e
```

添加：
```bash
# 每周日凌晨 2 点清理日志
0 2 * * 0 /usr/local/bin/cleanup_mysql_logs.sh
```

---

## 四、诊断工具：找出内存增长原因

### 4.1 检查哪些表占用最多空间

```sql
SELECT 
    table_schema AS '数据库',
    table_name AS '表名',
    ROUND(data_length / 1024 / 1024, 2) AS '数据大小(MB)',
    ROUND(index_length / 1024 / 1024, 2) AS '索引大小(MB)',
    ROUND((data_length + index_length) / 1024 / 1024, 2) AS '总大小(MB)'
FROM information_schema.tables
ORDER BY (data_length + index_length) DESC
LIMIT 20;
```

### 4.2 查看当前正在运行的查询

```sql
SHOW FULL PROCESSLIST;
```

### 4.3 检查 InnoDB 缓冲池使用情况

```sql
SELECT 
    pool_id,
    page_type,
    COUNT(*) AS page_count,
    ROUND(COUNT(*) * 16 / 1024, 2) AS size_mb
FROM information_schema.INNODB_BUFFER_PAGE
GROUP BY pool_id, page_type
ORDER BY page_count DESC;
```

### 4.4 查看慢查询

```sql
-- 启用慢查询日志
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;

-- 查看慢查询日志文件位置
SHOW VARIABLES LIKE 'slow_query_log_file';
```

查看日志文件：
```bash
sudo tail -n 100 /var/log/mysql/slow-query.log
```

### 4.5 检查连接泄漏

```sql
-- 查看当前连接数
SHOW STATUS LIKE 'Threads_connected';

-- 查看历史最大连接数
SHOW STATUS LIKE 'Max_used_connections';

-- 查看每个用户的连接数
SELECT user, host, COUNT(*) as connection_count
FROM information_schema.processlist
GROUP BY user, host
ORDER BY connection_count DESC;
```

---

## 五、应用程序层面优化（NestJS）

### 5.1 确保数据库连接正确释放

检查您的 NestJS 代码，确保所有数据库操作都正确关闭连接：

```typescript
// ❌ 错误示例：连接可能未释放
@Injectable()
export class BadExampleService {
  async getData() {
    const connection = this.dataSource.getConnection();
    return await connection.query('SELECT * FROM table');
    // 连接没有释放！
  }
}

// ✅ 正确示例：使用 try-finally 确保连接释放
@Injectable()
export class GoodExampleService {
  async getData() {
    const connection = this.dataSource.getConnection();
    try {
      return await connection.query('SELECT * FROM table');
    } finally {
      // 确保连接释放
      await connection.release();
    }
  }
}
```

### 5.2 使用连接池配置

在 NestJS 的 TypeORM 配置中：

```typescript
TypeOrmModule.forRoot({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: 'your_password',
  database: 'your_database',
  
  // 连接池配置
  extra: {
    connectionLimit: 10,  // 限制连接池大小
    queueLimit: 0,
  },
  
  // 自动重连
  autoLoadEntities: true,
  synchronize: false,
})
```

### 5.3 避免 N+1 查询问题

```typescript
// ❌ 错误示例：N+1 查询
const articles = await this.articleRepository.find();
for (const article of articles) {
  article.author = await this.userRepository.findOne({
    where: { id: article.authorId }
  });
}

// ✅ 正确示例：使用 JOIN 一次性查询
const articles = await this.articleRepository
  .createQueryBuilder('article')
  .leftJoinAndSelect('article.author', 'author')
  .getMany();
```

---

## 六、实施步骤建议

### 第一阶段：立即执行（今天）
1. ✅ 设置定时重启（1.1 节）
2. ✅ 创建监控脚本（3.1 节）

### 第二阶段：本周内完成
1. ✅ 优化 MySQL 配置（2.2 节）
2. ✅ 设置日志清理（3.4 节）

### 第三阶段：本月内完成
1. ✅ 诊断内存增长原因（第四节）
2. ✅ 优化应用程序代码（第五节）
3. ✅ 建立完整的监控告警体系

---

## 七、常见问题排查

### Q1: 重启后内存还是很快涨上去？
**A:** 说明存在严重的内存泄漏或配置问题，需要：
- 检查是否有未关闭的数据库连接
- 查看慢查询日志，优化性能差的 SQL
- 考虑增加服务器内存

### Q2: 定时重启会影响业务吗？
**A:** 建议选择业务低峰期（如凌晨 2-4 点），重启通常只需几秒到几十秒。

### Q3: 如何判断优化是否有效？
**A:** 观察以下几点：
- 内存增长速度是否变慢
- 重启频率是否可以降低
- 监控日志中的内存峰值是否下降

### Q4: 配置修改后 MySQL 无法启动？
**A:** 
```bash
# 查看错误日志
sudo tail -n 100 /var/log/mysql/error.log

# 恢复备份的配置
sudo cp /etc/mysql/my.cnf.backup.* /etc/mysql/my.cnf
sudo systemctl restart mysql
```

---

## 八、参考资源

- MySQL 官方文档：https://dev.mysql.com/doc/
- MySQL 性能优化最佳实践
- InnoDB 内存管理详解

---

## 九、维护记录

| 日期 | 操作 | 结果 | 备注 |
|------|------|------|------|
|      |      |      |      |
|      |      |      |      |
|      |      |      |      |

---

**最后更新：** 2026-05-19  
**适用版本：** MySQL 8.4.9  
**服务器配置：** 4GB 内存
