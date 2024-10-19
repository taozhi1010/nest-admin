---
outline: deep
---

# Nginx部署



## 正文

完成后端部署之后，我们就可以访问线上接口了，这时候，我们就需要部署nginx了。

和之前一样，我们依然使用之前的服务器，继续在`OpenCloudOS`系统上部署。

在 OpenCloudOS 上安装 Nginx 可以通过包管理器 yum 来完成，因为 OpenCloudOS 与 CentOS 高度兼容，所以你可以使用类似的方法。

以下是通过 yum 来安装 Nginx 的基本步骤。



### 安装启动流程

因为我这台服务器比较干净，所以我这边不考虑切换到任何目录，直接在root目录下进行操作。



#### 更新系统包列表

 在安装任何软件包之前，通常建议先更新

```bash
sudo yum update
```

#### 安装 EPEL 仓库

EPEL（Extra Packages for Enterprise Linux）是一个大型的社区维护的仓库，包含了大量额外的软件包。虽然某些 OpenCloudOS 的版本可能已经预装了 EPEL，但如果你的系统没有，可以这样安装

```bash
sudo yum install epel-release
```

#### 安装 Nginx

使用 yum 来安装 Nginx，这里会问你是否ok，惯例，一路y就可以了。

```bash
sudo yum install nginx
```

#### 启动 Nginx

安装完成后，启动 Nginx 服务

```bash
sudo systemctl start nginx
```

#### 设置开机自启

为了让 Nginx 在每次系统启动时自动启动，你可以启用 Nginx 服务

```bash
sudo systemctl enable nginx
```

#### 检查状态

检查 Nginx 服务是否正在运行，正常情况下会显示 active (running)

```bash
sudo systemctl status nginx
```

#### 访问测试

最后，在浏览器中输入服务器公网 IP 地址，如果一切正常，你应该能看到 Nginx 的默认欢迎页面了。

如果访问不成功，记得去看一下是不是防火墙忘了关。



### 配置重启流程

在上边部署完成之后，我们需要开始进行配置。

#### 查看 nginx 安装目录

```bash
ps -ef | grep nginx
```

#### 查看配置文件 nginx.conf 路径

这条命令也可以用于检查配置文件是否正确。

```bash
nginx -t
```

当然也可以使用 find 命令进行文件查找

```bash
# 从 / 根目录下查找文件名为 nginx.conf 的文件
find / -name nginx.conf
# 从 /etc 目录下查找文件名为 nginx.conf 的文件
find /etc -name nginx.conf
```

#### 按需求配置目录

核心就是server指向目录的问题，这里不管https的事情了。

配置完目录，记得把自己的文件放到自己指定的目录上去。

如果你的前端项目路由是用`history`模式，可能每次刷新页面会跳转到404页面，这是因为`nginx`代理配置的问题。

我们记得要配置`try_files`，这是 Nginx 中的一个非常有用的指令，用于处理静态文件和目录索引，只要配置好就不会有相关问题。

这里不详细展开介绍，感兴趣的朋友可以通过AI提问辅助了解，我个人用通义千问辅助问了一下，效果不错。

```bash
server {
    listen       80;
    server_name  admin.crazystudent13.cn;

    location / {
        root /server/website/dist;
        try_files $uri $uri/ /index.html;
        index index.html;

    }

    error_page 404 /404.html;
        location = /40x.html {
    }

    error_page 500 502 503 504 /50x.html;
        location = /50x.html {
    }
}
```



#### 重启nginx

配置完成后，这时候如果打开自己的目录会发现可能还是nginx的页面，这就需要我们重启一下nginx。

```bash
sudo systemctl restart nginx
```

一般来说，重启是正常成功的，如果出于保险的考虑，可以在看看状态。

```
sudo systemctl status nginx
```

#### 如果遇到问题

- 查看错误日志文件通常可以帮助诊断问题，Nginx的错误日志位置通常在`/var/log/nginx/error.log`

  ```
  tail -f /var/log/nginx/error.log
  ```

- 或者检查Nginx配置是否正确

  ```bash
  sudo nginx -t
  ```



### 访问测试

至此，我们已经完成了所有的部署流程，现在，我们只需要访问对应的项目即可。

```
http://admin.crazystudent13.cn/
```

哦，对了，记得配置好前端的`VITE_APP_BASE_API`，将之改为对应的后端接口路径。

如果不处理好这个配置项，接口访问大概应该是代理当前的前端项目路径。



## 参考

[腾讯轻量服务器 OpenCloudOS 上安装 Nginx - 鄢云峰的个人网站 (yanyunfeng.com)](https://yanyunfeng.com/article/48)

[Linux 查看 nginx 安装目录和配置文件路径 - Ryan_zheng - 博客园 (cnblogs.com)](https://www.cnblogs.com/ryanzheng/p/13124128.html)

[【原文】【转】linux上安装nginx | 远川的个人博客 (crazystudent13.cn)](https://crazystudent13.cn/2024/09/12/【转】linux上安装nginx/)