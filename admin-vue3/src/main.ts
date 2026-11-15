import { createApp, type App as VueApp } from 'vue';

import '@/assets/styles/index.scss'; // global css
import DictTag from '@/components/DictTag/index.vue';
// 文件上传组件
import FileUpload from '@/components/FileUpload/index.vue';
// 图片预览组件
import ImagePreview from '@/components/ImagePreview/index.vue';
// 图片上传组件
import ImageUpload from '@/components/ImageUpload/index.vue';

// svg 图标
import 'virtual:svg-icons-register';

// 分页组件
import Pagination from '@/components/Pagination/index.vue';
// 自定义表格工具组件
import RightToolbar from '@/components/RightToolbar/index.vue';
import SvgIcon from '@/components/SvgIcon/index.vue';

import './permission'; // permission control
import App from './App.vue';
import directive from './directive'; // directive
import router from './router';
import store from './store';

const app: VueApp = createApp(App);

// 全局组件挂载
app.component('Pagination', Pagination);
app.component('FileUpload', FileUpload);
app.component('ImageUpload', ImageUpload);
app.component('ImagePreview', ImagePreview);
app.component('RightToolbar', RightToolbar);
app.component('DictTag', DictTag);

app.use(router);
app.use(store);
app.component('SvgIcon', SvgIcon);
directive(app);

app.mount('#app');

// 移除 loading 动画
const loader = document.getElementById('loader');
const loadTitle = document.querySelector('.load_title');
if (loader) loader.remove();
if (loadTitle) loadTitle.remove();
