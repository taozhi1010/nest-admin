# 构建阶段
FROM node:18-alpine as build-stage

WORKDIR /app

COPY package*.json ./

RUN npm install --registry=https://registry.npmmirror.com

COPY . .

RUN npm run build:prod

# 生产阶段
FROM nginx:stable-alpine as production-stage

COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
