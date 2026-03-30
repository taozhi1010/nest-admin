# catTools 使用指南 - 快速开始

## 🚀 推荐使用方式（优先级排序）

### 1️⃣ Composables + Auto Import（最推荐）⭐⭐⭐⭐⭐

```vue
<script setup>
// 无需手动导入，自动识别！
const { dateFormat, deepClone, uuid, debounce } = useCatTools()

// 直接使用
const date = dateFormat(new Date(), 'YYYY-MM-DD')
const cloned = deepClone({ a: 1, b: 2 })
const id = uuid()
</script>
```

**优势：**
- ✅ 代码最简洁
- ✅ TypeScript 支持好
- ✅ Vue 3 标准实践
- ✅ IDE 智能提示完整

---

### 2️⃣ 直接导入（类型安全）⭐⭐⭐⭐

```vue
<script setup>
import { catTools } from 'cat-tools'

// 使用
const date = catTools.dateFormat(new Date(), 'YYYY-MM-DD')
const cloned = catTools.deepClone(obj)
</script>
```

**优势：**
- ✅ 来源最清晰
- ✅ 类型推断最完整
- ✅ 适合不常用的工具函数

---

### 3️⃣ 全局属性（兼容 Vue 2）⭐⭐⭐

```vue
<script setup>
import { getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()

// 使用
const date = proxy.devTools.dateFormat(new Date(), 'YYYY-MM-DD')
</script>
```

或 Options API：

```vue
<script>
export default {
  methods: {
    formatDate() {
      return this.devTools.dateFormat(new Date(), 'YYYY-MM-DD')
    }
  }
}
</script>
```

**优势：**
- ✅ 类似 Vue 2 的使用习惯
- ✅ 所有工具在一个命名空间下

---

## 📋 常用 API 速查

### 日期时间
```javascript
const { dateFormat } = useCatTools()
dateFormat(new Date(), 'YYYY-MM-DD HH:mm:ss') // "2026-03-29 06:20:00"
```

### 对象操作
```javascript
const { deepClone } = useCatTools()
const cloned = deepClone({ a: 1, b: { c: 2 } })
```

### 函数控制
```javascript
const { debounce, throttle } = useCatTools()

// 防抖：500ms 延迟执行
const debouncedFn = debounce(() => {
  console.log('执行了')
}, 500)

// 节流：1000ms 内只执行一次
const throttledFn = throttle(() => {
  console.log('执行了')
}, 1000)
```

### UUID 生成
```javascript
const { uuid } = useCatTools()
uuid() // "550e8400-e29b-41d4-a716-446655440000"
```

### 消息提示
```javascript
const { success, error, warning, info, confirm } = useMessage()

success('操作成功')
error('操作失败')
confirm('确定要删除吗？')
```

---

## 🎯 快速测试

访问以下页面进行测试：

- **自动导入验证**: http://localhost:8889/test/auto-import-verify
- **方案对比**: http://localhost:8889/test/cat-tools-comparison  
- **功能测试**: http://localhost:8889/test/cat-tools-test

---

## ⚡ 一分钟迁移指南

### 从全局属性迁移到 Composables

**之前：**
```vue
<script setup>
import { getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()

const date = proxy.devTools.dateFormat(new Date())
</script>
```

**现在：**
```vue
<script setup>
// 无需 import，直接使用
const { dateFormat } = useCatTools()

const date = dateFormat(new Date())
</script>
```

---

## 💡 最佳实践 Tips

1. **优先使用 Composables** - 新项目统一用 `useCatTools()`
2. **按需解构** - 只用解构需要的函数，不要全部解构
   ```javascript
   // ✅ 好的做法
   const { dateFormat, deepClone } = useCatTools()
   
   // ❌ 不推荐
   const tools = useCatTools()
   ```

3. **组合使用** - 可以混合使用不同方案
   ```javascript
   const { dateFormat } = useCatTools() // 自动导入
   import { catTools } from 'cat-tools' // 直接导入（特殊场景）
   ```

---

## 📚 更多文档

- [Composables + Auto Import 完整报告](./COMPOSABLES_AUTO_IMPORT.md)
- [详细使用文档](./CATTOOLS_USAGE.md)
