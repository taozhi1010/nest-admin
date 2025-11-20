# 前端项目指南

## 1. 项目概述

Nest-Admin 前端项目是一个基于 Vue 3 + Vite + Element Plus 构建的现代化管理系统前端框架，提供了完整的权限管理、用户管理、系统配置等功能。

## 2. 技术栈

| 技术 | 版本 | 描述 |
| --- | --- | --- |
| Vue | 3.2.45 | 前端框架 |
| Vite | 3.2.3 | 构建工具 |
| Element Plus | 最新 | UI 组件库 |
| Element Plus Icons Vue | 2.0.10 | 图标库 |
| Vue Router | 4.1.4 | 路由管理 |
| Pinia | 2.0.22 | 状态管理 |
| Axios | 0.27.2 | HTTP 客户端 |
| Dayjs | ^1.11.13 | 日期处理库 |
| ECharts | 5.4.0 | 图表库 |
| Vue Quill | 1.1.0 | 富文本编辑器 |
| Clipboard | ^2.0.11 | 剪贴板工具 |

## 3. 目录结构

```
├── App.vue                    # 根组件
├── api/                       # API 接口定义
│   ├── login.js              # 登录相关接口
│   ├── menu.js               # 菜单相关接口
│   ├── monitor/              # 监控模块接口
│   ├── system/               # 系统模块接口
│   └── tool/                 # 工具模块接口
├── assets/                    # 静态资源
│   ├── draggable/            # 表单拖拽组件
│   ├── icons/                # SVG 图标
│   └── styles/               # 全局样式
├── components/                # 自定义组件
│   ├── Breadcrumb/           # 面包屑组件
│   ├── Pagination/           # 分页组件
│   ├── RightToolbar/         # 右侧工具栏
│   ├── SvgIcon/              # SVG 图标组件
│   └── TreeSelect/           # 树选择组件
├── directive/                 # 自定义指令
├── layout/                    # 布局组件
├── main.js                    # 项目入口文件
├── permission.js              # 权限控制
├── plugins/                   # 插件
├── router/                    # 路由配置
├── store/                     # 状态管理
│   ├── index.js              # Pinia 实例
│   └── modules/              # 状态模块
├── utils/                     # 工具函数
└── views/                     # 页面组件
    ├── error/                # 错误页面
    ├── login.vue             # 登录页面
    ├── index.vue             # 首页
    ├── monitor/              # 监控模块页面
    └── system/               # 系统模块页面
```

## 4. 核心功能模块

### 4.1 路由管理

路由分为公共路由和动态路由：

- **公共路由**：无需权限即可访问的页面，如登录页、404 页等
- **动态路由**：基于用户权限动态加载的页面

路由配置支持角色和权限控制，通过 `meta.roles` 和 `meta.permissions` 定义访问权限。

### 4.2 状态管理

使用 Pinia 进行状态管理，主要包含以下模块：

- `app.js`：应用状态，如侧边栏折叠状态、设备类型等
- `user.js`：用户信息，如用户名、角色、权限等
- `permission.js`：权限信息，如路由表、菜单列表等
- `settings.js`：系统设置，如主题色、布局模式等
- `tagsView.js`：标签页视图管理
- `dict.js`：字典数据管理

### 4.3 权限控制

权限控制通过 `permission.js` 实现，主要功能包括：

1. 路由守卫：控制页面访问权限
2. 按钮权限：通过自定义指令 `v-permission` 控制按钮显示
3. 角色权限：基于用户角色过滤路由和菜单

### 4.4 API 接口

API 接口按功能模块组织，主要模块包括：

- **login**：登录相关接口
- **menu**：菜单相关接口
- **system**：系统管理接口（用户、角色、部门、菜单等）
- **monitor**：监控管理接口（操作日志、登录日志、系统监控等）
- **tool**：工具管理接口（代码生成、表单构建等）

### 4.5 自定义组件

项目提供了丰富的自定义组件，如：

- `Pagination`：分页组件
- `FileUpload`/`ImageUpload`：文件/图片上传组件
- `Editor`：富文本编辑器组件
- `TreeSelect`：树选择组件
- `DictTag`：字典标签组件

## 5. 项目配置

### 5.1 环境配置

项目使用 Vite 的环境变量配置，支持以下环境：

- **开发环境**：`.env.development`
- **生产环境**：`.env.production`
- **测试环境**：`.env.staging`

### 5.2 系统设置

系统设置通过 `src/settings.js` 配置，主要包括：

- 网站标题、LOGO
- 菜单布局模式（左侧菜单、顶部菜单、混合菜单）
- 是否显示面包屑
- 是否固定头部
- 是否启用标签页

## 6. 运行和构建

### 6.1 开发环境

```bash
npm run dev
```

### 6.2 生产构建

```bash
npm run build:prod
```

### 6.3 测试环境构建

```bash
npm run build:stage
```

### 6.4 预览构建结果

```bash
npm run preview
```

## 7. 核心文件说明

### 7.1 main.js

项目入口文件，主要功能包括：

- 导入并注册全局组件
- 配置 Element Plus 组件库
- 挂载全局方法和工具函数
- 配置路由和状态管理
- 初始化应用

### 7.2 permission.js

权限控制文件，主要功能包括：

- 路由守卫配置
- 动态路由加载
- 权限验证逻辑

### 7.3 layout/index.vue

系统布局组件，主要功能包括：

- 侧边栏菜单
- 顶部导航栏
- 面包屑导航
- 标签页视图
- 内容区域

### 7.4 api/request.js

API 请求封装，主要功能包括：

- 请求拦截器：添加 token、设置请求头等
- 响应拦截器：处理响应数据、统一错误处理等
- 请求方法封装：GET、POST、PUT、DELETE 等

## 8. 开发规范

### 8.1 组件命名

- 组件名称使用 PascalCase 命名法
- 通用组件放在 `components/` 目录下
- 页面组件放在 `views/` 目录下

### 8.2 API 命名

- API 模块按功能模块组织
- 接口方法使用动词 + 名词命名法，如 `getUserList`、`createUser`

### 8.3 样式命名

- 使用 SCSS 预处理器
- 全局样式放在 `assets/styles/` 目录下
- 组件样式使用 scoped 属性

## 9. 总结

Nest-Admin 前端项目是一个功能完善、结构清晰的现代化管理系统前端框架，基于 Vue 3 + Vite + Element Plus 构建，提供了完整的权限管理、用户管理、系统配置等功能。项目采用模块化设计，代码结构清晰，易于扩展和维护。