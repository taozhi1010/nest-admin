# Cat-Tools 工具库集成说明

## 概述

本项目已成功集成 `cat-tools` 个人开发的 JavaScript 工具包，该库提供了丰富的实用工具函数。

## 安装

```bash
pnpm add cat-tools
```

## 自动导入配置

已在 `vite/plugins/auto-import.js` 中配置了自动导入：

```javascript
// cat-tools 工具函数自动导入
{ from: 'cat-tools', imports: ['catTools'] },
// cat-tools Composable 自动导入
{ from: '@/composables/useCatTools', imports: ['useCatTools'] }
```

## 使用方式

### 1. 直接使用 catTools 对象（推荐简单场景）

由于已配置自动导入，可以直接使用 `catTools` 对象：

```vue
<script setup>
// 无需手动 import，可直接使用
const result = catTools.isNullorUndefined(someValue)
const copied = catTools.deepCopy(originalObject)
</script>
```

### 2. 使用 useCatTools Composable（推荐复杂场景）

整合了 npm cat-tools 和本地工具函数的 Composable：

```vue
<script setup>
import { useCatTools } from '@/composables/useCatTools'

const { 
  dateFormat, 
  isNullorUndefined, 
  deepCopy, 
  uniqueArr, 
  isNumber,
  debounce 
} = useCatTools()

// 使用各种工具函数
const formatted = dateFormat(new Date())
const isValid = isNumber(123)
</script>
```

## 可用工具函数

### npm cat-tools 库提供的函数

#### 数组操作
- `uniqueArr(arr)` - 数组去重
- `removeArrayNull(arr)` - 移除数组中的 null/undefined
- `arrObjDistinct(arr, key)` - 根据指定键对对象数组去重
- `distinctArrKeys(arr, keys)` - 根据多个键对对象数组去重
- `findArrObjIndex(arr, key, value)` - 查找对象数组中元素的索引
- `groupByType(arr, key)` - 根据指定键对数组分组
- `upperOrLowerKeys(obj, type)` - 转换对象键的大小写

#### 数据类型判断
- `isNullorUndefined(value)` - 判断值是否为 null 或 undefined
- `isNumber(value)` - 判断值是否为有效数字

#### 对象操作
- `deepCopy(obj)` - 深拷贝对象

#### 字符串处理
- `strDistinct(str)` - 字符串去重
- `strLen(str)` - 计算字符串长度（考虑中文字符）
- `computeStrWidth(str)` - 计算字符串显示宽度
- `lineToLowerCamelCase(str)` - 下划线转小驼峰

#### 数字格式化
- `toThousandFilter(num)` - 数字千分位格式化
- `thousandsSeparator(num)` - 千分位分隔符
- `maxNumber(arr)` - 获取数组中的最大值

#### 日期时间
- `formatTime(date, fmt)` - 格式化时间
- `compareDate(date1, date2)` - 比较日期
- `timestampTranslate(timestamp)` - 时间戳转换

#### 其他工具
- `translate(data, key, label)` - 数据翻译
- `translateCode(code, dict)` - 字典代码翻译
- `optionTranslate(options, value)` - 选项翻译
- `createRandomCode(length)` - 生成随机验证码
- `exportExcelFile(data, filename)` - 导出 Excel 文件
- `logCat(...args)` - 增强版日志输出

### 本地工具函数（通过 useCatTools 提供）

这些是 npm cat-tools 库未包含的本地特有函数：

- `dateFormat(date, format)` - 日期格式化（基于 dayjs，比 npm 的 formatTime 更灵活）
- `debounce(fn, delay)` - 防抖函数
- `throttle(fn, delay)` - 节流函数
- `uuid()` - 生成 UUID v4
- `parseUrl(url)` - 解析 URL 参数
- `formatSize(bytes)` - 格式化文件大小
- `random(min, max)` - 生成指定范围的随机整数

**注意**：`isNullorUndefined` 等通用函数已移除，请直接使用 npm cat-tools 的版本。

## 示例

- 查看 [CatToolsDemo.vue](../src/views/test/CatToolsDemo.vue) 了解直接使用 catTools 的示例
- 查看 [UseCatToolsDemo.vue](../src/views/test/UseCatToolsDemo.vue) 了解使用 useCatTools Composable 的示例

## 注意事项

1. **catTools 对象**：所有 npm cat-tools 的工具函数都通过 `catTools` 对象访问
2. **自动导入**：已在 Vite 配置中启用自动导入，Vue 组件中无需手动 import
3. **useCatTools Composable**：整合了 npm cat-tools 和本地工具函数，推荐使用
4. **参数格式**：部分函数可能需要特定格式的参数，请参考具体函数的使用示例
5. **TypeScript 支持**：如需 TypeScript 支持，可以创建相应的类型定义文件
6. **优先级**：在 useCatTools 中，npm cat-tools 的函数优先，本地函数作为补充
7. **去重优化**：已移除本地与 npm 库重复的 `isNullorUndefined` 函数，避免冗余

## 测试

运行测试文件验证功能：

```bash
node tests/test-cat-tools.cjs
```