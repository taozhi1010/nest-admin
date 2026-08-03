import { Inject } from '@nestjs/common';
import { CacheEnum } from 'src/common/enum';
import { paramsKeyGetObj } from 'src/common/utils/decorator';
import { ResultData } from 'src/common/utils/result';
import { ConfigService } from '../../module/system/config/config.service';
import { RedisService } from '../../module/common/redis/redis.service';

export function Captcha(CACHE_KEY: string) {
  const injectRedis = Inject(RedisService);
  const injectConfig = Inject(ConfigService);

  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    injectRedis(target, 'redisService');
    injectConfig(target, 'configService');

    const originMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const enable = await this.configService.getConfigValue('sys.account.captchaEnabled');
      const captchaEnabled: boolean = enable === 'true';

      if (captchaEnabled) {
        const user = paramsKeyGetObj(args, CACHE_KEY);
        const code = await this.redisService.get(CacheEnum.CAPTCHA_CODE_KEY + user.uuid);

        if (!user.code) return ResultData.fail(500, `请输入验证码`);
        if (!code) return ResultData.fail(500, `验证码已过期`);
        // 验证码忽略大小写：存储时已 toLowerCase，比较时统一转小写
        if (code !== user.code.toLowerCase()) return ResultData.fail(500, `验证码错误`);
        // 验证通过后删除验证码，防止重放攻击
        await this.redisService.del(CacheEnum.CAPTCHA_CODE_KEY + user.uuid);
      }

      const result = await originMethod.apply(this, args);

      return result;
    };
  };
}
