# 自动部署 Secrets 与环境变量

本文档只记录当前自动部署链路实际使用的变量。

## GitHub Secrets

必须配置：

- `SSH_PRIVATE_KEY`
- `SERVER_HOST`
- `SERVER_PORT`
- `SERVER_USER`
- `DEPLOY_PATH`
- `MYSQL_ROOT_PASSWORD`
- `MYSQL_DATABASE`
- `REDIS_PASSWORD`
- `RUSTFS_ACCESS_KEY`
- `RUSTFS_SECRET_KEY`
- `JWT_SECRETKEY`

## 服务器生成的 `.env`

GitHub Actions 会在服务器部署目录生成：

```env
MYSQL_ROOT_PASSWORD=***
MYSQL_DATABASE=***
MYSQL_HOST=服务器IP
MYSQL_PORT=3306
MYSQL_USERNAME=root
REDIS_HOST=服务器IP
REDIS_PORT=6379
REDIS_PASSWORD=***
REDIS_DB=2
RUSTFS_ENDPOINT=服务器IP
RUSTFS_PORT=9000
RUSTFS_ACCESS_KEY=***
RUSTFS_SECRET_KEY=***
RUSTFS_BUCKET=nest-admin
JWT_SECRETKEY=***
SERVER_PORT=8080
WEB_PORT=8888
DEPLOY_PATH=/opt/deploy/nest-admin
```

## 前端生产环境变量

文件：`admin-vue3/.env.production`

当前有效配置：

```env
VITE_APP_ENV = 'production'
VITE_APP_BASE_API = '/api'
```

这里必须是 `/api`，否则验证码、登录、用户信息等接口会绕过同源代理，直接请求错误地址。

## 后端配置覆盖链路

后端最终配置来源分两层：

1. `server/src/config/env/prod.yml`
2. `server/src/config/index.ts` 里对环境变量的覆盖

当前已接入环境变量覆盖的项：

- `SERVER_PORT`
- `MYSQL_HOST`
- `MYSQL_PORT`
- `MYSQL_USERNAME`
- `MYSQL_PASSWORD`
- `MYSQL_DATABASE`
- `REDIS_HOST`
- `REDIS_PORT`
- `REDIS_PASSWORD`
- `REDIS_DB`
- `RUSTFS_ENDPOINT`
- `RUSTFS_PORT`
- `RUSTFS_ACCESS_KEY`
- `RUSTFS_SECRET_KEY`
- `RUSTFS_BUCKET`
- `JWT_SECRETKEY`

