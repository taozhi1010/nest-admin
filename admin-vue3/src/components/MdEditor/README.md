# MdEditor 组件使用说明

## 简介

`MdEditor` 是一个基于 `md-editor-v3` 封装的 Markdown 编辑器组件，采用 VuePress 主题，支持编辑、预览、代码高亮等功能。

## 基本用法

```vue
<template>
  <MdEditor v-model="content" />
</template>

<script setup>
import { ref } from 'vue'
import MdEditor from '@/components/MdEditor'

const content = ref('')
</script>
```

## Props 属性

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| modelValue | String | '' | v-model 绑定的内容 |
| height | String | '400px' | 编辑器高度 |
| mode | String | 'edit' | 编辑模式：`edit`（仅编辑）、`preview`（仅预览）、`editable`（编辑+预览） |
| leftToolbar | String | 见下方 | 左侧工具栏配置 |
| rightToolbar | String | 见下方 | 右侧工具栏配置 |
| disabledMenus | Array | [] | 禁用的菜单项 |
| placeholder | String | '请输入内容（支持 Markdown 语法）' | 占位符文本 |

### 默认工具栏配置

**leftToolbar:**
```
undo redo clear | h bold italic strikethrough quote | ul ol table hr | link image code
```

**rightToolbar:**
```
preview toc sync-scroll fullscreen
```

## Events 事件

| 事件名 | 参数 | 说明 |
|--------|------|------|
| update:modelValue | (value: string) | v-model 更新时触发 |
| change | ({ text, html }) | 内容变化时触发，返回 Markdown 文本和 HTML |
| upload-image | ({ event, insertImage, files }) | 图片上传时触发 |

## 使用示例

### 1. 基础用法

```vue
<template>
  <MdEditor v-model="content" />
</template>

<script setup>
import { ref } from 'vue'
import MdEditor from '@/components/MdEditor'

const content = ref('# Hello World')
</script>
```

### 2. 自定义高度

```vue
<template>
  <MdEditor v-model="content" height="600px" />
</template>
```

### 3. 仅编辑模式

```vue
<template>
  <MdEditor v-model="content" mode="edit" />
</template>
```

### 4. 仅预览模式

```vue
<template>
  <MdEditor v-model="content" mode="preview" />
</template>
```

### 5. 监听内容变化

```vue
<template>
  <MdEditor 
    v-model="content" 
    @change="handleChange"
  />
</template>

<script setup>
import { ref } from 'vue'
import MdEditor from '@/components/MdEditor'

const content = ref('')

const handleChange = ({ text, html }) => {
  console.log('Markdown:', text)
  console.log('HTML:', html)
}
</script>
```

### 6. 自定义图片上传

```vue
<template>
  <MdEditor 
    v-model="content" 
    @upload-image="handleUploadImage"
  />
</template>

<script setup>
import { ref } from 'vue'
import MdEditor from '@/components/MdEditor'
import { uploadImage } from '@/api/upload'

const content = ref('')

const handleUploadImage = async ({ event, insertImage, files }) => {
  try {
    // 调用后端接口上传图片
    const response = await uploadImage(files[0])
    
    // 插入图片到编辑器
    insertImage({
      url: response.data.url,
      desc: files[0].name
    })
  } catch (error) {
    console.error('图片上传失败:', error)
  }
}
</script>
```

### 7. 自定义工具栏

```vue
<template>
  <MdEditor 
    v-model="content"
    left-toolbar="undo redo | bold italic | link image"
    right-toolbar="preview"
  />
</template>
```

### 8. 在表单中使用（公告模块示例）

```vue
<template>
  <el-form-item label="内容" prop="noticeContent">
    <MdEditor v-model="form.noticeContent" height="400px" />
  </el-form-item>
</template>

<script setup>
import { reactive } from 'vue'
import MdEditor from '@/components/MdEditor'

const form = reactive({
  noticeContent: ''
})
</script>
```

## 注意事项

1. **换行问题**：
   - **默认模式为 `edit`（仅编辑）**，在此模式下直接按 `Enter` 键即可换行
   - 如果需要在编辑时看到预览效果，可以设置 `mode="editable"`
   - 在 `editable` 模式下，左侧编辑区按 `Enter` 也可以正常换行
   - 如遇到无法换行的问题，请尝试：
     - 刷新页面（Ctrl + F5）
     - 检查浏览器控制台是否有错误
     - 确认编辑器是否获得了焦点

2. **图片上传**：
   - 默认将图片转为 Base64 存储
   - 如需上传到服务器，请监听 `upload-image` 事件并自行处理

3. **样式**：
   - 组件已内置 GitHub 主题样式
   - 如需查看渲染效果，请使用 `MdViewer` 组件

4. **依赖**：
   - 确保项目中已安装 `md-editor-v3`

## 相关组件

- **MdViewer**: Markdown 内容查看器（只读模式）

```vue
<template>
  <MdViewer :value="content" />
</template>
```

## 完整示例

查看 `src/views/system/notice/index.vue` 文件中的实际使用示例。
