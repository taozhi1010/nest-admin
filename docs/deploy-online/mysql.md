---
outline: deep
---

# MySQL部署



## 正文

就和win环境一样，我们在服务器上需要先安装，再配置一个软件。

所以，本篇教程分为两个大部分：安装MySQL，配置MySQL。

亲测可用，云服务器系统配置：`OpenCloudOS 9`，2核2G，20mbps的上传带宽。

安装流程顺畅，亲测流程没有什么问题。



### 安装MySQL

很多人不熟悉Linux，安装的主要麻烦就是安装命令。

所以，这里会将每个步骤的命令尽可能的展示，便于大家线上照着流程跑。

#### 创建目录

切换到根目录创建一个用来存mySql的位置。

```
cd /
mkdir -p server/soft/mysql
```

#### 切换目录

```
cd /server/soft/mysql
```

#### 查看自带数据库

有的系统会在镜像安装时候就自带数据库，我们先检测一下

```
rpm -qa l grep mari
```

如果画框中的内容有，则rpm -e --nodeps XXX删除。

比如，我们这里举例。

```
rpm -e --nodeps mariadb-connector-c-3.1.11-2.oc8.1.x86_64

rpm -e --nodeps mariadb-connector-c-config-3.1.11-2.oc8.1.noarch
```

#### 下载MySQL

切换到目录之后，我们先下载MySQL的压缩包

```
wget http://dev.mysql.com/get/mysql-5.7.26-1.el7.x86_64.rpm-bundle.tar
```

#### 解压安装包

```
tar -xvf mysql-5.7.26-1.el7.x86_64.rpm-bundle.tar
```

#### 安装数据库

这里会问你是否同意，y就行了。

```
rpm -ivh mysql-community-common-5.7.26-1.el7.x86_64.rpm
rpm -ivh mysql-community-libs-5.7.26-1.el7.x86_64.rpm
rpm -ivh mysql-community-client-5.7.26-1.el7.x86_64.rpm
rpm -ivh mysql-community-server-5.7.26-1.el7.x86_64.rpm
yum install libncurses*
```

#### 启动并测试连接

```
systemctl start mysqld.service
ps -ef |grep mysql
```

这里只要检测到mySQL的进程，就可以确认是启动成功了。

```
mysql     613867       1  0 21:20 ?        00:00:00 /usr/sbin/mysqld --daemonize --pid-file=/var/run/mysqld/mysqld.pid
root      614796  498031  0 21:22 pts/0    00:00:00 grep --color=auto mysql
```



### 配置MySQL

好了，就像是win上边，我们终于装好mySQL了。

接下来就是配置时间了。

#### 查看密码

```
grep "password" /var/log/mysqld.log
```

这时候，mysql会帮我们生成一个临时密码，如下提示，我们拿到密码。

```
A temporary password is generated for root@localhost: xy?pa,n1o%M-
```

#### 配置密码

系统生成的密码安全性很强，但是也很难记，所以我们可能需要自己改动出一个好记的密码。

输入如下命令后，需要我们输入自己的密码，记得保存。

```
mysql -u root -p
```

#### 修改密码

当我们输入明码，进入mySQL的之后，需要逐行的输入密码

```
set global validate_password_policy=0;
set global validate_password_length=1;
alter user 'root'@'localhost' identified by '你的密码';
```

修改完成之后，我们刷新提交修改内容。

```
flush privileges;
```

**示例如下**，我的密码是123456。

```
mysql> set global validate_password_policy=0;
Query OK, 0 rows affected (0.00 sec)

mysql> set global validate_password_length=1;
Query OK, 0 rows affected (0.00 sec)

mysql> alter user 'root'@'localhost' identified by '123456';
Query OK, 0 rows affected (0.00 sec)

mysql> flush privileges;
Query OK, 0 rows affected (0.00 sec)
```



#### 修改host配置

之前我们的配置默认是指向`localhost`，这里我们需要把`host`改到能给外部访问。

`%`是一个通配符，表示任何主机。

这意味着具有`root`用户名的用户可以从任何IP地址或主机名连接到MySQL服务器。

通过将其`Host`列设置为`%`，这种设置通常用于扩展管理员账户的访问权限，使其不仅限于本地主机。

