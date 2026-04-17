# Nest-Admin 项目总览

> 本文档用于帮助 AI 助手快速理解项目结构和业务逻辑，提高开发效率。

## 1. 项目概述

**项目名称**: nest-admin (后端)  
**项目类型**: 企业级后台管理系统后端服务  
**架构模式**: 前后端分离、RESTful API  
**开发语言**: TypeScript  
**核心框架**: NestJS v10  

### 1.1 项目特点
- 基于若依(RuoYi)管理系统的 NestJS 实现
- 完整的 RBAC 权限控制系统
- 支持代码生成、定时任务、操作日志等企业级功能
- 集成游戏内容管理模块（文章、专题）

---

## 2. 技术栈

### 2.1 核心依赖
| 技术 | 版本 | 用途 |
|------|------|------|
| NestJS | ^10.0.0 | 后端框架 |
| TypeORM | ^0.3.20 | ORM 数据库操作 |
| MySQL2 | ^3.6.5 | 数据库驱动 |
| Redis (ioredis) | ^5.4.1 | 缓存和会话管理 |
| JWT (@nestjs/jwt) | ^10.2.0 | Token 认证 |
| Passport | ^0.7.0 | 认证中间件 |
| Swagger | ^7.1.17 | API 文档生成 |
| Winston | ^3.15.0 | 日志记录 |
| Schedule | ^4.1.2 | 定时任务 |

### 2.2 工具库
- **class-validator**: DTO 数据验证
- **class-transformer**: 数据转换
- **bcrypt/bcryptjs**: 密码加密
- **exceljs**: Excel 导入导出
- **archiver**: 文件压缩
- **cos-nodejs-sdk-v5**: 腾讯云 COS 对象存储
- **dayjs**: 日期处理
- **lodash**: 工具函数库

### 2.3 开发工具
- **Node.js**: 18.12.1 (Volta 管理)
- **包管理器**: pnpm (推荐) / npm
- **代码规范**: ESLint + Prettier
- **构建工具**: Nest CLI

---

## 3. 项目结构

