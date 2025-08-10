# 构建阶段
ARG PLATFORM=linux/amd64
FROM node:22-alpine AS builder

# 创建工作目录
WORKDIR /app

# 安装pnpm
RUN npm install -g pnpm

# 复制package.json和lock文件
COPY package.json pnpm-lock.yaml ./

# 安装所有依赖，包括开发依赖
RUN pnpm install --frozen-lockfile --prod=false

# 复制源代码
COPY . .

# 直接使用npx调用nest命令进行构建
RUN npx nest build

# 安装ncc
RUN npm install -g @vercel/ncc

# 使用ncc进行minify构建
RUN ncc build ./dist/main.js -o dist_ncc --external pg-cloudflare
RUN node scripts/create-sea.js

# 运行阶段
ARG PLATFORM=linux/amd64
FROM alpine

# 安装必要的依赖
RUN apk add --no-cache \
		libstdc++ \
		bash

WORKDIR /app

# 复制ncc构建产物和必要文件
COPY --from=builder /app/sea-output/* /app
COPY --from=builder /app/config.yml /app/config.yml
COPY --from=builder /app/sql /app/sql

# 设置环境变量
ENV NODE_ENV=production

# 暴露端口
EXPOSE 8180

# 启动应用
CMD ["./nest-app"]