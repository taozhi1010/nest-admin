import { scryptSync, randomBytes, timingSafeEqual } from 'crypto';

/**
 * 密码工具类 - 使用原生 Node.js crypto 替代 bcrypt
 */
export class PasswordUtil {
  /**
   * 生成密码哈希
   * @param password 明文密码
   * @returns 哈希后的密码 (格式: salt:hash)
   */
  static hashSync(password: string): string {
    const salt = randomBytes(16).toString('hex');
    const hash = scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hash}`;
  }

  /**
   * 验证密码
   * @param password 明文密码
   * @param storedHash 存储的哈希密码
   * @returns 是否匹配
   */
  static compareSync(password: string, storedHash: string): boolean {
    try {
      // 兼容旧的 bcrypt 格式 (以 $2b$ 开头)
      if (storedHash.startsWith('$2b$')) {
        // 如果是旧的 bcrypt 格式，需要使用 bcrypt 验证
        // 这里暂时返回 false，您可以保留 bcrypt 依赖来验证旧密码
        // 或者提示用户重置密码
        return false;
      }

      // 新格式: salt:hash
      const [salt, hash] = storedHash.split(':');
      if (!salt || !hash) {
        return false;
      }

      const hashedPassword = scryptSync(password, salt, 64).toString('hex');
      return timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(hashedPassword, 'hex'));
    } catch (error) {
      return false;
    }
  }

  /**
   * 检查是否为旧的 bcrypt 格式
   * @param hash 哈希字符串
   * @returns 是否为 bcrypt 格式
   */
  static isBcryptHash(hash: string): boolean {
    return hash.startsWith('$2b$') || hash.startsWith('$2a$') || hash.startsWith('$2y$');
  }

  /**
   * 生成盐值（为了兼容旧代码中的 genSaltSync 调用）
   * @param rounds 轮数（忽略，仅为兼容性）
   * @returns 固定返回 10（兼容性）
   */
  static genSaltSync(rounds?: number): string {
    // 返回字符串 "10" 以兼容原有的 Number.parseFloat() 调用
    return "10";
  }
}