```
server/
├── src/
│   ├── common/                 # 公共模块
│   │   ├── constant/          # 常量定义 (business, gen, index)
│   │   ├── decorators/        # 自定义装饰器
│   │   │   ├── apiDataResponse.decorator.ts  # API 响应装饰器
│   │   │   ├── captcha.decorator.ts          # 验证码装饰器
│   │   │   ├── operlog.decorator.ts          # 操作日志装饰器
│   │   │   ├── redis.decorator.ts            # Redis 缓存装饰器
│   │   │   ├── require-permission.decorator.ts  # 权限装饰器
│   │   │   └── require-role.decorator.ts     # 角色装饰器
│   │   ├── dto/               # 通用 DTO
│   │   ├── entities/          # 基础实体类 (BaseEntity, Transformer)
│   │   ├── enum/              # 枚举类型
│   │   ├── filters/           # 异常过滤器
│   │   ├── guards/            # 守卫
│   │   │   ├── auth.guard.ts      # JWT 认证守卫
│   │   │   ├── permission.guard.ts # 权限守卫
│   │   │   └── roles.guard.ts     # 角色守卫
│   │   ├── interceptor/       # 拦截器
│   │   │   └── operlog.interceptor.ts  # 操作日志拦截器
│   │   └── utils/             # 工具函数
│   │       ├── result.ts      # 统一响应格式
│   │       ├── captcha.ts     # 验证码生成
│   │       ├── export.ts      # Excel 导出
│   │       └── api-docs.ts    # API 文档工具
│   │
│   ├── config/                # 配置管理
│   │   ├── env/               # 环境配置文件
│   │   │   ├── dev.yml        # 开发环境配置
│   │   │   └── prod.yml       # 生产环境配置
│   │   ├── index.ts           # 配置加载器
│   │   └── winston.config.ts  # 日志配置
│   │
│   ├── module/                # 业务模块
│   │   ├── backup/            # 备份服务
│   │   │   └── backup.service.ts
│   │   ├── common/            # 通用服务模块
│   │   │   ├── axios/         # HTTP 客户端
│   │   │   ├── redis/         # Redis 服务
│   │   │   └── common.module.ts
│   │   ├── game/              # 游戏业务模块
│   │   │   ├── article/       # 文章管理
│   │   │   │   ├── dto/
│   │   │   │   ├── entities/
│   │   │   │   ├── article.controller.ts
│   │   │   │   ├── article.service.ts
│   │   │   │   └── article.module.ts
│   │   │   └── game.module.ts
│   │   ├── main/              # 主控制器（登录、路由等）
│   │   │   ├── main.controller.ts
│   │   │   ├── main.service.ts
│   │   │   └── main.module.ts
│   │   ├── monitor/           # 系统监控模块
│   │   │   ├── cache/         # 缓存监控
│   │   │   ├── job/           # 定时任务
│   │   │   ├── loginlog/      # 登录日志
│   │   │   ├── online/        # 在线用户
│   │   │   ├── operlog/       # 操作日志
│   │   │   ├── server/        # 服务器监控
│   │   │   └── monitor.module.ts
│   │   ├── system/            # 系统管理模块
│   │   │   ├── auth/          # 认证策略
│   │   │   ├── config/        # 参数配置
│   │   │   ├── dept/          # 部门管理
│   │   │   ├── dict/          # 字典管理
│   │   │   ├── menu/          # 菜单管理
│   │   │   ├── notice/        # 通知公告
│   │   │   ├── post/          # 岗位管理
│   │   │   ├── role/          # 角色管理
│   │   │   ├── tool/          # 系统工具（代码生成）
│   │   │   ├── user/          # 用户管理
│   │   │   └── system.module.ts
│   │   └── upload/            # 文件上传模块
│   │       ├── upload.controller.ts
│   │       ├── upload.service.ts
│   │       └── upload.module.ts
│   │
│   ├── app.module.ts          # 根模块
│   └── main.ts                # 应用入口
│
├── db/
│   └── init.sql               # 数据库初始化脚本
├── dist/                      # 编译输出目录
├── test/                      # 测试文件
├── package.json
├── tsconfig.json
└── nest-cli.json
```

---

## 4. 核心模块详解

### 4.1 系统管理模块 (system)

#### 用户管理 (user)
- **功能**: 用户 CRUD、密码重置、状态管理、导入导出
- **关键文件**: `src/module/system/user/`
- **关联表**: sys_user, sys_user_role, sys_user_post

#### 角色管理 (role)
- **功能**: 角色 CRUD、权限分配、数据范围控制
- **关键文件**: `src/module/system/role/`
- **关联表**: sys_role, sys_role_menu, sys_role_dept

#### 菜单管理 (menu)
- **功能**: 菜单树形结构、权限标识、路由配置
- **关键文件**: `src/module/system/menu/`
- **关联表**: sys_menu

#### 部门管理 (dept)
- **功能**: 组织架构树形管理
- **关键文件**: `src/module/system/dept/`
- **关联表**: sys_dept

#### 字典管理 (dict)
- **功能**: 数据字典类型和数据项管理
- **关键文件**: `src/module/system/dict/`
- **关联表**: sys_dict_type, sys_dict_data

#### 参数配置 (config)
- **功能**: 系统参数动态配置
- **关键文件**: `src/module/system/config/`
- **关联表**: sys_config

#### 代码生成 (tool)
- **功能**: 根据数据库表自动生成前后端代码
- **关键文件**: `src/module/system/tool/`
- **关联表**: gen_table, gen_table_column

### 4.2 监控模块 (monitor)

#### 操作日志 (operlog)
- **功能**: 记录用户操作行为（使用装饰器 + 拦截器）
- **关键文件**: `src/module/monitor/operlog/`
- **装饰器**: `@OperLog()`
- **关联表**: sys_oper_log

