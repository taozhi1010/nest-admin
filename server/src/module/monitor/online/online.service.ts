import { Injectable } from '@nestjs/common';
import { ResultData } from 'src/common/utils/result';
import { RedisService } from 'src/module/redis/redis.service';
import { CacheEnum } from 'src/common/enum/index';
import { Paginate } from 'src/common/utils/index';

@Injectable()
export class OnlineService {
  constructor(private readonly redisService: RedisService) {}
  /**
   * 日志列表-分页
   * @param query
   * @returns
   */
  async findAll(query) {
    const kes = await this.redisService.keys(`${CacheEnum.LOGIN_TOKEN_KEY}*`);
    const data = await this.redisService.mget(kes);
    const list = Paginate(
      {
        list: data,
        pageSize: query.pageSize,
        pageNum: query.pageNum,
      },
      query,
    ).map((item) => {
      return {
        tokenId: item.token,
        deptName: item.user.deptName,
        userName: item.username,
        ipaddr: item.ipaddr,
        loginLocation: item.loginLocation,
        browser: item.browser,
        os: item.os,
        loginTime: item.loginTime,
      };
    });
    return ResultData.ok({
      list,
      total: data.length,
    });
  }

  async delete(token: string) {
    await this.redisService.del(`${CacheEnum.LOGIN_TOKEN_KEY}${token}`);
    return ResultData.ok();
  }
}
