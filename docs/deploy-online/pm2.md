---
outline: deep
---



## PM2部署

## 正文

在完成`MySQL`和`Redis`的部署后，确保我们的项目可以本地访问线上数据。

在之后，我们上传`nestjs`的后端环境压缩包，然后在服务器上装好`node`环境，然后用npm装包。

整个流程其实和本地开发流程大概类似，安装配置好node环境，只是线上要安装PM2工具，用于管理进程。



### 安装node环境

安装完成后也要创建一个软链接才可以全局使用

#### 创建目录

```bash
mkdir -p /server/soft/node
```

#### 安装目录

```bash
cd /server/soft/node
```

#### 下载安装包

下载最新版本的Node.js，这里我用`wget`命令下载，如果不能用，建议查一下其他的linux下载命令。

```bash
wget https://nodejs.org/dist/v20.5.0/node-v20.5.0-linux-x64.tar.xz
```

#### 解压到指定目录

这里我们就解压到

```bash
sudo tar -xJvf node-v20.5.0-linux-x64.tar.xz -C /server/soft/node
```

#### 配置nodejs环境

看了其他人的文档，有人说创建软链接的方式不太好，个人参考那篇文档没跑通。

折腾了一段时间之后，还是选择如下方案，node环境推荐按照当前最新的稳定版本（node20）。

##### 在默认路径中创建对应的软链 (推荐)

```bash
# 创建 node 软链
sudo ln -s /server/soft/node/node-v20.5.0-linux-x64/bin/node /usr/bin/node
# 创建 npm 软链
sudo ln -s /server/soft/node/node-v20.5.0-linux-x64/bin/npm /usr/bin/npm
# 创建 npx 软链
sudo ln -s /server/soft/node/node-v20.5.0-linux-x64/bin/npx /usr/bin/npx
```

- 优点: 创建一次，所有用户均可运行node相关命令
- 缺点: 每增加一个全局node相关命令都要创建软链

##### 移除对应内容

如果要是对应的软连接已经被占用，可以用以下命令移除对应的软连接，再重新执行上边的命令

```bash
sudo rm /usr/bin/node
sudo rm /usr/bin/npm
sudo rm /usr/bin/npx
```

#### 验证版本

如果这里版本验证成功后，到此，`node`安装的流程就算是完成了。

```bash
node -v
npm -v
```



### 安装PM2

安装`pm2`也要添加软连接，因为使用npm下载安装，所以下载目录就在node的`bin`目录下。

#### 安装pm2

```bash
npm install pm2 -g
```

#### 添加软连接

```bash
sudo ln -s /server/soft/node/node-v20.5.0-linux-x64/bin/pm2  /usr/bin/pm2
```



### 启动nest项目

将本地的nest项目打包成tar包，然后传到对应的目录。

不过，如果你nest项目如果是独立的，你也可以考虑直接在服务器上用`git`下载，只不过这么做太费事，我懒得整了，直接本地打包放上去就好。

#### 创建目录

当前目录是用来放nest项目后端的

```bash
mkdir -p /server/soft/nest-admin
```

#### 解压到指定目录

这里我们将对应的压缩包解压到我们刚才创建的目录中

```bash
sudo tar -xvf nest-server.tar -C /server/soft/nest-admin
```

#### 切换目录

这里我们切换到对应的项目目录，然后为npm安装做准备。

```bash
cd /server/soft/nest-admin/server/
```

#### 安装依赖

因为我这里没有多个项目，所以我就不额外安装`pnpm`来做包管理了，直接用`npm`安装包依赖就够了。

```bash
npm install
```

如果要是你喜欢使用pnpm来进行管理，也可以提添加一个pnpm的软连接，方便后续用pnpm管理。

```bash
# 创建 npm 软链
sudo ln -s /server/soft/node/node-v20.5.0-linux-x64/bin/pnpm /usr/bin/pnpm
```



#### 启动项目

```bash
cd /server/soft/nest-admin/server/dist
pm2 start main.js
```

#### 防火墙

我这里是用腾讯云小程序开了防火墙的对应的端口。

#### 访问项目

因为我这里端口是8080，所以我这里就用8080启动项目

```
ip地址:8080/swagger-ui/
```



### pm2相关操作

```
pm2 start app.js # 运行pm2启动项目
pm2 restart app.js # 运行pm2启动项目
pm2 stop app.js # 运行pm2启动项目
pm2 list # 显示所有进程状态
pm2 monit # 监视所有进程
pm2 logs # 显示所有进程日志
pm2 stop all # 停止所有进程
pm2 restart all # 重启所有进程
pm2 reload all # 0 秒停机重载进程 (用于 NETWORKED 进程)
pm2 stop 0 # 停止指定的进程
pm2 restart 0 # 重启指定的进程
pm2 startup # 产生 init 脚本 保持进程活着
pm2 web # 运行健壮的 computer API endpoint (http://localhost:9615)
pm2 delete 0 # 杀死指定的进程
pm2 delete all # 杀死全部进程
```



## 结语

目前项目中的问题还比较多，开发环境可以连接，但是部署到线上，因为没有合适的文档，所以总是会有各种问题。

现在还在艰难排查中，总算是总结出了一套可能并不好用的部署方式。

万里长征现在刚走了第一步，艰难摸索中，希望能有一些好的收获。



## 参考

[nestjs项目打包部署之linux系统上线\]_nestjs部署-CSDN博客](https://blog.csdn.net/lxy869718069/article/details/110185280)

[node.js - 在linux系统上安装和配置nodejs - 箫笛 - 博客园 (cnblogs.com)](https://www.cnblogs.com/xiaodi-js/p/17883906.html)

[【原文】【转】腾讯云OpenCloudOS部署NestJS项目 | 远川的个人博客 (crazystudent13.cn)](https://crazystudent13.cn/2024/09/23/【转】腾讯云OpenCloudOS部署NestJS项目/)
