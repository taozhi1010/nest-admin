/**
 * 自动导入插件配置
 * 
 * 功能说明：
 * 1. 自动导入 Vue、Vue Router、Pinia 等常用 API
 * 2. 自动导入 Element Plus 组件和方法
 * 3. 自动导入 composables 目录下的组合式函数
 * 4. 自动生成 TypeScript 类型声明
 */
import autoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

/**
 * 创建自动导入插件配置
 * @returns {Array} 自动导入和组件自动导入插件数组
 */
export default function createAutoImport() {
  return [
    // 配置自动导入功能
    autoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      dts: true, // 启用类型声明生成
      resolvers: [ElementPlusResolver()],
      dirs: ['./src/composables'],
      presetImports: [
        { from: 'dayjs', as: 'dayjs' },
        { from: 'dayjs/plugin/isSameOrBefore', as: 'isSameOrBefore' },
        { from: 'dayjs/plugin/isSameOrAfter', as: 'isSameOrAfter' },
        // Element Plus 常用方法自动导入
        { from: 'element-plus', imports: ['ElMessage', 'ElMessageBox', 'ElNotification', 'ElLoading'] },
        // 权限验证组合式函数自动导入
        { from: '@/composables/useAuth', imports: ['useAuth'] },
        // HTTP 请求组合式函数自动导入
        { from: '@/composables/useRequest', imports: ['useRequest', 'download', 'isRelogin'] },
        // cat-tools 工具函数自动导入
        { from: 'cat-tools', imports: ['catTools'] },
        // cat-tools Composable 自动导入
        { from: '@/composables/useCatTools', imports: ['useCatTools'] },
        // 验证工具组合式函数自动导入
        { from: '@/composables/useValidator', imports: [
          'isExternal', 'isHttp', 'validURL', 'validUsername', 
          'validLowerCase', 'validUpperCase', 'validAlphabets', 
          'validEmail', 'isString', 'isArray', 'safeValidate',
          'urlSchema', 'emailSchema', 'usernameSchema',
          'lowerCaseSchema', 'upperCaseSchema', 'alphabetsSchema'
        ] }
      ],
      // 全局导入，无需手动 import
      injectAtEnd: true
    }),
    // 配置组件自动导入
    Components({
      resolvers: [ElementPlusResolver()] // Element Plus 组件自动导入
    })
  ]
}
