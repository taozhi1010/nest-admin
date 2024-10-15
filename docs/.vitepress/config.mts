import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "nest-admin使用指南",
  description: "帮助你更好的使用nest-admin",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '主页', link: '/' },
      { text: '部署', link: '/deploy-online/step' },
    ],

    sidebar: [
      {
        text: '线上部署',
        items: [
          { text: '流程简介', link: '/deploy-online/step' },
          { text: 'MySQL部署', link: '/deploy-online/mysql' },
          { text: 'Redis部署', link: '/deploy-online/redis' },
          { text: 'PM2部署', link: '/deploy-online/pm2' },
          { text: 'Nginx部署', link: '/deploy-online/nginx' },
        ]
      }
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/taozhi1010/nest-admin' }
    ]
  }
})
