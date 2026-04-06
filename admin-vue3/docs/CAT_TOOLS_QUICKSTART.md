# Cat-Tools 快速开始指南

## 🚀 5分钟快速上手

### 1. 安装（已完成）

```bash
pnpm add cat-tools
```

✅ 已安装版本：1.1.31

### 2. 在 Vue 组件中使用

#### 方式一：直接使用（最简单）

```vue
<template>
  <div>
    <p>检查结果: {{ checkResult }}</p>
    <p>深拷贝: {{ copiedData }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// catTools 自动导入，无需 import！
const checkResult = catTools.isNullorUndefined(null) // true
const copiedData = catTools.deepCopy({ name: 'test', age: 18 })
</script>
```

#### 方式二：使用 Composable（推荐）

```vue
<template>
  <div>
    <p>格式化时间: {{ formattedTime }}</p>
    <p>数组去重: {{ uniqueArray }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useCatTools } from '@/composables/useCatTools'

const { dateFormat, uniqueArr, isNumber } = useCatTools()

const formattedTime = ref('')
const uniqueArray = ref([])

onMounted(() => {
  formattedTime.value = dateFormat(new Date())
  uniqueArray.value = uniqueArr([1, 2, 2, 3, 3, 4]) // [1, 2, 3, 4]
})
</script>
```

### 3. 常用函数速查

```javascript
// 数据验证
catTools.isNullorUndefined(value)  // 检查 null/undefined
catTools.isNumber(value)           // 检查是否为数字

// 数据处理
catTools.deepCopy(obj)             // 深拷贝
catTools.uniqueArr(arr)            // 数组去重
catTools.removeArrayNull(arr)      // 移除空值

// 字符串处理
catTools.strLen(str)               // 计算字符串长度
catTools.lineToLowerCamelCase(str) // 下划线转小驼峰

// 数字格式化
catTools.toThousandFilter(num)     // 千分位格式化

// 日期时间
catTools.formatTime(date, fmt)     // 格式化时间

// 本地工具（通过 useCatTools）
const { dateFormat, debounce, uuid } = useCatTools()
```

### 4. 查看完整示例

- 📄 [CatToolsDemo.vue](../src/views/test/CatToolsDemo.vue) - 基础使用示例
- 📄 [UseCatToolsDemo.vue](../src/views/test/UseCatToolsDemo.vue) - Composable 使用示例

### 5. 运行测试

```bash
node tests/test-cat-tools.cjs
```

## 💡 提示

1. **自动导入**：在 Vue 组件中可以直接使用 `catTools`，无需手动 import
2. **TypeScript**：支持类型推导，有完整的类型提示
3. **更多函数**：查看 [完整文档](./CAT_TOOLS_INTEGRATION.md) 了解所有可用函数

## 🎯 下一步

- 阅读 [完整集成文档](./CAT_TOOLS_INTEGRATION.md)
- 查看 [完成报告](./CAT_TOOLS_REFACTOR_COMPLETE.md)
- 在实际项目中试用各种工具函数

---

开始使用吧！🎉