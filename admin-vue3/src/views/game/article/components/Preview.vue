<template>
  <el-drawer v-model="drawer.visible" title="文章详情" size="80vw" direction="rtl">
    <!-- {{ form.model.content }} -->
    <!-- <MdViewer v-model="form.model.content" /> -->

    <MdViewer :value="test" />
  </el-drawer>
</template>

<script setup>
import { getArticle } from '@/api/game/Article'
import MdViewer from '@/components/MdViewer'

const drawer = reactive({
  visible: false,
  title: '新增文章'
})

const test =
  "\n## 前言\n\n之前的安装流程是docker安装的，本来感觉很方便，但是不知道为什么，服务器换了系统之后安装流程不行了。\n\n这次索性就简单不用docker安装了，直接用最传统的方式安装配置。\n\n毕竟我对docker还是不够的熟练，所以还是用传统流程安装MySQL。\n\n\u003c!-- more --\u003e\n\n\n\n## 正文\n\n就和win环境一样，我们在服务器上需要先安装，再配置一个软件。\n\n所以，本篇教程分为两个大部分：安装MySQL，配置MySQL。\n\n亲测可用，系统配置：`OpenCloudOS 9`，安装流程顺畅，没有什么问题。\n\n\n\n### 安装MySQL\n\n很多人不熟悉Linux，安装的主要麻烦就是安装命令。\n\n所以，这里重新整理\n\n#### 创建目录\n\n切换到根目录创建一个用来存mySql的位置。\n\n```\ncd /\nmkdir -p server/soft/mysql\n```\n\n#### 切换目录\n\n```\ncd /server/soft/mysql\n```\n\n#### 查看自带数据库\n\n有的系统会在镜像安装时候就自带数据库，我们先检测一下\n\n```\nrpm -qa l grep mari\n```\n\n如果画框中的内容有，则rpm -e --nodeps XXX删除。\n\n比如，我们这里举例。\n\n```\nrpm -e --nodeps mariadb-connector-c-3.1.11-2.oc8.1.x86_64\n\nrpm -e --nodeps mariadb-connector-c-config-3.1.11-2.oc8.1.noarch\n```\n\n#### 下载MySQL\n\n切换到目录之后，我们先下载MySQL的压缩包\n\n```\nwget http://dev.mysql.com/get/mysql-5.7.26-1.el7.x86_64.rpm-bundle.tar\n```\n\n#### 解压安装包\n\n```\ntar -xvf mysql-5.7.26-1.el7.x86_64.rpm-bundle.tar\n```\n\n#### 安装数据库\n\n这里会问你是否同意，y就行了。\n\n```\nrpm -ivh mysql-community-common-5.7.26-1.el7.x86_64.rpm\nrpm -ivh mysql-community-libs-5.7.26-1.el7.x86_64.rpm\nrpm -ivh mysql-community-client-5.7.26-1.el7.x86_64.rpm\nrpm -ivh mysql-community-server-5.7.26-1.el7.x86_64.rpm\nyum install libncurses*\n```\n\n#### 启动并测试连接\n\n```\nsystemctl start mysqld.service\nps -ef |grep mysql\n```\n\n这里只要检测到mySQL的进程，就可以确认是启动成功了。\n\n```\nmysql     613867       1  0 21:20 ?        00:00:00 /usr/sbin/mysqld --daemonize --pid-file=/var/run/mysqld/mysqld.pid\nroot      614796  498031  0 21:22 pts/0    00:00:00 grep --color=auto mysql\n```\n\n\n\n### 配置MySQL\n\n好了，就像是win上边，我们终于装好mySQL了。\n\n接下来就是配置时间了。\n\n#### 查看密码\n\n```\ngrep \"password\" /var/log/mysqld.log\n```\n\n这时候，mysql会帮我们生成一个临时密码，如下提示，我们拿到密码。\n\n```\nA temporary password is generated for root@localhost: xy?pa,n1o%M-\n```\n\n#### 配置密码\n\n系统生成的密码安全性很强，但是也很难记，所以我们可能需要自己改动出一个好记的密码。\n\n输入如下命令后，需要我们输入自己的密码，记得保存。\n\n```\nmysql -u root -p\n```\n\n#### 修改密码\n\n当我们输入明码，进入mySQL的之后，需要逐行的输入密码\n\n```\nset global validate_password_policy=0;\nset global validate_password_length=1;\nalter user 'root'@'localhost' identified by '你的密码';\n```\n\n修改完成之后，我们刷新提交修改内容。\n\n```\nflush privileges;\n```\n\n**示例如下**，我的密码是123456。\n\n```\nmysql\u003e set global validate_password_policy=0;\nQuery OK, 0 rows affected (0.00 sec)\n\nmysql\u003e set global validate_password_length=1;\nQuery OK, 0 rows affected (0.00 sec)\n\nmysql\u003e alter user 'root'@'localhost' identified by '123456';\nQuery OK, 0 rows affected (0.00 sec)\n\nmysql\u003e flush privileges;\nQuery OK, 0 rows affected (0.00 sec)\n```\n\n\n\n#### 修改host配置\n\n之前我们的配置默认是指向`localhost`，这里我们需要把`host`改到能给外部访问。\n\n`%`是一个通配符，表示任何主机。\n\n这意味着具有`root`用户名的用户可以从任何IP地址或主机名连接到MySQL服务器。\n\n通过将其`Host`列设置为`%`，这种设置通常用于扩展管理员账户的访问权限，使其不仅限于本地主机。\n\n```\nuse mysql;\nSELECT Host, User FROM user;\nUPDATE user SET Host = '%' WHERE User = 'root';\nflush privileges;\n```\n\n示例如下\n\n```\nmysql\u003e use mysql;\nReading table information for completion of table and column names\nYou can turn off this feature to get a quicker startup with -A\n\nDatabase changed\nmysql\u003e SELECT Host, User FROM user;\n+-----------+---------------+\n| Host      | User          |\n+-----------+---------------+\n| localhost | mysql.session |\n| localhost | mysql.sys     |\n| localhost | root          |\n+-----------+---------------+\n3 rows in set (0.00 sec)\n\nmysql\u003e UPDATE user SET Host = '%' WHERE User = 'root';\nQuery OK, 1 row affected (0.00 sec)\nRows matched: 1  Changed: 1  Warnings: 0\n\nmysql\u003e flush privileges;\nQuery OK, 0 rows affected (0.00 sec)\n```\n\n\n\n### MySQL忘记密码了怎么办？\n\n这段的操作我不推荐使用，原文的意思是，修改my.cnf配置。\n\n在`skip-grant-tables`配置后，启动MySQL服务器时忽略权限表。\n\n这意味着启动时不需要密码就可以访问数据库。这通常只在恢复或紧急情况下使用，因为这样会使数据库变得不安全。\n\n改完配置文件之后，重新设置密码，然后再删除该\n\n#### 修改配置文件\n\n我们可以通过图形界面直接去`etc`文件夹下修改`my.cnf`。\n\n我们也可以通过命令行去修改，不过需要你稍微了解一下linux命令行编辑的方式。\n\n这里，我们需要在linux的目录下，如果之前还在mySQL路径里边，记得退出来。\n\n```\nvi /etc/my.cnf\n```\n\n修改配置如下\n\n```\n# For advice on how to change settings please see\n# http://dev.mysql.com/doc/refman/5.7/en/server-configuration-defaults.html\n\n[mysqld]\n#\n# Remove leading # and set to the amount of RAM for the most important data\n# cache in MySQL. Start at 70% of total RAM for dedicated server, else 10%.\n# innodb_buffer_pool_size = 128M\n#\n# Remove leading # to turn on a very important data integrity option: logging\n# changes to the binary log between backups.\n# log_bin\n#\n# Remove leading # to set options mainly useful for reporting servers.\n# The server defaults are faster for transactions and fast SELECTs.\n# Adjust sizes as needed, experiment to find the optimal values.\n# join_buffer_size = 128M\n# sort_buffer_size = 2M\n# read_rnd_buffer_size = 2M\ndatadir=/var/lib/mysql\nsocket=/var/lib/mysql/mysql.sock\n\n# 我们在这里添加我们需要的命令\nskip-grant-tables\n\n# Disabling symbolic-links is recommended to prevent assorted security risks\nsymbolic-links=0\n\nlog-error=/var/log/mysqld.log\npid-file=/var/run/mysqld/mysqld.pid\n```\n\n编辑完成后，`:wq`退出编辑\n\n保存退出，重启MySQL\n\n```\nservice mysqld restart\n```\n\n#### 登录数据库\n\n```\nmysql\n```\n\n#### 修改密码刷新权限\n\n```\nuse mysql;\nupdate user set authentication_string=password('新密码') where user='root';\nflush privileges;\nexit；\n```\n\n删除刚刚新增的命令，这里我们需要再删除配置里边的 `skip-grant-tables`\n\n#### 重新登录\n\n这里我们用新密码重新登录一下，或者是navicat之类的远程工具连一下看看。\n\n只要保证新密码能连接上，那就没问题。\n\n```\nmysql -u root -p\n```\n\n\n\n## 结语\n\n本来打算用docker简单安装一下就算了，但是换了系统之后，之前的流程反而装不上了。\n\n真是麻烦所以干脆自己再走个流程重新装一下。\n\n本来也想选几个8.0版本的MySQL，但是好几个教程都因为各种问题走不下去。\n\n反而是这个低版本的远古教程，居然意外的好用，于是特此记录下，便于后续使用。\n\n\n\n## 参考\n\n[在腾讯云服务器OpenCLoudOS系统中安装mysql（有图详解）_opencloudos 安装mysql-CSDN博客](https://blog.csdn.net/weixin_44079964/article/details/132016831)\n\n[通义千问](https://tongyi.aliyun.com/)\n"

const form = reactive({
  model: {}
})

const handleOpen = (row) => {
  drawer.visible = true
  const articleId = row.articleId || ids.value
  getArticle(articleId).then((res) => {
    console.log(res, '测试>>>')
    form.model = res.data
    drawer.title = '修改文章'
  })
}
const handleClose = () => {
  drawer.visible = false
}

defineExpose({
  handleOpen,
  handleClose
})
</script>

<style lang="scss" scoped></style>
