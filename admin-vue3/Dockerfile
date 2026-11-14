# 第一阶段：构建
FROM node:20-alpine AS builder

WORKDIR /app

# 安装 pnpm（锁定主版本，避免 latest 升级后构建行为变化）
RUN npm install -g pnpm@10

# 复制 package.json 和 pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# 安装依赖（依赖构建脚本白名单见 package.json 的 pnpm.onlyBuiltDependencies）
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 构建项目（生产环境）
RUN pnpm build:prod

# 第二阶段：使用 Nginx 提供静态文件服务
FROM nginx:alpine

# 复制自定义 Nginx 配置
COPY nginx.conf /etc/nginx/templates/default.conf.template

# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 暴露 80 端口
EXPOSE 80

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]
