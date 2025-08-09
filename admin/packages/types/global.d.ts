import type { RouteMeta as IRouteMeta } from '@vben-core/typings';

import 'vue-router';

declare module 'vue-router' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface RouteMeta extends IRouteMeta {}
}

export interface VbenAdminProAppConfigRaw {
  // 后端接口地址
  VITE_GLOB_API_URL: string;
  // 客户端ID
  VITE_GLOB_APP_CLIENT_ID: string;
  // # 全局加密开关(即开启了加解密功能才会生效 不是全部接口加密 需要和后端对应)
  VITE_GLOB_ENABLE_ENCRYPT: string;
  // RSA请求解密私钥
  VITE_GLOB_RSA_PRIVATE_KEY: string;
  // RSA请求加密公钥
  VITE_GLOB_RSA_PUBLIC_KEY: string;
  // 是否开启sse  注意从配置文件获取的类型为string
  VITE_GLOB_SSE_ENABLE: string;
}

export interface ApplicationConfig {
  // 后端接口地址
  apiURL: string;
  // 客户端key
  clientId: string;
  // 全局加密开关(即开启了加解密功能才会生效 不是全部接口加密 需要和后端对应)
  enableEncrypt: boolean;
  // RSA响应解密私钥
  rsaPrivateKey: string;
  // RSA请求加密公钥
  rsaPublicKey: string;
  // 是否开启sse
  sseEnable: boolean;
}

declare global {
  interface Window {
    _VBEN_ADMIN_PRO_APP_CONF_: VbenAdminProAppConfigRaw;
  }
}
