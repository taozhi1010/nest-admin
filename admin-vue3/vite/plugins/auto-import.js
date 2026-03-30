import autoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default function createAutoImport() {
  return [
    autoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      dts: true, // 启用类型声明生成
      resolvers: [ElementPlusResolver()],
      dirs: ['./src/composables']
    }),
    Components({
      resolvers: [ElementPlusResolver()]
    })
  ]
}