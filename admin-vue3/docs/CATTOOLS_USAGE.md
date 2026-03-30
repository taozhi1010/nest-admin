# catTools 全局使用指南

## ✅ 已完成的优化

已将 `catTools` 封装为 Vue 3 插件，实现了类似 Vue 2 的全局访问方式。

## 📋 使用方式

### 方式 1：通过 $catTools 对象访问（推荐）⭐

```vue
<template>
  <div>
    <el-button @click="handleClick">点击测试</el-button>
  </div>
</template>

<script setup>
import { getCurrentInstance } from 'vue'

const { proxy } = getCurrentInstance()

const handleClick = () => {
  // 访问 catTools 的所有方法
  const formatted = proxy.$catTools.dateFormat(new Date(), 'YYYY-MM-DD')
  const cloned = proxy.$catTools.deepClone({ a: 1, b: 2 })
  
  console.log(formatted)
  console.log(cloned)
}
</script>
```

### 方式 2：在 Options API 中使用

```vue
<template>
  <div>{{ formattedDate }}</div>
</template>

<script>
export default {
  data() {
    return {
      date: new Date()
    }
  },
  computed: {
    formattedDate() {
      // 直接使用 this.$catTools
      return this.$catTools.dateFormat(this.date, 'YYYY-MM-DD')
    }
  },
  methods: {
    handleData() {
      const original = { name: 'test', value: 123 }
      const cloned = this.$catTools.deepClone(original)
      console.log(cloned)
    }
  }
}
</script>
```

### 方式 3：组合式 API 直接导入（最类型安全）

```vue
<template>
  <div>{{ formattedDate }}</div>
</template>

<script setup>
import { catTools } from 'cat-tools'
import { ref, computed } from 'vue'

const date = ref(new Date())

const formattedDate = computed(() => {
  return catTools.dateFormat(date.value, 'YYYY-MM-DD')
})

// 直接在函数中使用
const handleClick = () => {
  const result = catTools.deepClone({ a: 1 })
  console.log(result)
}
</script>
```

## 🔧 自定义配置

如果需要修改挂载方式，可以编辑 `src/plugins/catTools.js`：

### 选项 A：只挂载特定方法
```javascript
// 取消注释以下代码
const toolsToMount = ['dateFormat', 'deepClone', 'debounce', 'throttle']
toolsToMount.forEach(key => {
  if (catTools[key]) {
    app.config.globalProperties['$' + key] = catTools[key]
  }
})
// 使用时：this.$dateFormat(), this.$deepClone()
```

### 选项 B：全部挂载（带 $ 前缀）
```javascript
// 取消注释以下代码
Object.keys(catTools).forEach(key => {
  if (!app.config.globalProperties[key]) {
    app.config.globalProperties['$' + key] = catTools[key]
  }
})
// 使用时：this.$dateFormat(), this.$deepClone()...
```

## ⚠️ 注意事项

1. **命名空间**：使用 `$catTools` 作为统一命名空间，避免与现有方法冲突
2. **TypeScript 支持**：如果使用 TypeScript，需要在 `components.d.ts` 中添加类型声明
3. **性能考虑**：推荐方式 1 或方式 3，避免全局污染

## 📊 方案对比

| 方案 | 优点 | 缺点 |
|------|------|------|
| **$catTools 对象** | 命名空间清晰，易于维护 | 需要多一层调用 |
| **单独挂载** | 调用简短 | 可能命名冲突 |
| **直接导入** | 类型安全，最清晰 | 每个文件都要导入 |

## 🎯 最佳实践

- **Options API**: 使用 `this.$catTools`
- **Composition API**: 直接 `import { catTools }` 或使用 `getCurrentInstance()`
- **大型项目**: 建议创建专门的 hooks，如 `useCatTools()`
