# 自动部署问题清单

本文档记录本项目这次自动部署中已经真实遇到并确认过的坑。

## 1. 后端容器能启动，但依赖连接失败

现象：

- `server` 容器 `Up`
- 日志里出现 `Redis connect ETIMEDOUT`

根因：

- 容器访问 1Panel 服务时使用了不稳定或错误的宿主机地址

修复：

- 统一改为 `${SERVER_HOST}` 访问宿主机上的 MySQL / Redis / RustFS
- 后端配置增加 `.env` 覆盖链路

## 2. 后端镜像构建失败，`bcrypt` 编译报错

现象：

- `npm install` 在 Docker 构建阶段失败
- `bcrypt` 下载预编译包失败后退回源码编译

根因：

- 项目实际使用的是 `bcryptjs`
- 但依赖中保留了原生 `bcrypt`

修复：

- 移除 `bcrypt`
- 后端镜像改为 `node:20-bookworm-slim`

## 3. 前端构建成功，但验证码接口一直加载中

现象：

- 登录页验证码不出图
- 接口请求地址不对

根因：

- `admin-vue3/.env.production` 里写的是占位值 `http://your-domain.com/api`
- 生产打包后所有请求都发到了错误地址

修复：

- 改为 `VITE_APP_BASE_API = '/api'`
- 放行 `admin-vue3/.env.production` 进入 Git

## 4. Swagger 页面空白或资源加载失败

现象：

- `/swagger-ui/` 能打开
- 但页面空白或资源报错

根因一：

- 默认 Swagger UI 页面使用相对静态资源路径，容易出现双层 `swagger-ui/swagger-ui/...`

修复一：

- 改为自定义 HTML，资源走 CDN，规范文件走 `/openapi.json`

根因二：

- Helmet 的 CSP 未放行 `cdn.jsdelivr.net`

修复二：

- 在后端 CSP 中加入 `cdn.jsdelivr.net`

## 5. Redoc 页面 `Failed to fetch`

现象：

- `/docs` 打开后直接报错

根因：

- Redoc 依赖远程脚本和本地 `/openapi.json`
- 需要分别确认 CDN 与 `/openapi.json` 可达

## 6. 图片地址被拼成 `/api/api/profile/...`

现象：

- 头像请求路径变成 `/api/api/profile/...`

根因：

- 前端图片工具函数把 `/profile/...` 也当成 API 资源追加到了 `VITE_APP_BASE_API`

修复：

- `admin-vue3/src/utils/image.ts` 中将 `/profile`、`/uploads` 视为静态资源路径
- 这些路径不再拼 `/api`

## 7. 图片路径对了，但仍然 404

现象：

- 请求路径已经是 `/profile/nest-admin/...png`
- 但浏览器仍返回 404

根因：

- Nginx 的通用静态正则规则先匹配了 `.png`
- `/profile/` 代理规则没有执行

修复：

- 将
  - `location /uploads/`
  - `location /profile/`
- 改为
  - `location ^~ /uploads/`
  - `location ^~ /profile/`

## 8. 前端容器起不来，`8888` 端口不可连接

现象：

- `curl http://服务器IP:8888` 直接连接失败

根因：

- Nginx 配置中用了 `$RUSTFS_ENDPOINT` 这类变量
- 但 Dockerfile 直接复制到 `conf.d/default.conf`，Nginx 不会自动替换环境变量

修复：

- 前端 Dockerfile 改成使用官方模板路径：
  `COPY nginx.conf /etc/nginx/templates/default.conf.template`

## 9. `/profile/` 双重代理过长

旧链路：

- 前端 Nginx -> 后端 Nest -> RustFS

问题：

- 任一层路径重写不一致都可能 404

当前修复：

- 前端 Nginx 直接代理 `/profile/` 到 RustFS

