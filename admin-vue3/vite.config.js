import { defineConfig, loadEnv } from 'vite'
import path from 'path'

import createVitePlugins from './vite/plugins'

// 打包后的文件是否开启hash
const outputHash = true

// https://vitejs.dev/config/
export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd())
  const { VITE_APP_ENV } = env
  return {
    // 部署生产环境和开发环境下的URL。
    // 默认情况下，vite 会假设你的应用是被部署在一个域名的根路径上
    // 例如 https://www.ruoyi.vip/。如果应用被部署在一个子路径上，你就需要用这个选项指定这个子路径。例如，如果你的应用被部署在 https://www.ruoyi.vip/admin/，则设置 baseUrl 为 /admin/。
    base: VITE_APP_ENV === 'production' ? '/' : '/',
    plugins: createVitePlugins(env, command === 'build'),
    resolve: {
      // https://cn.vitejs.dev/config/#resolve-alias
      alias: {
        // 设置路径
        '~': path.resolve(__dirname, './'),
        // 设置别名
        '@': path.resolve(__dirname, './src')
      },
      // https://cn.vitejs.dev/config/#resolve-extensions
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
    },
    // vite 相关配置
    server: {
      port: 8888,
      host: true,
      open: true,
      proxy: {
        // https://cn.vitejs.dev/config/#server-proxy
        '/dev-api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/dev-api/, '')
        }
      }
    },
    build: {
      assetsDir: 'static',
      // build时规定触发警告的 chunk 大小。（以 kbs 为单位）
      chunkSizeWarningLimit: 20480,
      // build时启用/禁用 CSS 代码拆分
      cssCodeSplit: true,
      // 生产环境构建文件的目录名
      outDir: 'dist',
      // 启用/禁用 gzip 压缩大小报告
      reportCompressedSize: false,
      rollupOptions: {
        onwarn: () => {
          return
        },
        output: {
          chunkFileNames: outputHash ? 'static/js/[name]-[hash].js' : 'static/js/[name].js',
          entryFileNames: outputHash ? 'static/js/[name]-[hash].js' : 'static/js/[name].js',
          assetFileNames: outputHash ? 'static/[ext]/[name]-[hash].[ext]' : 'static/[ext]/[name].[ext]',
          manualChunks: {
            'element-plus': ['element-plus'],
            echarts: ['echarts'],
            vuedraggable: ['vuedraggable']
          }
        }
      },
      // 混淆器 boolean | 'terser' | 'esbuild'
      minify: 'esbuild',
      target: 'es2015',
      sourcemap: false
    },
    //fix:error:stdin>:7356:1: warning: "@charset" must be the first rule in the file
    css: {
      postcss: {
        plugins: [
          {
            postcssPlugin: 'internal:charset-removal',
            AtRule: {
              charset: (atRule) => {
                if (atRule.name === 'charset') {
                  atRule.remove()
                }
              }
            }
          }
        ]
      },
      preprocessorOptions: {
        scss: {
          sassOptions: { outputStyle: 'compressed' }
        }
      },
      devSourcemap: true
    }
  }
})
