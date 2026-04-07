## 开发

```bash
# 克隆项目
git clone https://github.com/taozhi1010/nest-admin

# 进入项目目录
cd admin

# 安装依赖
npm install

# 建议不要直接使用 cnpm 安装依赖，会有各种诡异的 bug。可以通过如下操作解决 npm 下载速度慢的问题
npm install --registry=https://registry.npmmirror.com

# 启动服务
npm run dev
```

浏览器访问 http://localhost:8888

### 工具函数库

项目集成了 `cat-tools` 工具库，提供丰富的实用工具函数：

- **自动导入**：在 Vue 组件中可直接使用 `catTools`，无需手动 import
- **Composable**：通过 `useCatTools()` 获取更多工具函数
- **功能丰富**：包含数组处理、数据验证、字符串处理、日期格式化等 30+ 个函数

**快速开始：**

```vue
<script setup>
// 直接使用（自动导入）
const result = catTools.isNullorUndefined(value)

// 或使用 Composable
import { useCatTools } from '@/composables/useCatTools'
const { dateFormat, deepCopy, uniqueArr } = useCatTools()
</script>
```

📚 查看详细文档：
- [快速开始指南](docs/CAT_TOOLS_QUICKSTART.md)
- [完整集成文档](docs/CAT_TOOLS_INTEGRATION.md)

### 配置文件管理

项目使用 `config` 文件夹统一管理配置文件，按功能分为三类：

- **dev/** - 开发环境配置（Prettier、ESLint、TypeScript）
- **env/** - 环境配置（各环境变量文件）
- **ops/** - 运维部署配置（Dockerfile、Nginx）

**注意**: 根目录的配置文件已移除，统一在 `config/` 目录下管理。

**修改配置文件后**，需要运行以下命令将配置文件复制到项目根目录：

```powershell
.\copy-config.ps1
```

或者手动复制单个文件：

```powershell
copy "config\dev\.prettierrc" ".prettierrc"
```

## 发布

```bash
# 构建测试环境
npm run build:stage

# 构建生产环境
npm run build:prod
```