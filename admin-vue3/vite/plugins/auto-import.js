import autoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default function createAutoImport() {
  return [
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
        { from: '@/composables/useCatTools', imports: ['useCatTools'] }
      ],
      // 全局导入，无需手动 import
      injectAtEnd: true
    }),
    Components({
      resolvers: [ElementPlusResolver()]
    })
  ]
}
