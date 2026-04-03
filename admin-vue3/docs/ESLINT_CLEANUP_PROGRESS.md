# ESLint v10 错误清理进度报告

## 📊 总体进度

**初始状态**: 232 个问题 (91 错误 + 141 警告)  
**当前状态**: 194 个问题 (51 错误 + 143 警告)  
**已修复**: 38 个问题 (40 错误已修复 ✅)

---

## ✅ 已完成修复的项目

### 1. Prop 默认值必须是函数 (7 个文件)
**位置**: `src/components/Crontab/` 目录下的所有组件
- ✅ day.vue
- ✅ hour.vue
- ✅ min.vue
- ✅ second.vue
- ✅ month.vue
- ✅ year.vue
- ✅ week.vue

**修复内容**: 将 `default: {}` 改为 `default: () => ({})`

### 2. Computed 中的副作用 (约 30+ 个错误)
**位置**: `src/components/Crontab/` 目录下的所有组件

**修复内容**: 
- 将 computed 中的副作用代码（修改 ref 值）移除
- 改用纯 computed 返回计算后的值
- 添加 watch 监听 computed 值变化并同步到 ref

**示例**:
```javascript
// ❌ 修复前
const cycleTotal = computed(() => {
  cycle01.value = props.check(cycle01.value, 1, 30) // 副作用
  return `${cycle01.value}-${cycle02.value}`
})

// ✅ 修复后
const cycleTotal = computed(() => {
  const checked01 = props.check(cycle01.value, 1, 30)
  const checked02 = props.check(cycle02.value, cycle01.value + 1, 31)
  return `${checked01}-${checked02}`
})
watch(cycleTotal, (value) => {
  const [v1, v2] = value.split('-')
  cycle01.value = Number(v1)
  cycle02.value = Number(v2)
})
```

### 3. defineEmits 未定义 (3 个错误)
**位置**:
- ✅ `src/components/Editor/index.vue` - 添加 `defineEmits(['update:modelValue'])`
- ✅ `src/components/FileUpload/index.vue` - 添加 `defineEmits(['update:modelValue'])`
- ✅ `src/components/Hamburger/index.vue` - 添加 `defineEmits(['toggleClick'])`

### 4. 重复的键 (1 个错误)
**位置**: `src/components/Editor/index.vue`

**修复内容**: 删除 options 中重复的 `theme: 'snow'` 键

---

## 🔧 剩余待修复问题 (51 个错误)

### 高优先级 (影响功能)

#### 1. Filters 已废弃 (2 个错误)
**位置**: `src/components/DictTag/index.vue`
```
Line 12: Filters are deprecated
Line 45, 50: Unexpected side effect in computed function
```

**建议修复方案**:
```vue
<!-- ❌ 旧语法 -->
{{ value | filter }}

<!-- ✅ 新语法 -->
{{ filter(value) }}
```

#### 2. Prop 突变 (21 个错误)
**位置**: 
- `src/views/tool/gen/basicInfoForm.vue` (5 个错误)
- `src/views/tool/gen/genInfoForm.vue` (16 个错误)

**问题**: 直接修改 props (`v-model="info.xxx"`)

**建议修复方案**: 使用本地副本或计算属性的 getter/setter

#### 3. hasOwnProperty 访问方式 (1 个错误)
**位置**: `src/views/system/user/profile/index.vue:97`

**建议修复方案**:
```javascript
// ❌ 旧写法
obj.hasOwnProperty('key')

// ✅ 新写法
Object.hasOwn(obj, 'key')
// 或
Object.prototype.hasOwnProperty.call(obj, 'key')
```

### 中优先级 (代码规范)

#### 4. 自闭合标签 (约 6 个错误)
**位置**:
- `src/views/error/401.vue:14` - `<br/>`
- `src/views/error/404.vue:5,6,7,8` - `<img/>`
- `src/views/tool/swagger/index.vue:19` - `<link/>`

**建议修复方案**: 手动改为成对标签

#### 5. 其他小问题 (约 19 个)
- 未使用的变量（警告）
- 全局变量未定义（警告）
- 代码风格问题（警告）

---

## 📝 配置文件说明

### ESLint 配置
- **文件**: `eslint.config.js`
- **版本**: ESLint v10.1.0
- **格式**: Flat Config (新格式)
- **规则**: 
  - 禁止使用自闭合标签 (`vue/html-self-closing`)
  - Vue 属性按字母顺序排列
  - Prettier 格式化集成

### 可用命令
```bash
pnpm lint          # 检查并自动修复
pnpm lint:check    # 仅检查不修复
pnpm format        # Prettier 格式化
pnpm format:check  # 检查 Prettier 格式
```

---

## 💡 后续建议

### 可自动修复的问题
运行 `pnpm lint --fix` 可以修复约 17 个格式问题（主要是自闭合标签和 Prettier 格式）

### 需要手动修复的问题
1. **DictTag 组件** - Filters 和 Computed 副作用
2. **代码生成模块** - Prop 突变问题（工作量较大）
3. **错误页面** - 自闭合标签手动修改

### 可以忽略的问题
- 未使用的变量（警告级别）
- 全局变量未定义（已在 ESLint 配置中声明为警告）

---

## 📈 修复统计

| 类别 | 初始数量 | 已修复 | 剩余 | 完成率 |
|------|---------|--------|------|--------|
| Prop 默认值 | 7 | 7 | 0 | 100% ✅ |
| Computed 副作用 | ~30 | ~30 | 2 | ~94% ✅ |
| defineEmits | 3 | 3 | 0 | 100% ✅ |
| 重复的键 | 1 | 1 | 0 | 100% ✅ |
| Filters 废弃 | 2 | 0 | 2 | 0% ⏸️ |
| Prop 突变 | 21 | 0 | 21 | 0% ⏸️ |
| hasOwnProperty | 1 | 0 | 1 | 0% ⏸️ |
| 自闭合标签 | ~6 | 0 | ~6 | 0% ⏸️ |
| **总计** | **~71 错误** | **~41** | **~30** | **~58%** |

---

**生成时间**: 2026-03-31  
**ESLint 版本**: 10.1.0  
**项目**: nest-admin/admin-vue3
