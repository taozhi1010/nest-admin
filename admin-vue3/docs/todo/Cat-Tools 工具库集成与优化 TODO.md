# Cat-Tools 工具库集成与优化 TODO

## 📋 任务概述

将个人开发的 `cat-tools` npm 包集成到项目中，并优化本地工具函数，避免代码冗余。

**完成时间**：2026-04-06  
**状态**：✅ 已完成第一阶段（基础集成 + 去重优化）  
**后续计划**：持续整合更多方法，便于测试和修改

---

## ✅ 已完成的工作

### 第一阶段：基础集成（2026-04-06）

#### 1. 安装与配置

- ✅ 安装 cat-tools npm 包（版本 1.1.31）
- ✅ 配置 Vite 自动导入
  - `catTools` 对象自动导入
  - `useCatTools` Composable 自动导入
- ✅ 更新 package.json 依赖

**配置文件**：
- [vite/plugins/auto-import.js](../../vite/plugins/auto-import.js)
- [package.json](../../package.json)

#### 2. 整合 useCatTools Composable

- ✅ 创建/更新 `src/composables/useCatTools.ts`
- ✅ 整合 npm cat-tools 库（26个函数）
- ✅ 整合本地工具函数（7个特有函数）
- ✅ 提供统一的访问接口

**文件**：
- [src/composables/useCatTools.ts](../../src/composables/useCatTools.ts)

#### 3. 创建测试和示例

- ✅ Node.js 环境测试：`tests/test-cat-tools.cjs`
- ✅ 自动导入说明：`tests/test-cat-tools-auto-import.js`
- ✅ Vue 组件示例：
  - [src/views/test/CatToolsDemo.vue](../../src/views/test/CatToolsDemo.vue) - 直接使用示例
  - [src/views/test/UseCatToolsDemo.vue](../../src/views/test/UseCatToolsDemo.vue) - Composable 示例

#### 4. 编写文档

- ✅ [CAT_TOOLS_QUICKSTART.md](../CAT_TOOLS_QUICKSTART.md) - 快速开始指南
- ✅ [CAT_TOOLS_INTEGRATION.md](../CAT_TOOLS_INTEGRATION.md) - 完整集成文档
- ✅ [CAT_TOOLS_REFACTOR_COMPLETE.md](../CAT_TOOLS_REFACTOR_COMPLETE.md) - 集成完成报告
- ✅ 更新 README.md - 添加工具库说明

---

### 第二阶段：代码精简优化（2026-04-06）

#### 1. 识别并移除重复函数

通过对比分析，发现并移除了重复的 `isNullorUndefined` 函数：

| 函数名 | 本地文件 | npm 库 | 处理结果 |
|--------|---------|--------|----------|
| isNullorUndefined | ✅ | ✅ | ❌ 移除本地版本，使用 npm |
| dateFormat | ✅ | ❌ | ✅ 保留（基于 dayjs，更灵活）|
| debounce | ✅ | ❌ | ✅ 保留 |
| throttle | ✅ | ❌ | ✅ 保留 |
| uuid | ✅ | ❌ | ✅ 保留 |
| parseUrl | ✅ | ❌ | ✅ 保留 |
| formatSize | ✅ | ❌ | ✅ 保留 |
| random | ✅ | ❌ | ✅ 保留 |

#### 2. 优化本地工具文件

- ✅ 精简 `src/utils/catTools.js`
  - 移除 `isNullorUndefined` 函数
  - 添加完整的 JSDoc 注释
  - 更新文件说明，明确定位为"本地特有工具"
- ✅ 更新 `src/composables/useCatTools.ts`
  - 移除对本地 `isNullorUndefined` 的引用
  - 统一使用 npm cat-tools 版本

**修改文件**：
- [src/utils/catTools.js](../../src/utils/catTools.js)
- [src/composables/useCatTools.ts](../../src/composables/useCatTools.ts)

#### 3. 验证测试

