# 开发配置目录合并说明

## 📋 优化概述

将 `config/development` 重命名为 `config/dev`，并将 `config/format` 下的文件合并到 `dev` 目录中，实现开发配置的集中管理。

## 🔄 变更内容

### 1. 目录结构调整

**调整前：**
```
config/
├── format/          # 格式化配置
│   ├── .prettierrc
│   └── .prettierignore
├── development/     # 开发环境配置
│   ├── eslint.config.js
│   └── tsconfig.json
├── env/            # 环境配置
└── ops/            # 运维部署配置
```

**调整后：**
```
config/
├── dev/             # 开发工具配置（合并后）
│   ├── .prettierrc
│   ├── .prettierignore
│   ├── eslint.config.js
│   └── tsconfig.json
├── env/            # 环境配置
└── ops/            # 运维部署配置
```

### 2. 文件移动

- ✅ `format/.prettierrc` → `dev/.prettierrc`
- ✅ `format/.prettierignore` → `dev/.prettierignore`
- ✅ `development/eslint.config.js` → `dev/eslint.config.js`
- ✅ `development/tsconfig.json` → `dev/tsconfig.json`
- ✅ 删除空的 `format/` 目录

### 3. 目录重命名

- ✅ `development/` → `dev/` （更简洁的命名）

### 4. 配置更新

#### copy-config.ps1
```powershell
# 格式化配置
Copy-Item "config\dev\.prettierrc" ".prettierrc" -Force
Copy-Item "config\dev\.prettierignore" ".prettierignore" -Force

# 开发环境配置
Copy-Item "config\dev\eslint.config.js" "eslint.config.js" -Force
Copy-Item "config\dev\tsconfig.json" "tsconfig.json" -Force
```

## 🎯 优化优势

| 优势 | 说明 |
|------|------|
| **目录更简洁** | 从 4 个目录减少到 3 个，结构更清晰 |
| **配置集中** | 所有开发工具配置集中在 `dev/` 目录 |
| **易于管理** | 开发相关配置统一位置，方便查找和修改 |
| **命名简化** | `dev` 比 `development` 更简洁直观 |

## 📊 新的配置分类

| 目录 | 用途 | 包含文件 |
|------|------|----------|
| `config/dev/` | 开发工具配置 | Prettier、ESLint、TypeScript |
| `config/env/` | 运行环境配置 | `.env.*` (开发、生产、预发布) |
| `config/ops/` | 运维部署配置 | Dockerfile、nginx.conf |

## ✅ 验证清单

- [x] `development` 目录已重命名为 `dev`
- [x] `format` 目录文件已移动到 `dev`
- [x] 空的 `format` 目录已删除
- [x] `copy-config.ps1` 脚本已更新
- [x] 根目录配置文件已同步
- [x] 相关文档已更新
- [x] 项目可正常启动和运行

## 🔧 使用方法

### 修改开发配置后

```powershell
# 一键复制所有配置文件
.\copy-config.ps1

# 或手动复制单个文件
copy "config\dev\.prettierrc" ".prettierrc"
copy "config\dev\.prettierignore" ".prettierignore"
copy "config\dev\eslint.config.js" "eslint.config.js"
copy "config\dev\tsconfig.json" "tsconfig.json"
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

## 📝 注意事项

1. `dev/` 目录包含所有开发工具配置（Prettier、ESLint、TypeScript）
2. 修改配置文件后记得运行 `copy-config.ps1` 复制到根目录
3. Git 提交时需同时提交 `config/dev/` 和根目录的配置文件

## 📚 相关文档

- `config/README.md` - 配置文件详细说明
- `README.md` - 项目使用说明
- `docs/CONFIG_MIGRATION.md` - 配置文件迁移总览
- `docs/ENV_CONFIG_OPTIMIZATION.md` - 环境配置优化说明
