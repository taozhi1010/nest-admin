# 环境配置文件目录优化说明

## 📋 优化概述

将环境配置文件（`.env.*`）从 `config/ops/` 独立出来，单独创建 `config/env/` 目录进行管理。

## 🔄 变更内容

### 1. 目录结构调整

**调整前：**
```
config/
├── format/
├── development/
└── ops/
    ├── .env.development
    ├── .env.production
    ├── .env.staging
    ├── Dockerfile
    └── nginx.conf
```

**调整后：**
```
config/
├── dev/             # 开发环境配置（包含 Prettier）
│   ├── .prettierrc
│   ├── .prettierignore
│   ├── eslint.config.js
│   └── tsconfig.json
├── env/            # 环境配置（新增）
│   ├── .env.development
│   ├── .env.production
│   └── .env.staging
└── ops/            # 运维部署配置
    ├── Dockerfile
    └── nginx.conf
```

### 2. 文件移动

- ✅ `config/format/.prettierrc` → `config/dev/.prettierrc`
- ✅ `config/format/.prettierignore` → `config/dev/.prettierignore`
- ✅ `config/development/eslint.config.js` → `config/dev/eslint.config.js`
- ✅ `config/development/tsconfig.json` → `config/dev/tsconfig.json`

### 3. 配置更新

#### vite.config.js
```javascript
// 从 config/env 目录加载环境变量
const env = loadEnv(mode, path.join(process.cwd(), 'config/env'))
```

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

1. **目录更简洁**：合并 format 和 development 为 dev，减少目录层级
2. **开发配置集中**：所有开发工具配置集中在一个目录，方便管理
3. **易于理解**：dev目录包含所有开发阶段使用的配置
4. **结构更清晰**：三个目录分别对应开发、环境、运维，职责明确

## 📊 配置分类说明

| 目录 | 用途 | 包含文件 |
|------|------|----------|
| `config/dev/` | 开发工具配置 | Prettier、ESLint、TypeScript |
| `config/env/` | 运行环境配置 | `.env.*` (开发、生产、预发布) |
| `config/ops/` | 运维部署配置 | Dockerfile、nginx.conf |

## ✅ 验证清单

- [x] `development` 目录已重命名为 `dev`
- [x] `format` 目录文件已移动到 `dev`
- [x] `copy-config.ps1` 脚本已更新
- [x] 根目录配置文件已同步
- [x] 相关文档已更新（README.md, config/README.md, CONFIG_MIGRATION.md, ENV_CONFIG_OPTIMIZATION.md）
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

### 测试不同环境

```bash
# 开发环境
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
