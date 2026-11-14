# 使用 Node.js 20 作为基础镜像
FROM node:20-bookworm-slim

# 设置工作目录
WORKDIR /app

# 安装 pnpm（与 pnpm-lock.yaml 的 v9 格式匹配）
RUN npm install -g pnpm@9 --registry=https://mirrors.cloud.tencent.com/npm/

# 复制依赖清单
COPY package.json pnpm-lock.yaml ./

# 按锁定版本安装依赖，避免镜像源元数据异常导致 npm 解析失败
RUN pnpm install --frozen-lockfile --registry=https://mirrors.cloud.tencent.com/npm/

# 复制源代码
COPY . .

# 构建应用
RUN pnpm build

# 设置环境变量为生产环境
ENV NODE_ENV=production

# 暴露端口
EXPOSE 8080

# 启动应用
CMD ["pnpm", "start:prod"]
