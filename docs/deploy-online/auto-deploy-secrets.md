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

## 邮件功能（可选）

注册页邮箱验证码为可选能力。以下 Secrets 全部不配置时，Compose 会兜底 `MAIL_ENABLED=false`，注册页继续使用图片验证码，不影响其他功能。

- `MAIL_ENABLED`：设为 `true` 才启用
- `MAIL_HOST`：SMTP 服务器地址，如 `smtp.qq.com`
- `MAIL_USER`：发件邮箱账号
- `MAIL_PASS`：SMTP 授权码（QQ / 163 等填授权码，不是邮箱登录密码）
- `MAIL_FROM`：发件人展示，可留空，留空时使用 `MAIL_USER`

`MAIL_PORT` 与 `MAIL_SECURE` 不走 Secrets，工作流固定写入 `465` 和 `true`（SSL）。如需改用 587（STARTTLS），要同时修改 `.github/workflows/deploy.yml` 与 `docker-compose.yml` 中的对应值。

真正启用的条件是：`MAIL_ENABLED=true` 且 `MAIL_HOST`、`MAIL_USER`、`MAIL_PASS` 都非空；缺任意一项都会回落到图片验证码。

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
MAIL_ENABLED=***
MAIL_HOST=***
MAIL_PORT=465
MAIL_SECURE=true
MAIL_USER=***
MAIL_PASS=***
MAIL_FROM=***
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
- `MAIL_ENABLED`
- `MAIL_HOST`
- `MAIL_PORT`
- `MAIL_SECURE`
- `MAIL_USER`
- `MAIL_PASS`
- `MAIL_FROM`