- ✅ 创建验证脚本：`tests/verify-dedup.cjs`
- ✅ 运行测试确认无重复函数
- ✅ 统计：26个 npm 函数 + 7个本地函数 = 33个总可用函数

#### 4. 优化文档

- ✅ [CAT_TOOLS_DEDUP_OPTIMIZATION.md](../CAT_TOOLS_DEDUP_OPTIMIZATION.md) - 精简优化说明
- ✅ [CAT_TOOLS_DEDUP_SUMMARY.md](../CAT_TOOLS_DEDUP_SUMMARY.md) - 优化完成报告
- ✅ 更新相关文档的注意事项

---

## 📊 当前状态总结

### 函数分布

```
总可用函数：33 个
├── npm cat-tools: 26 个 (78.8%)
│   ├── 数组操作：7 个
│   │   └── uniqueArr, removeArrayNull, arrObjDistinct, 
│   │       distinctArrKeys, findArrObjIndex, groupByType, upperOrLowerKeys
│   ├── 数据验证：2 个
│   │   └── isNullorUndefined, isNumber
│   ├── 对象操作：1 个
│   │   └── deepCopy
│   ├── 字符串处理：4 个
│   │   └── strDistinct, strLen, computeStrWidth, lineToLowerCamelCase
│   ├── 数字格式化：3 个
│   │   └── toThousandFilter, thousandsSeparator, maxNumber
│   ├── 日期时间：3 个
│   │   └── formatTime, compareDate, timestampTranslate
│   └── 其他工具：6 个
│       └── translate, translateCode, optionTranslate,
│           createRandomCode, exportExcelFile, logCat
└── 本地特有：7 个 (21.2%)
    ├── dateFormat（基于 dayjs）
    ├── debounce（防抖）
    ├── throttle（节流）
    ├── uuid（UUID生成）
    ├── parseUrl（URL解析）
    ├── formatSize（文件大小格式化）
    └── random（随机数）
```

### 使用方式

#### 方式一：直接使用 catTools（简单场景）

```vue
<script setup>
// 自动导入，无需 import
const result = catTools.isNullorUndefined(value)
const copied = catTools.deepCopy(obj)
const unique = catTools.uniqueArr([1, 2, 2, 3])
</script>
```

#### 方式二：使用 useCatTools Composable（推荐）

```vue
<script setup>
import { useCatTools } from '@/composables/useCatTools'

const { 
  // npm cat-tools 提供的函数
  isNullorUndefined,
  deepCopy,
  uniqueArr,
  isNumber,
  
  // 本地特有函数
  dateFormat,
  debounce,
  uuid
} = useCatTools()

// 使用示例
const formatted = dateFormat(new Date())
const isValid = isNumber(123)
</script>
```

---

## 🎯 后续 TODO 计划

### 第三阶段：持续整合优化（待进行）

#### TODO 1: 监控 npm cat-tools 更新

**目标**：保持与最新版本的同步

**任务清单**：
- [ ] 定期检查 npm cat-tools 新版本
- [ ] 评估新版本的变更和影响
- [ ] 测试新版本兼容性
- [ ] 更新 package.json 版本
- [ ] 回归测试所有功能

**优先级**：🟡 中  
**预计时间**：每次版本更新时

---

#### TODO 2: 补充缺失的工具函数

**目标**：根据项目实际需求，补充常用的工具函数

**可能的候选函数**：
- [ ] 表单验证工具（邮箱、手机号、身份证等）
- [ ] 数据转换工具（JSON 格式化、XML 转换等）
- [ ] 浏览器工具（本地存储、Cookie 操作等）
- [ ] 性能工具（防抖增强、节流增强等）
- [ ] 加密工具（MD5、SHA、Base64 等）

**决策流程**：
1. 检查 npm cat-tools 是否已有
2. 如果有 → 直接使用
3. 如果没有且通用 → 贡献到 npm cat-tools
4. 如果没有且项目特定 → 添加到本地

**优先级**：🟢 低（按需添加）  
**预计时间**：根据需求

---

#### TODO 3: TypeScript 类型定义完善

