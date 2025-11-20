# Nest-Admin 服务器端项目文档

## 1. 项目概述

Nest-Admin 是一个基于 NestJS 框架开发的企业级后台管理系统服务器端解决方案。该项目提供了完整的用户认证、权限管理、系统监控等功能，采用模块化设计，支持多环境配置，便于开发和部署。

主要特点：
- 基于 NestJS + TypeScript 开发，提供类型安全和开发效率
- 完整的 RBAC 权限管理体系
- 模块化架构设计，功能划分清晰
- 多环境配置管理（开发、测试、生产）
- 集成 Swagger API 文档
- 支持 Redis 缓存
- 支持文件上传与存储（本地或腾讯云 COS）
- 系统监控与日志管理

## 2. 技术栈

### 2.1 核心框架与运行环境

| 技术/框架 | 版本 | 用途 |
|---------|------|------|
| Node.js | ^20.x | 运行环境 |
| NestJS | ^10.0.0 | 核心框架 |
| TypeScript | ^5.1.3 | 编程语言 |
| Express | ^4.x | Web 服务器 |

### 2.2 数据库与缓存

| 技术/框架 | 版本 | 用途 |
|---------|------|------|
| MySQL | ^3.6.5 | 主数据库 |
| Redis | ^5.4.1 | 缓存、会话管理 |
| TypeORM | ^0.3.20 | ORM 框架 |

### 2.3 认证与安全

| 技术/框架 | 版本 | 用途 |
|---------|------|------|
| JWT | ^10.2.0 | 身份认证 |
| Passport | ^0.7.0 | 认证策略 |
| bcryptjs | ^3.0.2 | 密码加密 |
| helmet | ^7.1.0 | Web 安全防护 |
| express-rate-limit | ^7.1.5 | 请求频率限制 |

### 2.4 API 文档与工具

| 技术/框架 | 版本 | 用途 |
|---------|------|------|
| Swagger | ^7.1.17 | API 文档生成 |
| class-validator | ^0.14.1 | 数据验证 |
| js-yaml | ^4.1.0 | 配置文件解析 |

### 2.5 日志与监控

| 技术/框架 | 版本 | 用途 |
|---------|------|------|
| winston | ^3.15.0 | 日志管理 |
| nestjs/schedule | ^4.1.2 | 定时任务 |

## 3. 项目目录结构

```plaintext
server/
├── db/                  # 数据库初始化脚本
├── public/              # 静态资源
├── src/                 # 源代码
│   ├── app.module.ts    # 应用主模块
│   ├── common/          # 公共模块
│   │   ├── constant/    # 常量定义
│   │   ├── decorators/  # 装饰器
│   │   ├── dto/         # 数据传输对象
│   │   ├── entities/    # 公共实体
│   │   ├── enum/        # 枚举类型
│   │   ├── filters/     # 过滤器
│   │   ├── guards/      # 守卫
│   │   ├── interceptor/ # 拦截器
│   │   └── utils/       # 工具函数
│   ├── config/          # 配置文件
│   ├── main.ts          # 应用入口
│   └── module/          # 业务模块
│       ├── backup/      # 备份模块
│       ├── common/      # 通用功能模块
│       ├── main/        # 主模块（认证、路由等）
│       ├── monitor/     # 监控模块
│       ├── system/      # 系统管理模块
│       └── upload/      # 文件上传模块
├── test/                # 测试文件
├── upload/              # 文件上传目录
├── ecosystem.config.cjs # PM2 配置
├── package.json         # 项目依赖
└── tsconfig.json        # TypeScript 配置
```

## 4. 核心功能模块

### 4.1 系统管理模块 (SystemModule)

系统管理模块是整个应用的核心，包含用户、角色、菜单、部门、岗位等基本功能管理。

**子模块：**

- **AuthModule**: 认证相关功能
- **DeptModule**: 部门管理
- **SysConfigModule**: 系统配置
- **DictModule**: 数据字典
- **MenuModule**: 菜单管理
- **NoticeModule**: 通知公告
- **PostModule**: 岗位管理
- **RoleModule**: 角色管理
- **ToolModule**: 工具管理
- **UserModule**: 用户管理

### 4.2 监控模块 (MonitorModule)

监控模块负责系统运行状态监控、日志记录等功能。

**子模块：**

- **JobModule**: 定时任务管理
- **ServerModule**: 服务器监控
- **CacheModule**: 缓存监控
- **LoginlogModule**: 登录日志
- **OnlineModule**: 在线用户
- **OperlogModule**: 操作日志

### 4.3 主模块 (MainModule)

主模块提供系统入口功能，包括登录、注册、获取用户信息和路由等基础接口。

### 4.4 通用模块 (CommonModule)

通用模块提供被其他模块共用的功能组件。

**子模块：**

- **RedisModule**: Redis 缓存服务
- **AxiosModule**: HTTP 客户端服务

### 4.5 文件上传模块 (UploadModule)

处理文件上传、存储和管理功能，支持本地存储和腾讯云 COS。

## 5. 配置管理

### 5.1 配置文件结构

项目采用 YAML 格式的配置文件，根据环境不同自动加载对应的配置：

- **dev.yml**: 开发环境配置
- **test.yml**: 测试环境配置
- **prod.yml**: 生产环境配置

