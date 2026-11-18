import path from 'path';

import { defineConfig, loadEnv } from 'vite';

import createVitePlugins from './vite/plugins/index.ts';

import type { UserConfig, ConfigEnv } from 'vite';

// 打包后的文件是否开启 hash
const outputHash = true;

// https://vitejs.dev/config/
export default defineConfig(({ mode, command }: ConfigEnv): UserConfig => {
  // 从项目根目录加载环境变量（Vite 默认行为）
  const env = loadEnv(mode, process.cwd());
  const { VITE_APP_ENV } = env;

  console.log('🔥 mode:', mode);
  console.log('🔥 VITE_APP_BASE_API:', env.VITE_APP_BASE_API);
  console.log('🔥 VITE_APP_TITLE:', env.VITE_APP_TITLE);
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
        '~': path.resolve(import.meta.dirname, './'),
        // 设置别名
        '@': path.resolve(import.meta.dirname, './src')
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
          changeOrigin: true
          // 不重写路径，直接转发到后端的 /uploads
          // 后端静态资源路径：http://localhost:8080/uploads/avatar/xxx.png
        },
        // 头像资源代理（开发环境专用）
        '/profile': {
          target: 'http://localhost:8080',
          changeOrigin: true
        },
        // 项目文档（VitePress，本地 docs 服务提供）
        '/manual': {
          target: 'http://localhost:5173',
          changeOrigin: true,
          ws: true
        }
      }
    },
    build: {
      assetsDir: 'static',
      // 构建警告阈值（kib）。当前最大合法 chunk 为 md-editor（约 1.9M，内嵌
      // katex/mermaid/codemirror，仅文章编辑页懒加载）与 echarts（约 1M），阈值略高于
      // 最大合法件保证"已知良好状态零警告"——超阈值即意外膨胀，需人工甄别，禁止调高了事
      chunkSizeWarningLimit: 2000,
      // build时启用/禁用 CSS 代码拆分
      cssCodeSplit: true,
      // 生产环境构建文件的目录名
      outDir: 'dist',
      // 构建前是否清空输出目录
      emptyOutDir: true,
      // 启用/禁用 gzip 压缩大小报告（仅跳过慢的压缩计算，不吞警告）
      reportCompressedSize: false,
      // 减少小文件的生成
      minify: 'esbuild',
      target: 'es2015',
      sourcemap: false,
      rollupOptions: {
        // 定向关闭 ineffectiveDynamicImport check：permission.ts 对 Layout/InnerLink 的
        // 动态导入是 router ↔ layout ↔ permissionStore 循环依赖的求值安全阀（改成静态
        // 导入会运行时 TDZ 崩溃），该提示"动态导入不会挪 chunk"正是我们要的效果
        checks: {
          ineffectiveDynamicImport: false
        },
        output: {
          chunkFileNames: outputHash ? 'static/js/[name]-[hash].js' : 'static/js/[name].js',
          entryFileNames: outputHash ? 'static/js/[name]-[hash].js' : 'static/js/[name].js',
          assetFileNames: outputHash ? 'static/[ext]/[name]-[hash].[ext]' : 'static/[ext]/[name].[ext]',
          // rolldown（vite 8 内核）分包：旧的函数式 manualChunks 在 rolldown 下分组错位
          // （element-plus 曾整包落进 auth-other-pages），改用 codeSplitting.groups。
          // test 用 [\\/] 匹配路径分隔符兼容 Windows；priority 高者先捕获；
          // 业务代码不设组，走路由动态导入自然分包，体积由 chunkSizeWarningLimit 兜底
          codeSplitting: {
            groups: [
              {
                name: 'element-plus',
                test: /node_modules[\\/](element-plus|@element-plus)[\\/]/,
                priority: 3
              },
              {
                name: 'echarts',
                test: /node_modules[\\/](echarts|zrender)[\\/]/,
                priority: 3
              },
              {
                // 富文本编辑器及其独占依赖（codemirror/markdown-it 系），体积大且极少变更，独立分包利于缓存
                name: 'md-editor',
                test: /node_modules[\\/](md-editor-v3|medium-zoom|markdown-it[a-z-]*|@codemirror|codemirror|@lezer|@vavt|@lucide|xss)[\\/]/,
                priority: 2
              },
              {
                name: 'vue-vendor',
                test: /node_modules[\\/](@vue|vue|vue-router|pinia|vue-demi|@vueuse)[\\/]/,
                priority: 2
              },
              {
                // 其余第三方库兜底
                name: 'vendor',
                test: /node_modules[\\/]/
              }
            ]
          }
        }
      }
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
                  atRule.remove();
                }
              }
            }
          }
        ]
      },
      preprocessorOptions: {
        scss: {}
      },
      devSourcemap: true
    }
  };
});
