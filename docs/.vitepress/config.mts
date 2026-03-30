import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "nest-admin使用指南",
  description: "帮助你更好的使用nest-admin",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "主页", link: "/" },
      { text: "部署", link: "/deploy-online/step" },
      { text: "开发", link: "/development-tips/partner" },
    ],

    sidebar: {
      "/deploy-online/": [
        {
          text: "线上部署",
          items: [
            { text: "流程简介", link: "/deploy-online/step" },
            { text: "MySQL部署", link: "/deploy-online/mysql" },
            { text: "Redis部署", link: "/deploy-online/redis" },
            { text: "PM2部署", link: "/deploy-online/pm2" },
            { text: "Nginx部署", link: "/deploy-online/nginx" },
          ],
        },
      ],
      "/development-tips/": [
        {
          text: "项目开发",
          items: [
            {
              text: "协作开发",
              link: "/development-tips/partner",
            },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: "github", link: "https://github.com/taozhi1010/nest-admin" },
    ],
  },
});