#### 登录日志 (loginlog)
- **功能**: 记录用户登录信息（IP、浏览器、操作系统）
- **关键文件**: `src/module/monitor/loginlog/`
- **关联表**: sys_logininfor

#### 定时任务 (job)
- **功能**: 动态任务调度、执行日志
- **关键文件**: `src/module/monitor/job/`
- **关联表**: sys_job, sys_job_log

#### 在线用户 (online)
- **功能**: 查看和管理在线用户（基于 Redis）
- **关键文件**: `src/module/monitor/online/`

#### 缓存监控 (cache)
- **功能**: Redis 缓存查看和管理
- **关键文件**: `src/module/monitor/cache/`

#### 服务器监控 (server)
- **功能**: CPU、内存、磁盘等系统信息
- **关键文件**: `src/module/monitor/server/`

### 4.3 游戏模块 (game)

#### 文章管理 (article)
- **功能**: 游戏文章发布、专栏管理
- **关键文件**: `src/module/game/article/`
- **关联表**: game_article, game_subject

### 4.4 通用模块

#### 认证授权 (auth)
- **JWT 策略**: `src/module/system/auth/auth.strategy.ts`
- **全局守卫**: JwtAuthGuard, RolesGuard, PermissionGuard
- **白名单配置**: `config/env/*.yml` 中的 `perm.router.whitelist`

#### 文件上传 (upload)
- **支持方式**: 本地存储、腾讯云 COS
- **配置项**: `app.file.isLocal`, `cos.*`
- **存储路径**: `../upload` (相对项目根目录)
- **访问地址**: `http://localhost:8080/profile/xxx.jpg`

#### Redis 服务
- **服务类**: `src/module/common/redis/redis.service.ts`
- **用途**: 缓存、会话管理、验证码、在线用户
- **配置**: `config/env/*.yml` 中的 `redis.*`

---

## 5. 数据库设计

### 5.1 系统核心表

| 表名 | 说明 | 关键字段 |
|------|------|----------|
| sys_user | 用户信息表 | user_id, user_name, password, dept_id, status |
| sys_role | 角色信息表 | role_id, role_name, role_key, data_scope |
| sys_menu | 菜单权限表 | menu_id, menu_name, parent_id, perms, menu_type |
| sys_dept | 部门表 | dept_id, dept_name, parent_id, ancestors |
| sys_post | 岗位表 | post_id, post_code, post_name |
| sys_user_role | 用户角色关联 | user_id, role_id |
| sys_role_menu | 角色菜单关联 | role_id, menu_id |
| sys_role_dept | 角色部门关联 | role_id, dept_id |
| sys_user_post | 用户岗位关联 | user_id, post_id |

### 5.2 系统辅助表

| 表名 | 说明 |
|------|------|
| sys_dict_type | 字典类型表 |
| sys_dict_data | 字典数据表 |
| sys_config | 参数配置表 |
| sys_notice | 通知公告表 |
| sys_oper_log | 操作日志表 |
| sys_logininfor | 登录日志表 |
| sys_job | 定时任务表 |
| sys_job_log | 定时任务日志表 |
| sys_upload | 文件上传记录表 |

### 5.3 业务表

| 表名 | 说明 |
|------|------|
| game_info | 游戏信息表 |
| game_article | 游戏文章表 |
| game_subject | 游戏专栏表 |

### 5.4 代码生成表

| 表名 | 说明 |
|------|------|
| gen_table | 代码生成业务表 |
| gen_table_column | 代码生成字段表 |

---

## 6. 安全机制

### 6.1 认证流程
1. 用户登录 → 验证用户名密码 → 生成 JWT Token
2. 后续请求携带 Token → JwtAuthGuard 验证 → 解析用户信息
3. 用户信息存入 request.user

