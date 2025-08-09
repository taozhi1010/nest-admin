import type {
  ApplicationConfig,
  VbenAdminProAppConfigRaw,
} from '@vben/types/global';

/**
 * 由 vite-inject-app-config 注入的全局配置
 */
export function useAppConfig(
  env: Record<string, any>,
  isProduction: boolean,
): ApplicationConfig {
  // 生产环境下，直接使用 window._VBEN_ADMIN_PRO_APP_CONF_ 全局变量
  const config = isProduction
    ? window._VBEN_ADMIN_PRO_APP_CONF_
    : (env as VbenAdminProAppConfigRaw);

  const {
    VITE_GLOB_API_URL,
    VITE_GLOB_APP_CLIENT_ID,
    VITE_GLOB_ENABLE_ENCRYPT,
    VITE_GLOB_RSA_PRIVATE_KEY,
    VITE_GLOB_RSA_PUBLIC_KEY,
    VITE_GLOB_SSE_ENABLE,
  } = config;

  return {
    // 后端地址
    apiURL: VITE_GLOB_API_URL,
    // 客户端key
    clientId: VITE_GLOB_APP_CLIENT_ID,
    enableEncrypt: VITE_GLOB_ENABLE_ENCRYPT === 'true',
    // RSA私钥
    rsaPrivateKey: VITE_GLOB_RSA_PRIVATE_KEY,
    // RSA公钥
    rsaPublicKey: VITE_GLOB_RSA_PUBLIC_KEY,
    // 是否开启sse
    sseEnable: VITE_GLOB_SSE_ENABLE === 'true',
  };
}
