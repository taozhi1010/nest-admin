# 自动部署排障命令速查

## 进入部署目录

```bash
cd /opt/deploy/nest-admin
```

## 查看容器状态

```bash
sudo docker compose ps
```

## 查看最近日志

```bash
sudo docker compose logs --tail=100 server
sudo docker compose logs --tail=100 admin-vue3
```

## 查看前端最终 Nginx 配置

```bash
sudo docker exec nest-admin-vue3 cat /etc/nginx/conf.d/default.conf
```

## 查看后端容器连通性

```bash
sudo docker exec nest-admin-server node -e "const net=require('net'); const targets=[['MYSQL_HOST',process.env.MYSQL_HOST,Number(process.env.MYSQL_PORT||3306)],['REDIS_HOST',process.env.REDIS_HOST,Number(process.env.REDIS_PORT||6379)],['RUSTFS_ENDPOINT',process.env.RUSTFS_ENDPOINT,Number(process.env.RUSTFS_PORT||9000)]]; let i=0; const run=()=>{ if(i>=targets.length) process.exit(0); const [name,host,port]=targets[i++]; const s=net.createConnection({host,port,timeout:5000},()=>{console.log('[OK]',name,host+':'+port); s.destroy(); run();}); s.on('timeout',()=>{console.log('[TIMEOUT]',name,host+':'+port); s.destroy(); run();}); s.on('error',(e)=>{console.log('[ERROR]',name,host+':'+port,e.code||e.message); run();});}; run();"
```

## 查看后端 HTTP 健康状态

```bash
sudo docker exec nest-admin-server node -e "const http=require('http'); const req=http.get('http://127.0.0.1:8080/',res=>{console.log('[HTTP]',res.statusCode); res.resume(); process.exit(0);}); req.on('error',e=>{console.log('[HTTP_ERROR]',e.code||e.message); process.exit(0);}); req.setTimeout(5000,()=>{console.log('[HTTP_TIMEOUT]'); req.destroy(); process.exit(0);});"
```

## 验证前端入口

```bash
curl -I http://127.0.0.1:8888/
curl -I http://127.0.0.1:8888/swagger-ui/
curl -I http://127.0.0.1:8888/openapi.json
```

## 验证验证码接口

```bash
curl -I http://127.0.0.1:8888/api/captchaImage
```

## 验证头像资源

```bash
curl -I http://127.0.0.1:8888/profile/nest-admin/avatar/avatar_1777231586500_nest_admin.png
```

## 常见权限问题

如果 `docker` 报权限不足：

```bash
sudo docker compose ps
```

如果想长期免 `sudo`：

```bash
sudo usermod -aG docker ubuntu
newgrp docker
```