### 6.2 权限控制
- **角色守卫 (RolesGuard)**: 检查用户是否拥有指定角色
- **权限守卫 (PermissionGuard)**: 检查用户是否拥有指定权限标识
- **装饰器**: `@RequireRoles()`, `@RequirePermissions()`

### 6.3 安全措施
- **密码加密**: bcrypt (盐值轮数 10)
- **请求限流**: express-rate-limit
- **Helmet**: 设置安全 HTTP 头
- **CORS**: 跨域配置
- **SQL 注入防护**: TypeORM 参数化查询
- **XSS 防护**: 输入验证和转义

---

## 7. 配置管理

### 7.1 环境配置
- **开发环境**: `src/config/env/dev.yml` (NODE_ENV=development)
- **生产环境**: `src/config/env/prod.yml` (NODE_ENV=production)
- **配置加载**: `src/config/index.ts` 根据 NODE_ENV 自动加载

### 7.2 关键配置项

#### 应用配置 (app)
```yaml
app:
  port: 8080                    # 服务端口
  file:
    isLocal: true               # 是否本地存储
    location: '../upload'       # 文件存储路径
    domain: 'http://localhost:8080'  # 文件访问域名
    serveRoot: '/profile'       # 文件虚拟路径
    maxSize: 10                 # 文件大小限制 (MB)
```

#### 数据库配置 (db.mysql)
```yaml
db:
  mysql:
    host: 'localhost'
    username: 'root'
    password: 'password'
    database: 'nest_admin'
    port: 3306
    synchronize: false          # 禁止自动同步表结构
    logging: true               # 开启 SQL 日志
```

#### Redis 配置 (redis)
```yaml
redis:
  host: 'localhost'
  password: 'password'
  port: 6379
  db: 2
```

#### JWT 配置 (jwt)
```yaml
jwt:
  secretkey: 'you_secretkey'
  expiresin: '1h'               # Token 过期时间
  refreshExpiresIn: '2h'        # 刷新 Token 过期时间
```

#### 权限白名单 (perm.router.whitelist)
无需认证的接口列表，如登录、注册、验证码等。

---

## 8. 开发规范

### 8.1 代码风格
- **缩进**: 2 空格
- **引号**: 单引号
- **分号**: 必须
- **命名**: 
  - 类名: PascalCase (如 `UserService`)
  - 方法/变量: camelCase (如 `getUserList`)
  - 常量: UPPER_SNAKE_CASE (如 `MAX_RETRY_COUNT`)
  - 文件名: kebab-case (如 `user.service.ts`)

### 8.2 模块结构
每个业务模块应包含：
```
module-name/
├── dto/                  # 数据传输对象
│   ├── create.dto.ts    # 创建 DTO
│   ├── update.dto.ts    # 更新 DTO
│   └── query.dto.ts     # 查询 DTO
├── entities/            # 实体类
│   └── xxx.entity.ts
├── xxx.controller.ts    # 控制器
├── xxx.service.ts       # 服务层
└── xxx.module.ts        # 模块定义
```

### 8.3 API 响应格式
统一使用 `Result` 工具类返回：
```typescript
{
  code: 200,              // 状态码
  msg: '操作成功',        // 消息
  data: {}               // 数据
}
```

### 8.4 注释规范
- **所有代码必须包含详细的中文注释**
- 类注释: 说明类的用途
- 方法注释: 说明参数、返回值、功能
- 复杂逻辑: 逐行或逐段说明

---

## 9. 常用命令

### 9.1 开发命令
```bash
# 安装依赖
pnpm install

# 启动开发服务器 (热重载)
pnpm run start:dev

# 启动调试模式
pnpm run start:debug

# 构建生产版本
pnpm run build

# 启动生产版本
pnpm run start:prod
```

### 9.2 代码质量
```bash
# 代码格式化
pnpm run format

# ESLint 检查并修复
pnpm run lint

# 运行单元测试
pnpm run test

# 运行 E2E 测试
pnpm run test:e2e
```

---

## 10. 常见问题与注意事项

