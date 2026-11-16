import { defineConfig } from 'vitepress'

export default defineConfig({
  base: '/manual/',
  title: 'nest-admin 文档',
  description: 'nest-admin 的部署与开发文档',
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '部署', link: '/deploy-online/step' },
      { text: '自动部署', link: '/deploy-online/auto-deploy-overview' },
      { text: '开发', link: '/development-tips/partner' },
      { text: '发布记录', link: '/releases' },
    ],

    sidebar: {
      '/deploy-online/': [
        {
          text: '在线部署',
          items: [
            { text: '部署概览', link: '/deploy-online/step' },
            { text: 'MySQL', link: '/deploy-online/mysql' },
            { text: 'Redis', link: '/deploy-online/redis' },
            { text: 'PM2', link: '/deploy-online/pm2' },
            { text: 'Nginx', link: '/deploy-online/nginx' },
          ],
        },
        {
          text: '自动部署',
          items: [
            { text: '最小闭环', link: '/deploy-online/auto-deploy-overview' },
            { text: '密钥配置', link: '/deploy-online/auto-deploy-secrets' },
            { text: '问题排查', link: '/deploy-online/auto-deploy-troubleshooting' },
            { text: '命令速查', link: '/deploy-online/auto-deploy-checklist' },
          ],
        },
      ],
      '/development-tips/': [
        {
          text: '开发',
          items: [
            { text: '协作开发', link: '/development-tips/partner' },
          ],
        },
      ],
      '/releases': [
        {
          text: '发布记录',
          items: [
            { text: 'v1.0.1 · 2026-10-25', link: '/releases#v1-0-1' },
            { text: 'v1.0.0 · 2026-10-25', link: '/releases#v1-0-0' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/taozhi1010/nest-admin' },
    ],
  },
})
