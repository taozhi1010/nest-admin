import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "nest-admin使用指南",
  description: "用来帮助更好的使用nest-admin的教程",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: '部署', link: '/deploy' },
    ],

    sidebar: [
      {
        text: '部署文档',
        items: [
          { text: 'nginx部署', link: '/deploy' }
        ]
      }
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  }
})
