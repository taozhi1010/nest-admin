// 密钥对生成 http://web.chacuo.net/netrsakeypair
import { useAppConfig } from '@vben/hooks';

import JSEncrypt from 'jsencrypt';

const { rsaPrivateKey, rsaPublicKey } = useAppConfig(
  import.meta.env,
  import.meta.env.PROD,
);

/**
 * 加密
 * @param txt 需要加密的数据
 * @returns 加密后的数据
 */
export function encrypt(txt: string) {
  const instance = new JSEncrypt();
  instance.setPublicKey(rsaPublicKey);
  return instance.encrypt(txt);
}

/**
 * 解密
 * @param txt 需要解密的数据
 * @returns 解密后的数据
 */
export function decrypt(txt: string) {
  const instance = new JSEncrypt();
  instance.setPrivateKey(rsaPrivateKey);
  return instance.decrypt(txt);
}