### 5.2 主要配置项

#### 应用配置
```yaml
app:
  prefix: ''           # API 前缀
  port: 8080           # 服务端口
  logger:              # 日志配置
    dir: '../logs'     # 日志目录
  file:                # 文件相关配置
    isLocal: true      # 是否本地文件服务
    location: '../upload' # 文件存储路径
    domain: 'http://localhost:8080' # 文件域名
    serveRoot: '/profile' # 文件访问路径
    maxSize: 10        # 文件大小限制(M)
```

#### 数据库配置
```yaml
db:
  mysql:
    host: '127.0.0.1'  # 数据库主机
    username: 'root'   # 数据库用户
    password: 'password' # 数据库密码
    database: 'nest-admin' # 数据库名
    port: 3306         # 数据库端口
    charset: 'utf8mb4' # 字符集
    synchronize: true  # 是否自动同步表结构
```

#### Redis 配置
```yaml
redis:
  host: 'localhost'    # Redis 主机
  password: 'password' # Redis 密码
  port: 6379           # Redis 端口
  db: 2                # 数据库索引
```

#### JWT 配置
```yaml
jwt:
  secretkey: 'your_secretkey' # JWT 密钥
  expiresin: '1h'       # 令牌有效期
  refreshExpiresIn: '2h' # 刷新令牌有效期
```

## 6. API 设计

### 6.1 认证相关 API

| API路径 | 方法 | 描述 | 权限 |
|---------|------|------|------|
| `/login` | POST | 用户登录 | 公开 |
| `/logout` | POST | 用户登出 | 需认证 |
| `/register` | POST | 用户注册 | 公开 |
| `/captchaImage` | GET | 获取验证码 | 公开 |
| `/getInfo` | GET | 获取用户信息 | 需认证 |
| `/getRouters` | GET | 获取路由信息 | 需认证 |

### 6.2 RESTful API 设计规范

- **资源命名**: 使用名词复数形式（如 `/users`）
- **HTTP方法**: 遵循 RESTful 约定（GET, POST, PUT, DELETE）
- **状态码**: 使用标准 HTTP 状态码
- **请求体**: 使用 JSON 格式
- **响应格式**: 统一的响应结构

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {}
}
```

## 7. 安全机制

### 7.1 认证与授权

- **JWT认证**: 使用 JSON Web Token 进行身份认证
- **角色权限控制**: 实现基于角色的访问控制（RBAC）
- **守卫链**: JwtAuthGuard -> RolesGuard -> PermissionGuard

### 7.2 安全防护

- **请求频率限制**: 防止暴力攻击
- **参数验证**: 使用 class-validator 进行输入验证
- **XSS和CSRF防护**: 使用 helmet 提供安全头部
- **密码加密**: 使用 bcryptjs 加密存储密码

## 8. 运行与部署

### 8.1 本地开发

```bash
# 安装依赖
yarn install

# 开发模式运行
yarn run start:dev

# 构建
yarn run build
```

### 8.2 环境变量

- **NODE_ENV**: 环境标识 (development, test, production)

### 8.3 生产部署

项目使用 PM2 进行生产环境部署，配置文件为 `ecosystem.config.cjs`：

```javascript
module.exports = {
  apps: [
    {
      name: 'nest_admin_server',
      namespace: 'nest_admin_server',
      max_memory_restart: '1024M',
      user: 'www',
      exec_mode: 'fork',
      cwd: '/www/wwwroot/nest-admin-server',
      script: 'dist/main.js',
      args: '',
      watch: false,
      out_file: '/www/wwwlogs/pm2/nest_admin_server/out.log',
      error_file: '/www/wwwlogs/pm2/nest_admin_server/err.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
```

## 9. 系统初始化

### 9.1 数据库初始化

项目在 `db` 目录下提供了初始化 SQL 脚本，用于创建数据库表结构和初始化数据。

### 9.2 默认账号

系统默认初始密码为 `123456`，可通过配置文件中的 `user.initialPassword` 修改。

## 10. 常见问题与排查

### 10.1 数据库连接失败

- 检查配置文件中的数据库连接信息
- 确认数据库服务是否正常运行
- 验证数据库用户权限

### 10.2 Redis 连接问题

- 检查 Redis 服务是否启动
- 验证 Redis 配置信息
- 确认防火墙设置

### 10.3 权限问题

- 确认用户角色和权限配置
- 检查路由白名单配置
- 验证 JWT 令牌是否有效

## 11. 维护与扩展

### 11.1 添加新模块

1. 在 `src/module` 目录下创建新模块
2. 实现控制器、服务和实体
3. 在 `AppModule` 中注册新模块
4. 配置相关权限

### 11.2 日志管理

系统日志存储在配置文件指定的目录中，使用 winston 进行日志管理，支持日志轮转。

### 11.3 定时任务

使用 @nestjs/schedule 实现定时任务，可用于数据清理、备份等操作。

## 12. 总结

Nest-Admin 服务器端项目是一个功能完善的企业级后台管理系统后端框架，采用现代化的技术栈和架构设计，提供了丰富的功能模块和安全机制。项目模块化程度高，易于扩展和维护，适合用于快速构建各类管理系统的后端服务。