**目标**：为所有工具函数提供完整的 TypeScript 类型定义

**当前状态**：
- ✅ 基本类型推导（通过自动导入）
- ⚠️ 缺少详细的类型定义文件

**任务清单**：
- [ ] 创建 `types/cat-tools.d.ts` 类型定义文件
- [ ] 为 npm cat-tools 的所有函数添加类型定义
- [ ] 为本地特有函数添加类型定义
- [ ] 添加泛型支持（如 deepCopy、uniqueArr 等）
- [ ] 测试类型推导是否正确

**示例**：
```typescript
declare module 'cat-tools' {
  interface CatTools {
    // 数组操作
    uniqueArr<T>(arr: T[]): T[]
    deepCopy<T>(obj: T): T
    
    // 数据验证
    isNullorUndefined(value: any): value is null | undefined
    isNumber(value: any): value is number
    
    // ... 其他函数
  }
  
  export const catTools: CatTools
  export default catTools
}
```

**优先级**：🟡 中  
**预计时间**：2-3 小时

---

#### TODO 4: 单元测试覆盖

**目标**：为所有工具函数编写单元测试

**任务清单**：
- [ ] 搭建测试框架（Vitest/Jest）
- [ ] 为 npm cat-tools 函数编写测试用例
- [ ] 为本地特有函数编写测试用例
- [ ] 边界情况测试
- [ ] 错误处理测试
- [ ] 配置 CI/CD 自动测试

**测试示例**：
```javascript
import { describe, it, expect } from 'vitest'
import { catTools } from 'cat-tools'

describe('catTools.isNullorUndefined', () => {
  it('应该返回 true 当值为 null', () => {
    expect(catTools.isNullorUndefined(null)).toBe(true)
  })
  
  it('应该返回 true 当值为 undefined', () => {
    expect(catTools.isNullorUndefined(undefined)).toBe(true)
  })
  
  it('应该返回 false 当值为其他类型', () => {
    expect(catTools.isNullorUndefined('')).toBe(false)
    expect(catTools.isNullorUndefined(0)).toBe(false)
    expect(catTools.isNullorUndefined(false)).toBe(false)
  })
})
```

**优先级**：🟡 中  
**预计时间**：4-6 小时

---

#### TODO 5: 性能优化和基准测试

**目标**：评估和优化关键函数的性能

**任务清单**：
- [ ] 识别性能敏感函数（deepCopy、uniqueArr 等）
- [ ] 编写性能基准测试
- [ ] 对比不同实现方案
- [ ] 优化慢速函数
- [ ] 记录性能指标

**测试场景**：
- 大数据量数组去重（10万+元素）
- 深层对象拷贝（嵌套 10+ 层）
- 高频调用场景（防抖/节流）

**优先级**：🔴 低（性能瓶颈出现时）  
**预计时间**：2-4 小时

---

#### TODO 6: 文档完善

**目标**：提供更完善的开发文档

**任务清单**：
- [ ] 为每个函数添加使用示例
- [ ] 添加常见问题 FAQ
- [ ] 添加最佳实践指南
- [ ] 添加迁移指南（从旧工具库迁移）
- [ ] 添加视频教程或截图
- [ ] 创建在线文档站点（可选）

**优先级**：🟢 低  
**预计时间**：3-5 小时

---

#### TODO 7: 实际项目替换

**目标**：在现有代码中逐步替换为 cat-tools

**任务清单**：
- [ ] 扫描项目中现有的工具函数使用
- [ ] 识别可以替换为 cat-tools 的代码
- [ ] 分批替换（按模块）
- [ ] 测试替换后的功能
- [ ] 清理旧的重复代码
- [ ] 更新相关文档

**替换策略**：
1. 优先替换高频使用的函数（isNullorUndefined、deepCopy 等）
2. 按模块逐步替换，避免大规模改动
3. 每次替换后进行充分测试

**优先级**：🟡 中  
**预计时间**：6-8 小时（分多次进行）

---

#### TODO 8: 贡献到 npm cat-tools

