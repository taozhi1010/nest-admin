# 使用 Node.js 18 作为基础镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json (如果有)
COPY package*.json ./

# 安装依赖
RUN npm install --registry=https://registry.npmmirror.com

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 设置环境变量为生产环境
ENV NODE_ENV=production

# 暴露端口
EXPOSE 8080

# 启动应用
CMD ["npm", "run", "start:prod"]
