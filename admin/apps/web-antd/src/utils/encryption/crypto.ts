import CryptoJS from 'crypto-js';

function randomUUID() {
  const chars = [
    ...'0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  ];
  const uuid = Array.from({ length: 36 });
  let rnd = 0;
  let r: number;
  for (let i = 0; i < 36; i++) {
    if (i === 8 || i === 13 || i === 18 || i === 23) {
      uuid[i] = '-';
    } else if (i === 14) {
      uuid[i] = '4';
    } else {
      if (rnd <= 0x02)
        rnd = Math.trunc(0x2_00_00_00 + Math.random() * 0x1_00_00_00);
      r = rnd & 16;
      rnd = rnd >> 4;
      uuid[i] = chars[i === 19 ? (r & 0x3) | 0x8 : r];
    }
  }
  return uuid.join('').replaceAll('-', '').toLowerCase();
}

/**
 * 随机生成aes 密钥
 *
 * @returns aes 密钥
 */
export function generateAesKey() {
  return CryptoJS.enc.Utf8.parse(randomUUID());
}

/**
 * base64编码
 * @param str
 * @returns base64编码
 */
export function encryptBase64(str: CryptoJS.lib.WordArray) {
  return CryptoJS.enc.Base64.stringify(str);
}

/**
 * 使用公钥加密
 * @param message 加密内容
 * @param aesKey aesKey
 * @returns 使用公钥加密
 */
export function encryptWithAes(
  message: string,
  aesKey: CryptoJS.lib.WordArray,
) {
  const encrypted = CryptoJS.AES.encrypt(message, aesKey, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  });
  return encrypted.toString();
}

/**
 * 解密base64
 */
export function decryptBase64(str: string) {
  return CryptoJS.enc.Base64.parse(str);
}

/**
 * 使用密钥对数据进行解密
 */
export function decryptWithAes(
  message: string,
  aesKey: CryptoJS.lib.WordArray,
) {
  const decrypted = CryptoJS.AES.decrypt(message, aesKey, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  });
  return decrypted.toString(CryptoJS.enc.Utf8);
}