**目标**：将本地特有且有通用价值的函数贡献到 npm 库

**候选函数**：
- [ ] dateFormat（如果其他项目也需要基于 dayjs 的格式化）
- [ ] formatSize（文件大小格式化很通用）
- [ ] parseUrl（URL 解析可能有通用价值）

**任务清单**：
- [ ] 评估函数的通用性
- [ ] 重构代码使其更通用
- [ ] 添加完整的测试
- [ ] 提交 PR 到 cat-tools 仓库
- [ ] 等待合并和发布
- [ ] 更新项目依赖
- [ ] 移除本地版本

**优先级**：🔴 低  
**预计时间**：2-3 小时/函数

---

## 📝 维护建议

### 日常维护

1. **代码审查**
   - 新增工具函数时，先检查 cat-tools 是否已有
   - 优先使用 npm 版本，避免重复造轮子

2. **版本管理**
   - 定期运行 `pnpm outdated` 检查更新
   - 关注 cat-tools 的 changelog
   - 测试后再升级版本

3. **文档同步**
   - 代码变更后及时更新文档
   - 保持示例代码与实际代码一致
   - 记录重要的设计决策

### 问题排查

**常见问题**：

1. **自动导入不生效**
   - 检查 vite.config.js 配置
   - 重启开发服务器
   - 清除缓存：`rm -rf node_modules/.vite`

2. **类型推导错误**
   - 检查 auto-imports.d.ts 是否生成
   - 重启 TypeScript 服务
   - 手动重新生成：删除 auto-imports.d.ts 后重启

3. **函数找不到**
   - 确认是从正确的来源导入
   - 检查 useCatTools 是否包含该函数
   - 查看文档确认可用函数列表

---

## 🔗 相关资源

### 文档
- [快速开始指南](../CAT_TOOLS_QUICKSTART.md)
- [完整集成文档](../CAT_TOOLS_INTEGRATION.md)
- [集成完成报告](../CAT_TOOLS_REFACTOR_COMPLETE.md)
- [精简优化说明](../CAT_TOOLS_DEDUP_OPTIMIZATION.md)
- [优化完成报告](../CAT_TOOLS_DEDUP_SUMMARY.md)

### 代码文件
- [vite/plugins/auto-import.js](../../vite/plugins/auto-import.js) - 自动导入配置
- [src/composables/useCatTools.ts](../../src/composables/useCatTools.ts) - Composable
- [src/utils/catTools.js](../../src/utils/catTools.js) - 本地工具函数

### 测试文件
- [tests/test-cat-tools.cjs](../../tests/test-cat-tools.cjs) - 功能测试
- [tests/verify-dedup.cjs](../../tests/verify-dedup.cjs) - 去重验证

### 示例组件
- [src/views/test/CatToolsDemo.vue](../../src/views/test/CatToolsDemo.vue)
- [src/views/test/UseCatToolsDemo.vue](../../src/views/test/UseCatToolsDemo.vue)

### 外部资源
- [cat-tools npm 包](https://www.npmjs.com/package/cat-tools)
- [Vue 3 官方文档](https://cn.vuejs.org/)
- [Vite 官方文档](https://cn.vitejs.dev/)

---

## 📅 更新日志

### 2026-04-06
- ✅ 完成 cat-tools 基础集成
- ✅ 配置自动导入
- ✅ 创建 useCatTools Composable
- ✅ 编写完整文档
- ✅ 移除重复函数 isNullorUndefined
- ✅ 优化本地工具文件
- ✅ 创建此 TODO 文档

---

## 💡 备注

本文档作为 cat-tools 集成的长期维护指南，记录了：
1. 已完成的工作和决策
2. 当前的状态和统计数据
3. 未来的改进计划和 TODO
4. 维护建议和问题排查

**建议定期回顾此文档**，根据实际情况更新 TODO 列表和优先级。

---

**最后更新**：2026-04-06  
**维护者**：开发团队  
**下次回顾**：建议在下一个迭代周期开始时