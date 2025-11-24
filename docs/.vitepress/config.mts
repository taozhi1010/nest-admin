import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: '/docs/',
  title: "nest-admin官方文档",
  description: "帮助你更好的使用nest-admin",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '主页', link: '/' },
      { text: '前端指南', link: '/admin-guide' },
      { text: '服务器端指南', link: '/server-guide' },
      { text: '部署', link: '/deploy-online/step' },
    ],

    sidebar: [
      {
        text: '前端指南',
        items: [
          { text: '项目概述', link: '/admin-guide' },
          { text: '技术栈', link: '/admin-guide#2-技术栈' },
          { text: '目录结构', link: '/admin-guide#3-目录结构' },
          { text: '核心功能模块', link: '/admin-guide#4-核心功能模块' },
          { text: '项目配置', link: '/admin-guide#5-项目配置' },
          { text: '运行和构建', link: '/admin-guide#6-运行和构建' },
          { text: '核心文件说明', link: '/admin-guide#7-核心文件说明' },
          { text: '开发规范', link: '/admin-guide#8-开发规范' }
        ]
      },
      {
        text: '服务器端指南',
        items: [
          { text: '服务器端项目文档', link: '/server-guide' },
        ]
      },
      {
        text: '线上部署',
        items: [
          { text: '流程简介', link: '/deploy-online/step' },
          { text: 'MySQL部署', link: '/deploy-online/mysql' },
          { text: 'Redis部署', link: '/deploy-online/redis' },
          { text: 'PM2部署', link: '/deploy-online/pm2' },
          { text: 'Nginx部署', link: '/deploy-online/nginx' },
        ]
      },
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/taozhi1010/nest-admin' }
    ]
  },
  head: [
    [
      'script',
      {},
      `var _hmt = _hmt || [];
      (function() {
        var hm = document.createElement("script");
        hm.src = "https://hm.baidu.com/hm.js?3717a8ec648bcf75b6eb6022ade6a4c7";
        var s = document.getElementsByTagName("script")[0]; 
        s.parentNode.insertBefore(hm, s);
      })();`
    ],
  ]
})
