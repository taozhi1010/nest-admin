import * as bcrypt from 'bcryptjs';

/**
 * 密码工具类 - 使用 bcryptjs
 */
export class PasswordUtil {
  /**
   * 生成密码哈希
   * @param password 明文密码
   * @param rounds 盐值轮数，默认为 10
   * @returns 哈希后的密码
   */
  static hashSync(password: string, rounds: number = 10): string {
    const salt = bcrypt.genSaltSync(rounds);
    return bcrypt.hashSync(password, salt);
  }

  /**
   * 验证密码
   * @param password 明文密码
   * @param storedHash 存储的哈希密码
   * @returns 是否匹配
   */
  static compareSync(password: string, storedHash: string): boolean {
    try {
      return bcrypt.compareSync(password, storedHash);
    } catch (error) {
      return false;
    }
  }

  /**
   * 生成盐值
   * @param rounds 轮数，默认为 10
   * @returns 生成的盐值
   */
  static genSaltSync(rounds: number = 10): string {
    return bcrypt.genSaltSync(rounds);
  }
}
