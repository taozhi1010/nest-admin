# 配置文件迁移说明

## 📋 迁移概述

本次迁移将项目根目录的配置文件按照功能分类，统一移动到 `config` 文件夹中进行管理。

## 📁 迁移的配置文件

### 1. 开发环境配置 (config/dev/)
- `.prettierrc` - Prettier 格式化规则
- `.prettierignore` - Prettier 忽略文件
- `eslint.config.js` - ESLint v10 扁平化配置
- `tsconfig.json` - TypeScript 编译配置

### 2. 环境配置 (config/env/)
- `.env.development` - 开发环境变量
- `.env.production` - 生产环境变量
- `.env.staging` - 预发布环境变量

### 3. 运维部署配置 (config/ops/)
- `Dockerfile` - Docker 镜像构建配置
- `nginx.conf` - Nginx 服务器配置

## 🔧 配置文件说明

### Vite 配置更新

`vite.config.js` 已更新为从 `config/env/` 目录加载环境变量：

```javascript
// 从 config/env 目录加载环境变量
const env = loadEnv(mode, path.join(process.cwd(), 'config/env'))
```

### 根目录文件

由于各种工具（Vite、ESLint、Prettier、TypeScript）需要从项目根目录读取配置文件，因此：

- `config/` 文件夹保存的是**源文件**
- 根目录的配置文件是通过复制得到的**工作文件**

## 📝 使用方法

### 修改配置文件

建议直接修改 `config` 文件夹中的源文件，然后运行以下命令复制到根目录：

```powershell
# 使用自动化脚本
.\copy-config.ps1

# 或手动复制单个文件
copy "config\dev\.prettierrc" ".prettierrc"
copy "config\dev\.prettierignore" ".prettierignore"
copy "config\dev\eslint.config.js" "eslint.config.js"
copy "config\dev\tsconfig.json" "tsconfig.json"
copy "config\env\.env.development" ".env.development"
copy "config\env\.env.production" ".env.production"
copy "config\env\.env.staging" ".env.staging"
copy "config\ops\Dockerfile" "Dockerfile"
copy "config\ops\nginx.conf" "nginx.conf"
```

### 测试项目

```bash
# 启动开发服务器
npm run dev

# 构建生产环境
npm run build:prod

# 构建预发布环境
npm run build:stage
```

## ✅ 验证清单

- [x] 配置文件已按分类迁移到 `config` 文件夹
- [x] 根目录已复制配置文件以保持项目运行
- [x] `vite.config.js` 已更新以从 `config/ops/` 加载环境变量
- [x] 项目可以正常启动和运行
- [x] 创建了自动化复制脚本 `copy-config.ps1`
- [x] 更新了 README.md 添加使用说明
- [x] 创建了详细的配置说明文档

## 📚 相关文档

- `config/README.md` - 配置文件详细说明
- `README.md` - 项目使用说明
- `MIGRATION.md` - 本迁移文档

## 🎯 迁移优势

1. **结构清晰**: 配置文件按功能分类，一目了然
2. **易于维护**: 集中管理，方便查找和修改
3. **团队协作**: 新成员可以快速了解项目配置结构
4. **版本控制**: 配置文件的变更历史更加清晰

## ⚠️ 注意事项

1. 修改配置文件后，记得运行 `.\copy-config.ps1` 复制到根目录
2. 环境变量文件必须保持 `.env.*` 前缀，以便 Vite 正确加载
3. Git 提交时，确保根目录的配置文件也在版本控制中