### 10.1 启动问题
- **Volta 用户**: 避免使用 Yarn，优先使用 pnpm 或 npm
- **数据库连接**: 确保 MySQL 和 Redis 服务已启动
- **配置检查**: 确认 `dev.yml` 中的数据库和 Redis 配置正确

### 10.2 代码修改后
- **NestJS 特性**: 修改代码后需要重启服务才能生效（即使有热重载）
- **TypeORM 实体**: 新增实体后需重新编译

### 10.3 数据库注意事项
- **禁止使用 system 数据库**: 必须使用 `nest_admin` 或其他自定义数据库名
- **表结构同步**: `synchronize: false`，需手动执行 SQL 或使用迁移

### 10.4 Redis 注意事项
- **密码认证**: 确保 Redis 密码配置正确
- **连接池**: 已配置 KeepAlive 防止连接断开

### 10.5 文件上传
- **Git 忽略**: `upload/` 目录已被 `.gitignore` 忽略
- **测试文件**: 不要提交测试上传的文件

---

## 11. 扩展开发指南

### 11.1 新增业务模块
1. 在 `src/module/` 下创建模块目录
2. 创建 Controller、Service、Module 文件
3. 定义 DTO 和 Entity
4. 在父模块中导入新模块
5. 在 `app.module.ts` 中注册（如需要）

### 11.2 新增 API 接口
1. 在 Controller 中定义路由方法
2. 使用装饰器标注 HTTP 方法和路径
3. 添加权限装饰器（如需要）
4. 调用 Service 层处理业务逻辑
5. 返回统一格式的响应

### 11.3 新增数据库表
1. 在 `db/init.sql` 中添加建表语句
2. 创建对应的 Entity 类
3. 使用代码生成工具生成 CRUD 代码（可选）

### 11.4 新增定时任务
1. 在 `src/module/monitor/job/task.service.ts` 中添加任务方法
2. 使用 `@Cron()` 或 `@Interval()` 装饰器
3. 在数据库中注册任务配置

---

## 12. 项目特色功能

### 12.1 代码生成器
- 根据数据库表自动生成前后端代码
- 支持 CRUD 单表和树形表
- 生成 Entity、DTO、Controller、Service、Module
- 支持 Vue2/Vue3 前端模板

### 12.2 操作日志
- 使用 `@OperLog()` 装饰器标记需要记录的操作
- 自动记录请求参数、返回结果、执行时间
- 支持异步记录，不影响业务性能

### 12.3 数据权限
- 支持多种数据范围：全部、自定义、本部门、本部门及以下
- 基于角色的数据过滤
- 透明集成到查询逻辑中

### 12.4 Excel 导入导出
- 使用 exceljs 库
- 支持模板下载
- 支持大数据量分批处理

---

## 13. 部署说明

### 13.1 环境要求
- Node.js >= 18.12.1
- MySQL >= 5.7
- Redis >= 5.0

### 13.2 部署步骤
1. 安装依赖: `pnpm install`
2. 构建项目: `pnpm run build`
3. 配置环境变量: 修改 `src/config/env/prod.yml`
4. 初始化数据库: 执行 `db/init.sql`
5. 启动服务: `pnpm run start:prod`

### 13.3 Docker 部署
项目根目录包含 `Dockerfile`，可直接构建镜像：
```bash
docker build -t nest-admin .
docker run -p 8080:8080 nest-admin
```

---

## 14. 相关资源

- **NestJS 官方文档**: https://docs.nestjs.com/
- **TypeORM 文档**: https://typeorm.io/
- **若依管理系统**: http://www.ruoyi.vip/
- **项目前端**: nest-admin 前端项目（独立仓库）

---

## 15. 维护记录

| 日期 | 版本 | 说明 |
|------|------|------|
| 2026-04-14 | v1.0 | 初始版本，整理项目总览文档 |

---

**最后更新**: 2026-04-14  
**文档维护**: AI Assistant (Lingma)
