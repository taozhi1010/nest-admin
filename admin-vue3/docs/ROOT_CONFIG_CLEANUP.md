# 根目录配置文件清理说明

## 📋 清理概述

移除根目录中已从 `config` 文件夹迁移的配置文件，实现配置文件的统一管理和维护。

## 🗑️ 已删除的文件

以下文件已从根目录移除，源文件位于 `config/` 目录中：

### 1. 格式化配置（2 个）
- ❌ `.prettierrc` → ✅ `config/dev/.prettierrc`
- ❌ `.prettierignore` → ✅ `config/dev/.prettierignore`

### 2. 开发环境配置（2 个）
- ❌ `eslint.config.js` → ✅ `config/dev/eslint.config.js`
- ❌ `tsconfig.json` → ✅ `config/dev/tsconfig.json`

### 3. 环境变量配置（3 个）
- ❌ `.env.development` → ✅ `config/env/.env.development`
- ❌ `.env.production` → ✅ `config/env/.env.production`
- ❌ `.env.staging` → ✅ `config/env/.env.staging`

### 4. 运维部署配置（2 个）
- ❌ `Dockerfile` → ✅ `config/ops/Dockerfile`
- ❌ `nginx.conf` → ✅ `config/ops/nginx.conf`

**共计删除：9 个配置文件**

## 📁 当前根目录结构

```
admin-vue3/
├── .gitignore              # Git 忽略规则（保留）
├── README.md               # 项目说明（保留）
├── auto-imports.d.ts       # 自动导入类型（保留）
├── components.d.ts         # 组件类型声明（保留）
├── copy-config.ps1         # 配置复制脚本（保留）
├── index.html              # HTML 入口（保留）
├── package.json            # 项目依赖（保留）
├── pnpm-lock.yaml          # 依赖锁定（保留）
├── test-api.ps1            # API 测试脚本（保留）
├── vite.config.js          # Vite 配置（保留）
│
├── config/                 # 配置文件源文件目录 ✨
│   ├── dev/               # 开发工具配置
│   ├── env/               # 环境配置
│   └── ops/               # 运维部署配置
│
└── ... (其他目录和文件)
```

## 🔧 如何使用

### 方式一：使用自动化脚本（推荐）

```powershell
# 一键复制所有配置文件到根目录
.\copy-config.ps1
```

### 方式二：手动复制单个文件

```powershell
# 开发配置
copy "config\dev\.prettierrc" ".prettierrc"
copy "config\dev\.prettierignore" ".prettierignore"
copy "config\dev\eslint.config.js" "eslint.config.js"
copy "config\dev\tsconfig.json" "tsconfig.json"

# 环境配置
copy "config\env\.env.development" ".env.development"
copy "config\env\.env.production" ".env.production"
copy "config\env\.env.staging" ".env.staging"

# 运维配置
copy "config\ops\Dockerfile" "Dockerfile"
copy "config\ops\nginx.conf" "nginx.conf"
```

## 💡 管理策略

### ✅ 优点

| 优点 | 说明 |
|------|------|
| **统一管理** | 所有配置文件集中在 `config/` 目录 |
| **结构清晰** | 按功能分类，易于查找和修改 |
| **版本控制** | Git 只需跟踪 `config/` 中的源文件 |
| **减少混乱** | 根目录更简洁，只显示核心文件 |

### 📝 注意事项

1. **首次克隆项目后**：
   ```powershell
   # 运行一次复制脚本，将配置文件复制到根目录
   .\copy-config.ps1
   ```

2. **修改配置文件时**：
   - ✅ 直接修改 `config/` 目录中的源文件
   - ✅ 运行 `.\copy-config.ps1` 复制到根目录
   - ❌ 不要直接修改根目录的配置文件

3. **Git 提交**：
   - ✅ 提交 `config/` 中的源文件
   - ⚠️ 根目录的配置文件可以选择性提交（建议不提交）

## 🎯 最佳实践

### 推荐的 Git 策略

**方案 A：只提交 config 源文件（推荐）**

在 `.gitignore` 中添加：
```gitignore
# 忽略从 config 复制的配置文件
.prettierrc
.prettierignore
eslint.config.js
tsconfig.json
.env.*
Dockerfile
nginx.conf
```

**方案 B：同时提交**

如果团队需要，也可以同时提交源文件和根目录文件。

### 工作流程

```mermaid
graph LR
    A[修改 config/中的源文件] --> B[运行 copy-config.ps1]
    B --> C[配置文件复制到根目录]
    C --> D[项目正常运行]
    D --> E[提交 config/中的更改]
```

## ✅ 验证清单

- [x] 9 个配置文件已从根目录移除
- [x] `config/` 目录包含所有源文件
- [x] `copy-config.ps1` 脚本正常工作
- [x] README.md 已更新说明
- [x] config/README.md 已更新说明
- [x] 项目可正常启动和运行

## 📚 相关文档

- `config/README.md` - 配置文件详细说明
- `README.md` - 项目使用说明
- `docs/CONFIG_MIGRATION.md` - 配置文件迁移总览
- `docs/DEV_DIR_MERGE.md` - 开发目录合并说明
- `docs/ENV_CONFIG_OPTIMIZATION.md` - 环境配置优化说明
