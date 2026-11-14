# 自动部署最小闭环

本文档只描述当前仓库已经验证可用的一条最小自动部署链路，不展开历史方案。

## 架构

- GitHub Actions 触发部署
- 服务端项目目录：`/opt/deploy/nest-admin`
- 前端容器：`admin-vue3`
- 后端容器：`server`
- MySQL / Redis / RustFS：由 1Panel 在宿主机上提供

## 访问入口

- 前端：`http://服务器IP:8888`
- 后端：`http://服务器IP:8080`
- Swagger UI：`http://服务器IP:8888/swagger-ui/`
- Redoc：`http://服务器IP:8888/docs`
- OpenAPI JSON：`http://服务器IP:8888/openapi.json`

## 当前部署原则

- 后端优先发布，避免前端构建失败阻塞后端上线
- 前端与后端都通过 Docker Compose 管理
- 前端生产环境接口统一走同源 `/api`
- `/profile/` 静态资源由前端 Nginx 直接代理到 RustFS

## 目录与关键文件

- GitHub Actions：`.github/workflows/deploy.yml`
- Compose：`docker-compose.yml`
- 前端 Dockerfile：`admin-vue3/Dockerfile`
- 前端 Nginx：`admin-vue3/nginx.conf`
- 前端生产环境变量：`admin-vue3/.env.production`
- 后端配置合并入口：`server/src/config/index.ts`

## 部署流程

1. 推送到 `feature-1.0` 分支（原 `deploy` 分支已合并进 `feature-1.0` 并删除）。
2. GitHub Actions 通过 SSH 将代码同步到服务器目录。
3. Actions 在服务器生成 `.env`。
4. 单独构建并启动后端容器。
5. 单独构建并启动前端容器。
6. 输出连通性诊断、容器状态和最近日志。

## 当前已验证的关键值

- `MYSQL_HOST=${SERVER_HOST}`
- `REDIS_HOST=${SERVER_HOST}`
- `RUSTFS_ENDPOINT=${SERVER_HOST}`
- 前端 `VITE_APP_BASE_API=/api`

## 不再采用的旧做法

- 不再依赖 Linux 下的 `host.docker.internal` 访问 1Panel 服务
- 不再让前端生产环境直接写死 `http://your-domain.com/api`
- 不再让 Swagger 使用默认的内置相对静态资源路径