```
use mysql;
SELECT Host, User FROM user;
UPDATE user SET Host = '%' WHERE User = 'root';
flush privileges;
```

示例如下

```
mysql> use mysql;
Reading table information for completion of table and column names
You can turn off this feature to get a quicker startup with -A

Database changed
mysql> SELECT Host, User FROM user;
+-----------+---------------+
| Host      | User          |
+-----------+---------------+
| localhost | mysql.session |
| localhost | mysql.sys     |
| localhost | root          |
+-----------+---------------+
3 rows in set (0.00 sec)

mysql> UPDATE user SET Host = '%' WHERE User = 'root';
Query OK, 1 row affected (0.00 sec)
Rows matched: 1  Changed: 1  Warnings: 0

mysql> flush privileges;
Query OK, 0 rows affected (0.00 sec)
```



### MySQL忘记密码了怎么办？

这段的操作我不推荐使用，原文的意思是，修改my.cnf配置。

在`skip-grant-tables`配置后，启动MySQL服务器时忽略权限表。

这意味着启动时不需要密码就可以访问数据库。这通常只在恢复或紧急情况下使用，因为这样会使数据库变得不安全。

改完配置文件之后，重新设置密码，然后再删除该

#### 修改配置文件

我们可以通过图形界面直接去`etc`文件夹下修改`my.cnf`。

我们也可以通过命令行去修改，不过需要你稍微了解一下linux命令行编辑的方式。

这里，我们需要在linux的目录下，如果之前还在mySQL路径里边，记得退出来。

```
vi /etc/my.cnf
```

修改配置如下

```
# For advice on how to change settings please see
# http://dev.mysql.com/doc/refman/5.7/en/server-configuration-defaults.html

[mysqld]
#
# Remove leading # and set to the amount of RAM for the most important data
# cache in MySQL. Start at 70% of total RAM for dedicated server, else 10%.
# innodb_buffer_pool_size = 128M
#
# Remove leading # to turn on a very important data integrity option: logging
# changes to the binary log between backups.
# log_bin
#
# Remove leading # to set options mainly useful for reporting servers.
# The server defaults are faster for transactions and fast SELECTs.
# Adjust sizes as needed, experiment to find the optimal values.
# join_buffer_size = 128M
# sort_buffer_size = 2M
# read_rnd_buffer_size = 2M
datadir=/var/lib/mysql
socket=/var/lib/mysql/mysql.sock

# 我们在这里添加我们需要的命令
skip-grant-tables

# Disabling symbolic-links is recommended to prevent assorted security risks
symbolic-links=0

log-error=/var/log/mysqld.log
pid-file=/var/run/mysqld/mysqld.pid
```

编辑完成后，`:wq`退出编辑

保存退出，重启MySQL

```
service mysqld restart
```

#### 登录数据库

```
mysql
```

#### 修改密码刷新权限

```
use mysql;
update user set authentication_string=password('新密码') where user='root';
flush privileges;
exit；
```

删除刚刚新增的命令，这里我们需要再删除配置里边的 `skip-grant-tables`

#### 重新登录

这里我们用新密码重新登录一下，或者是navicat之类的远程工具连一下看看。

只要保证新密码能连接上，那就没问题。

```
mysql -u root -p
```



## 结语

本来打算用docker简单安装一下就算了，但是换了系统之后，之前的流程反而装不上了。

真是麻烦所以干脆自己再走个流程重新装一下。

本来也想选几个8.0版本的MySQL，但是好几个教程都因为各种问题走不下去。

反而是这个低版本的远古教程，居然意外的好用，于是特此记录下，便于后续使用。



## 参考

[在腾讯云服务器OpenCLoudOS系统中安装mysql（有图详解）_opencloudos 安装mysql-CSDN博客](https://blog.csdn.net/weixin_44079964/article/details/132016831)

[通义千问](https://tongyi.aliyun.com/)

[【原文】【转】腾讯云OpenCloudOS部署MySQL | 远川的个人博客 (crazystudent13.cn)](https://crazystudent13.cn/2024/09/13/【转】腾讯云OpenCloudOS部署MySQL/)
