import { defineConfig, loadEnv } from 'vite'
import path from 'path'

import createVitePlugins from './vite/plugins'

// 打包后的文件是否开启 hash
const outputHash = true

// https://vitejs.dev/config/
export default defineConfig(({ mode, command }) => {
  // 从项目根目录加载环境变量（Vite 默认行为）
  const env = loadEnv(mode, process.cwd())
  const { VITE_APP_ENV } = env

  console.log('🔥 mode:', mode)
  console.log('🔥 VITE_APP_BASE_API:', env.VITE_APP_BASE_API)
  console.log('🔥 VITE_APP_TITLE:', env.VITE_APP_TITLE)
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
        // API 请求代理
        '/dev-api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/dev-api/, '')
        },
        // 图片资源代理（开发环境专用）
        '/uploads': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          // 不重写路径，直接转发到后端的 /uploads
          // 后端静态资源路径：http://localhost:8080/uploads/avatar/xxx.png
        },
        // 头像资源代理（开发环境专用）
        "/profile":{
          target: 'http://localhost:8080',
          changeOrigin: true,
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
      // 构建前是否清空输出目录
      emptyOutDir: true,
      // 启用/禁用 gzip 压缩大小报告
      reportCompressedSize: false,
      // 减少小文件的生成
      minify: 'esbuild',
      target: 'es2015',
      sourcemap: false,
      rollupOptions: {
        onwarn: () => {
          return
        },
        output: {
          chunkFileNames: outputHash ? 'static/js/[name]-[hash].js' : 'static/js/[name].js',
          entryFileNames: outputHash ? 'static/js/[name]-[hash].js' : 'static/js/[name].js',
          assetFileNames: outputHash ? 'static/[ext]/[name]-[hash].[ext]' : 'static/[ext]/[name].[ext]',
          // 优化代码分割策略，减少文件碎片化
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              // echarts 单独拆分（大型图表库）
              if (id.includes('echarts')) {
                return 'echarts'
              }
              // element-plus UI 库单独拆分
              if (id.includes('element-plus')) {
                return 'element-plus'
              }
              // Vue 相关库合并
              if (id.includes('vue') || id.includes('vue-router') || id.includes('pinia') || id.includes('@vue')) {
                return 'vue-vendor'
              }
              // 所有其他第三方库都合并到 vendor，避免碎片化
              return 'vendor'
            }
            
            // 对于 src 目录下的业务代码，按大模块分组
            // 系统管理模块 - 合并为一个
            if (id.includes('src/views/system/') || id.includes('src/api/system/')) {
              return 'system-module'
            }
            // 监控模块
            if (id.includes('src/views/monitor') || id.includes('src/api/monitor')) {
              return 'monitor-module'
            }
            // 工具模块
            if (id.includes('src/views/tool') || id.includes('src/api/tool')) {
              return 'tool-module'
            }
            // 游戏模块
            if (id.includes('src/views/game') || id.includes('src/api/game')) {
              return 'game-module'
            }
            // layout、components、store、router、utils、api、composables、hooks 等全部合并
            if (id.includes('src/layout') || id.includes('src/components') || 
                id.includes('src/store') || id.includes('src/router') || 
                id.includes('src/utils') || id.includes('src/api') ||
                id.includes('src/composables') || id.includes('src/hooks') ||
                id.includes('src/directive') || id.includes('src/plugins') ||
                id.includes('src/settings') || id.includes('src/permission')) {
              return 'core-app'
            }
            // 登录页面单独拆分（首屏需要）
            if (id.includes('src/views/login')) {
              return 'login-page'
            }
            // 注册、错误页面、重定向合并
            if (id.includes('src/views/register') || id.includes('src/views/error') || id.includes('src/views/redirect')) {
              return 'auth-other-pages'
            }
            // 首页和个人中心
            if (id.includes('src/views/index') || id.includes('src/views/system/user/profile')) {
              return 'dashboard-profile'
            }
            // 测试页面
            if (id.includes('src/views/test')) {
              return 'test-pages'
            }
          }
        }
      },
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
