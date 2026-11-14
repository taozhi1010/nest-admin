import type { RedisService } from 'src/module/common/redis/redis.service';
import type { ConfigService } from 'src/module/system/config/config.service';
import { CacheEnum } from '../enum/index';

/**
 * 连续登录失败达到该次数后，下次登录需要验证码
 */
export const CAPTCHA_FAIL_THRESHOLD = 3;

/**
 * 失败计数保留时长（毫秒），每次失败会重新计时
 */
export const CAPTCHA_FAIL_TTL = 30 * 60 * 1000;

const failCountKey = (username: string) => `${CacheEnum.PWD_ERR_CNT_KEY}${username}`;

/**
 * 验证码总开关，读取配置失败时默认开启
 */
export async function isCaptchaEnabled(configService: ConfigService): Promise<boolean> {
  try {
    return (await configService.getConfigValue('sys.account.captchaEnabled')) === 'true';
  } catch {
    return true;
  }
}

/**
 * 账号连续登录失败次数
 */
export async function getLoginFailCount(redisService: RedisService, username: string): Promise<number> {
  if (!username) return 0;
  const count = await redisService.get(failCountKey(username));
  return Number(count) || 0;
}

/**
 * 本次登录是否需要验证码：总开关开启且该账号连续失败达到阈值
 */
export async function isCaptchaRequired(configService: ConfigService, redisService: RedisService, username: string): Promise<boolean> {
  if (!username) return false;
  if (!(await isCaptchaEnabled(configService))) return false;
  return (await getLoginFailCount(redisService, username)) >= CAPTCHA_FAIL_THRESHOLD;
}

/**
 * 记录一次登录失败
 */
export async function recordLoginFailure(redisService: RedisService, username: string): Promise<number> {
  if (!username) return 0;
  const count = (await getLoginFailCount(redisService, username)) + 1;
  await redisService.set(failCountKey(username), count, CAPTCHA_FAIL_TTL);
  return count;
}

/**
 * 登录成功后清零失败计数
 */
export async function clearLoginFailure(redisService: RedisService, username: string): Promise<void> {
  if (!username) return;
  await redisService.del(failCountKey(username));
}
