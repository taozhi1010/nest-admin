# 开发环境配置说明

## 📋 环境配置文件

项目使用 Vite 的环境变量系统，配置文件位于 `config/env/` 目录：

- `.env.development` - 开发环境配置
- `.env.staging` - 预发布环境配置
- `.env.production` - 生产环境配置

## 🔧 开发环境配置

### API 代理配置

开发环境的 API 请求会通过 Vite 代理转发到后端服务器：

```javascript
// vite.config.js
server: {
  port: 8888,
  proxy: {
    '/dev-api': {
      target: 'http://localhost:8080',  // 后端服务器地址
      changeOrigin: true,
      rewrite: (p) => p.replace(/^\/dev-api/, '')
    }
  }
}
```

### 环境变量

`.env.development` 文件内容：

```bash
# 页面标题
VITE_APP_TITLE = nest-admin 后台管理系统-开发环境

# 开发环境配置
VITE_APP_ENV = 'development'

# 若依管理系统/开发环境
VITE_APP_BASE_API = '/dev-api'
```

## 🚀 启动开发环境

```bash
pnpm run dev
```

启动后会显示：
```
🔥 mode: development
🔥 VITE_APP_BASE_API: /dev-api
  VITE v8.0.3  ready in xxx ms
  ➜  Local:   http://localhost:8888/
  ➜  Network: http://192.168.x.x:8888/
```

## 📝 使用说明

### 1. API 请求

在代码中使用 `import.meta.env.VITE_APP_BASE_API` 获取 API 基础路径：

```javascript
// 示例：用户列表接口
const response = await request({
  url: `${import.meta.env.VITE_APP_BASE_API}/system/user/list`,
  method: 'get'
})

// 实际请求会被代理到：
// http://localhost:8080/system/user/list
```

### 2. 修改后端地址

如果后端服务不在 `localhost:8080`，需要修改 `vite.config.js`：

```javascript
proxy: {
  '/dev-api': {
    target: 'http://your-backend-host:port',  // 修改这里
    changeOrigin: true,
    rewrite: (p) => p.replace(/^\/dev-api/, '')
  }
}
```

### 3. 端口冲突

如果 8888 端口被占用，Vite 会自动尝试其他端口（如 8889）。

要指定固定端口，修改 `vite.config.js`：

```javascript
server: {
  port: 8888,  // 修改为你想要的端口
  host: true,
  open: true
}
```

## 🔍 验证配置

启动开发环境后，可以通过以下方式验证配置是否正确：

1. **检查控制台输出**
   ```
   🔥 mode: development
   🔥 VITE_APP_BASE_API: /dev-api
   ```

2. **测试 API 请求**
   - 打开浏览器开发者工具
   - 查看 Network 标签
   - 发起任意 API 请求
   - 确认请求被代理到 `http://localhost:8080`

3. **检查环境变量**
   ```javascript
   console.log(import.meta.env.VITE_APP_BASE_API)
   // 输出: /dev-api
   ```

## ⚠️ 注意事项

1. **NODE_ENV 自动设置**
   - Vite 会根据运行的命令自动设置 `NODE_ENV`
   - `pnpm run dev` → `NODE_ENV=development`
   - `pnpm run build:prod` → `NODE_ENV=production`
   - **不要**在 `.env` 文件中手动设置 `NODE_ENV`

2. **环境变量前缀**
   - 只有以 `VITE_` 开头的变量才会暴露给客户端
   - 例如：`VITE_APP_BASE_API` ✅
   - 例如：`APP_BASE_API` ❌

3. **修改配置后重启**
   - 修改 `.env` 文件后需要重启开发服务器
   - 修改 `vite.config.js` 后也需要重启

## 📚 相关文档

- [Vite 环境变量文档](https://cn.vitejs.dev/guide/env-and-mode.html)
- [Vite 代理配置文档](https://cn.vitejs.dev/config/server-options.html#server-proxy)
