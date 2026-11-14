import { Inject } from '@nestjs/common';
import { CacheEnum } from 'src/common/enum';
import { paramsKeyGetObj } from 'src/common/utils/decorator';
import { isCaptchaRequired } from 'src/common/utils/login-captcha';
import { ResultData } from 'src/common/utils/result';
import { ConfigService } from '../../module/system/config/config.service';
import { RedisService } from '../../module/common/redis/redis.service';

/**
 * 验证码校验装饰器
 * @param CACHE_KEY 方法参数名，装饰器从该参数上读取 uuid/code
 * @param mode 校验模式
 *        - 'conditional'（默认）：按登录失败次数动态决定是否校验（登录场景）
 *        - 'always'：无条件校验（注册等防刷场景）
 */
export function Captcha(CACHE_KEY: string, mode: 'conditional' | 'always' = 'conditional') {
  const injectRedis = Inject(RedisService);
  const injectConfig = Inject(ConfigService);

  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    injectRedis(target, 'redisService');
    injectConfig(target, 'configService');

    const originMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const user = paramsKeyGetObj(originMethod, CACHE_KEY, args);
      const required = mode === 'always' ? true : await isCaptchaRequired(this.configService, this.redisService, user?.username);

      if (required) {
        const code = await this.redisService.get(CacheEnum.CAPTCHA_CODE_KEY + user.uuid);

        if (!user.code) return ResultData.fail(500, `请输入验证码`);
        if (!code) return ResultData.fail(500, `验证码已过期`);
        if (String(code) !== String(user.code)) return ResultData.fail(500, `验证码错误`);

        // 验证码一次性使用，校验通过后立即作废
        await this.redisService.del(CacheEnum.CAPTCHA_CODE_KEY + user.uuid);
      }

      const result = await originMethod.apply(this, args);

      return result;
    };
  };
}
