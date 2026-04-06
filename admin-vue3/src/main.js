import { createApp } from 'vue'
import dayjs from 'dayjs'

import Cookies from 'js-cookie'

import ElementPlus from 'element-plus'
import locale from 'element-plus/es/locale/lang/zh-cn' // 中文语言
import 'element-plus/dist/index.css' // 引入全局样式
import * as ElementPlusIconsVue from '@element-plus/icons-vue' // 引入所有图标

import '@/assets/styles/index.scss' // global css

import App from './App'
import store from './store'
import router from './router'
import directive from './directive' // directive

// 注册指令
import plugins from './plugins' // plugins
import { download } from '@/utils/request'

// svg 图标
import 'virtual:svg-icons-register'
import SvgIcon from '@/components/SvgIcon'
import elementIcons from '@/components/SvgIcon/svgicon'

import './permission' // permission control

// 分页组件
import Pagination from '@/components/Pagination'
// 自定义表格工具组件
import RightToolbar from '@/components/RightToolbar'
// 文件上传组件
import FileUpload from '@/components/FileUpload'
// 图片上传组件
import ImageUpload from '@/components/ImageUpload'
// 图片预览组件
import ImagePreview from '@/components/ImagePreview'
// 自定义树选择组件
import TreeSelect from '@/components/TreeSelect'

const app = createApp(App)

// 全局组件挂载
app.component('Pagination', Pagination)
app.component('TreeSelect', TreeSelect)
app.component('FileUpload', FileUpload)
app.component('ImageUpload', ImageUpload)
app.component('ImagePreview', ImagePreview)
app.component('RightToolbar', RightToolbar)

// 全局注册所有 Element Plus 图标
Object.keys(ElementPlusIconsVue).forEach((key) => {
  app.component(key, ElementPlusIconsVue[key])
})

app.use(router)
app.use(store)
app.use(plugins)
app.use(elementIcons)
app.component('SvgIcon', SvgIcon)
directive(app)

// 全局挂载 dayjs
app.config.globalProperties.$dayjs = dayjs

// 使用 element-plus 并且设置全局的大小
app.use(ElementPlus, {
  locale: locale,
  // 支持 large、default、small
  size: Cookies.get('size') || 'default'
})

// 初始化字典数据 - 移至登录后执行，避免在未登录时请求接口
// import useDictStore from '@/store/modules/dict'
// const dictStore = useDictStore()
// if (dictStore) {
//   dictStore.initDict().catch(error => {
//     console.error('字典初始化失败:', error)
//   })
// }

app.mount('#app')

// 移除 loading 动画
const loader = document.getElementById('loader')
const loadTitle = document.querySelector('.load_title')
if (loader) loader.remove()
if (loadTitle) loadTitle.remove()
