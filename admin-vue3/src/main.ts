import { createApp, type App as VueApp } from 'vue'
import Cookies from 'js-cookie'
import ElementPlus from 'element-plus'
import locale from 'element-plus/es/locale/lang/zh-cn' // 中文语言
import 'element-plus/dist/index.css' // 引入全局样式
import * as ElementPlusIconsVue from '@element-plus/icons-vue' // 引入所有图标

import '@/assets/styles/index.scss' // global css

import App from './App.vue'
import store from './store'
import router from './router'
import directive from './directive' // directive

// svg 图标
import 'virtual:svg-icons-register'
import SvgIcon from '@/components/SvgIcon/index.vue'
import elementIcons from '@/components/SvgIcon/svgicon'

import './permission' // permission control

// 分页组件
import Pagination from '@/components/Pagination/index.vue'
// 自定义表格工具组件
import RightToolbar from '@/components/RightToolbar/index.vue'
// 文件上传组件
import FileUpload from '@/components/FileUpload/index.vue'
// 图片上传组件
import ImageUpload from '@/components/ImageUpload/index.vue'
// 图片预览组件
import ImagePreview from '@/components/ImagePreview/index.vue'

const app: VueApp = createApp(App)

// 全局组件挂载
app.component('Pagination', Pagination)
app.component('FileUpload', FileUpload)
app.component('ImageUpload', ImageUpload)
app.component('ImagePreview', ImagePreview)
app.component('RightToolbar', RightToolbar)

// 全局注册所有 Element Plus 图标
Object.keys(ElementPlusIconsVue).forEach((key) => {
  const componentName = key as keyof typeof ElementPlusIconsVue
  app.component(componentName, ElementPlusIconsVue[componentName])
})

app.use(router)
app.use(store)
app.use(elementIcons)
app.component('SvgIcon', SvgIcon)
directive(app)

app.use(ElementPlus, {
  locale: locale,
  // 支持 large、default、small
  size: (Cookies.get('size') as 'large' | 'default' | 'small') || 'default'
})

app.mount('#app')

// 移除 loading 动画
const loader = document.getElementById('loader')
const loadTitle = document.querySelector('.load_title')
if (loader) loader.remove()
if (loadTitle) loadTitle.remove()
