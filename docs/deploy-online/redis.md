---
outline: deep
---

# Redis部署

## 正文

我们在配置完MySQL之后，按照之前的目录，我们继续完成redis的安装。

服务器系统配置依旧是`OpenCloudOS 9`，接着上边的服务器配置，我们继续将Redis也部署到刚才的服务器上。



### 安装流程

这里图省事，用命令行创建了目录，你也可以根据自己需求，用SSH工具自行创建。

#### 创建下载目录

```
cd /
mkdir -p server/soft/redis
```

切换到下载目录

```
cd /server/soft/redis
```



#### 下载并解压安装

这里用wget命令下载，有的系统可能不支持`wget`命令，总之是去下对应的压缩包就好。

```
wget https://download.redis.io/releases/redis-7.0.1.tar.gz
```

##### 解压

```
tar -xvf redis-7.0.1.tar.gz
```

##### 编译

这里我需要先切到对应的解压后的目录下，然后才能解压。

我们先切换到已经解压好的目录。

```
cd /server/soft/redis/redis-7.0.1
```

##### 编译redis

```
make
```

##### 安装Redis

使用以下命令将编译后的Redis安装到系统中。

```
make install
```

#### 版本验证

```
redis-server --version
```

只要出现类似如下内容，就代表成功

```
Redis server v=7.0.1 sha=00000000:0 malloc=jemalloc-5.2.1 bits=64 build=cb8ffba948693cc7
```





### 配置流程

经过上边的流程，我们已经安装完了redis。

接下来我们要去改配置，可能有人不清楚自己要改的配置文件在哪。

这里我们可以用linux自带的命令查找对应的配置文件。

#### 找到配置

```
find / -name "redis.conf"
```

然后，我们切换到对应的目录。

这里以我为例，我找到之后，按照目录输出内容。

```
cd /server/soft/redis/redis-7.0.1/
ls redis.conf
```

#### 修改配置

之前我们说过Redis，这里我们就不再讲了，而且，我们这里只是做必要的修改，大多配置我们不必去修改。

这里，我们只要改一条配置：`bind`，我们需要`bind`属性，允许外部访问当前服务器上的redis。

修改配置太多，使用命令行修改太麻烦，我建议大家用SSH工具直接打开配置文件。

默认情况下，Redis监听所有网络接口（0.0.0.0），也有的默认绑定（127.0.0.1）。

我们打开`redis.conf`，注释掉bind就可以

```
# bind 127.0.0.1
```

同时，配置一下redis密码，比如我这里配置123456为密码。

```bash
requirepass 123456
```



### 启动redis

切换到对应的redis目录，然后启动redis

```
cd /server/soft/redis/redis-7.0.1/
```

启动redis

```
redis-server redis.conf
```



### 修改防火墙配置

为了确保外部流量可以到达Redis服务器，你需要配置防火墙来开放相应的端口。

和MySQL需要打开`3306`的端口的一样，redis如果没有进行端口配置的话，默认应该是`6379`的端口。

于是，我们也需要关闭对应端口的防火墙，这里可以用腾讯云自带的防火墙配置，当然，我们也可以用如下的命令来配置。

这里，我们需要安装`ufw`来关闭防火墙。

#### 配置准备

我之前抄的文档用的是`apt`命令配置，但因为我的系统是`OpenCloudOS`，所以这里无法使用`apt`。

如果你遇到了 `apt: command not found` 的错误，这通常意味着你当前使用的Linux发行版可能不是基于Debian的系统，或者是某个环境变量问题导致 apt 命令无法找到。

不同的Linux发行版使用不同的包管理系统，对于基于Red Hat的系统（如CentOS、Fedora、RHEL），可以使用`yum`命令来安装。

在打开防火墙端口之前，我们需要先安装并启动`ufw`，如下，我们先准备一下。

#### 更新软件包

```
yum update
```

#### 安装UFW

```
yum install ufw
```

#### 启用UFW

```
yum enable ufw
```

#### 打开防火墙

```
ufw allow 6379/tcp
```



### 测试连接

大多数人应该都有自己习惯的数据库连接工具，这里我个人推荐用：[Navicat Premium Lite 17](https://www.navicat.com.cn/download/navicat-premium-lite)。

相对于其他的数据库连接工具，Navicat简单易操作，界面干净美观，且算是这几年市场上的流行工具。

虽然分为免费版和付费版，但是免费版提供的功能足够用户去使用。

这里具体的流程我就不教了，因为太简单。

总之，和MySQL一样，我们配置一个新的redis连接，配置完成后，点击测试连接。

测试成功，至此，redis部署流程完成。



### redis常用命令

有些时候，我们可能因为各种原因要停止或者重启，我们可以用如下命令重启redis。

```
systemctl restart redis
```



## 结语

redis的部署与使用并非什么麻烦事儿，但是没有一个靠谱的文档，这个流程就会变得极为麻烦。

所以，我特此整理了此文档，便于下次再服务器上部署该流程。




## 参考

[手把手安装部署Redis-腾讯云开发者社区-腾讯云 (tencent.com)](https://cloud.tencent.com/developer/article/2358816)

[通义千问](https://tongyi.aliyun.com/qianwen/)

[【原文】【转】腾讯云OpenCloudOS部署redis | 远川的个人博客 (crazystudent13.cn)](https://crazystudent13.cn/2024/09/14/【转】腾讯云OpenCloudOS部署redis/)
