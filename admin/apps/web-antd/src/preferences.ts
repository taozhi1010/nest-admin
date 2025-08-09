import { defineOverridesPreferences } from '@vben/preferences';

/**
 * @description 项目配置文件
 * 只需要覆盖项目中的一部分配置，不需要的配置不用覆盖，会自动使用默认配置
 * !!! 更改配置后请清空缓存，否则可能不生效
 */
export const overridesPreferences = defineOverridesPreferences({
  // overrides
  app: {
    /**
     * 不要动这里  后端路由模式
     */
    accessMode: 'backend',
    /**
     * 不需要refresh token 由后端处理
     */
    enableRefreshToken: false,
    /**
     * 这里可以设置默认头像 url链接或vite导入的图片链接
     */
    // defaultAvatar: '',
    name: import.meta.env.VITE_APP_TITLE,
    /**
     * 不支持modal模式 需要改动的地方太多
     * 1. 正常重新登录后不会再触发接口请求 即触发登录超时的页面为空数据
     * 2. 切换租户登录后不会重新加载菜单
     */
    // loginExpiredMode: 'modal',
  },
  footer: {
    /**
     * 不显示footer
     */
    enable: false,
  },
  tabbar: {
    /**
     * 标签tab 持久化 关闭
     */
    persist: false,
    // styleType: 'card',
  },
  theme: {
    /**
     * 浅色sidebar
     */
    semiDarkSidebar: false,
  },
  /**
   * !!! 更改配置后请清空浏览器缓存
   * 在这里更换logo
   * source可选值：
   * 1. 本地public目录下的图片 需要加上/ 比如：/logo.png
   * 2. 网络图片链接
   * 3. vite导入的图片 import xxx from 'xxx.png'
   *
   * !!! 更改配置后请清空浏览器缓存
   */
  // logo: {
  //   enable: true,
  //   source: '',
  // },
});
