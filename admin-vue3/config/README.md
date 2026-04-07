# 项目配置文件说明

本文件夹包含项目的各类配置文件，按照功能分类如下：

## 📁 目录结构

```
config/
├── format/          # 格式化配置文件（已合并到 dev）
│   ├── .prettierrc      # Prettier 配置
│   └── .prettierignore  # Prettier 忽略文件
├── dev/             # 开发环境配置文件
│   ├── .prettierrc      # Prettier 配置
│   ├── .prettierignore  # Prettier 忽略文件
│   ├── eslint.config.js  # ESLint 配置
│   └── tsconfig.json     # TypeScript 配置
├── env/           # 环境配置文件
│   ├── .env.development    # 开发环境变量
│   ├── .env.production     # 生产环境变量
│   └── .env.staging        # 预发布环境变量
└── ops/             # 运维部署配置文件
    ├── Dockerfile          # Docker 构建配置
    └── nginx.conf          # Nginx 配置
```

## 📋 使用说明

### 格式化配置
- `.prettierrc` - 代码格式化规则（位于 `dev/`）
- `.prettierignore` - 格式化忽略文件（位于 `dev/`）

### 开发环境配置
- `eslint.config.js` - ESLint v10 扁平化配置（位于 `dev/`）
- `tsconfig.json` - TypeScript 编译配置（位于 `dev/`）

### 环境配置
- `.env.*` - 各环境的环境变量（开发、生产、预发布）

### 运维部署配置
- `Dockerfile` - Docker 镜像构建
- `nginx.conf` - Nginx 服务器配置

## 🔗 根目录文件引用

由于 Vite、ESLint、Prettier、TypeScript 等工具需要从项目根目录读取配置文件，因此需要将 `config` 文件夹中的配置文件复制到根目录。

**重要说明**:
- ✅ `config/` 文件夹中的是配置文件的"源文件"
- ⚠️ 根目录的配置文件已移除，需要时运行 `.\copy-config.ps1` 复制
- 📝 修改配置时，直接修改 `config` 文件夹中的源文件即可

## ⚠️ 注意事项

1. **修改配置文件**: 建议直接修改 `config` 文件夹中的源文件，然后运行以下命令复制到根目录：
   ```powershell
   # Windows PowerShell
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

2. **环境变量文件**: 前缀必须为 `.env`，Vite 才能正确加载

3. **Dockerfile 和 nginx.conf**: 需要保持在根目录以便 Docker 构建时使用

4. **vite.config.js**: 已配置为从 `config/env/` 目录加载环境变量文件
