import { Injectable } from '@nestjs/common';
import { randomInt } from 'crypto';
import { ResultData } from 'src/common/utils/result';
import { SUCCESS_CODE } from 'src/common/utils/result';
import { UserService } from '../system/user/user.service';
import { LoginlogService } from '../monitor/loginlog/loginlog.service';
import { AxiosService } from 'src/module/common/axios/axios.service';
import { RedisService } from 'src/module/common/redis/redis.service';
import { MailService } from 'src/module/common/mail/mail.service';
import { CacheEnum } from 'src/common/enum/index';
import { EMAIL_CODE_EXPIRESIN, EMAIL_SEND_COOLDOWN, EMAIL_SEND_HOURLY_EXPIRESIN, EMAIL_SEND_HOURLY_LIMIT, EMAIL_SEND_IP_EXPIRESIN, EMAIL_SEND_IP_LIMIT } from 'src/common/constant/index';
import { RegisterDto, LoginDto } from './dto/index';
import { MenuService } from '../system/menu/menu.service';
import { ClientInfoDto } from 'src/common/decorators/common.decorator';
@Injectable()
export class MainService {
  constructor(
    private readonly userService: UserService,
    private readonly loginlogService: LoginlogService,
    private readonly axiosService: AxiosService,
    private readonly menuService: MenuService,
    private readonly redisService: RedisService,
    private readonly mailService: MailService,
  ) {}

  /**
   * 登陆
   * @param user
   * @returns
   */
  async login(user: LoginDto, clientInfo: ClientInfoDto) {
    const loginTime = new Date();
    const loginLog = {
      ...clientInfo,
      userName: user.username,
      status: '0',
      msg: '',
      loginTime: loginTime,
    };
    try {
      const loginLocation = await this.axiosService.getIpAddress(clientInfo.ipaddr);
      loginLog.loginLocation = loginLocation;
    } catch (error) {}
    const loginRes = await this.userService.login(user, loginLog);
    loginLog.status = loginRes.code === SUCCESS_CODE ? '0' : '1';
    loginLog.msg = loginRes.msg;
    this.loginlogService.create(loginLog);
    return loginRes;
  }
  /**
   * 退出登陆
   * @param clientInfo
   */
  async logout(clientInfo: ClientInfoDto) {
    const loginTime = new Date();
    const loginLog = {
      ...clientInfo,
      status: '0',
      msg: '退出成功',
      loginTime: loginTime,
    };
    try {
      const loginLocation = await this.axiosService.getIpAddress(clientInfo.ipaddr);
      loginLog.loginLocation = loginLocation;
    } catch (error) {}
    this.loginlogService.create(loginLog);
    return ResultData.ok();
  }
  /**
   * 注册
   * @param user
   * @param ipaddr 客户端 IP，用于注册频率限制
   * @returns
   */
  async register(user: RegisterDto, ipaddr: string) {
    return await this.userService.register(user, ipaddr);
  }

  /**
   * 检查账号是否已被注册
   * @param username
   * @returns
   */
  async checkUsername(username: string) {
    return await this.userService.checkUsername(username);
  }

  /**
   * 发送注册邮箱验证码
   * @param email 收件邮箱
   * @param ipaddr 客户端 IP，用于发送频率限制
   */
  async sendEmailCode(email: string, ipaddr: string) {
    if (!this.mailService.isEnabled()) {
      return ResultData.fail(500, '邮箱验证码注册未开启');
    }
    // 邮箱已被注册时提前拦截，不消耗发送冷却
    const emailRes = await this.userService.checkEmailRegistered(email);
    if (emailRes.data?.exists) {
      return ResultData.fail(500, `该邮箱已被其他账号使用`);
    }
    // 同一邮箱发码冷却
    const emailCount = await this.redisService.incr(CacheEnum.EMAIL_SEND_RATE_KEY + email, EMAIL_SEND_COOLDOWN);
    if (emailCount > 1) {
      const cooldownSec = (await this.redisService.ttl(CacheEnum.EMAIL_SEND_RATE_KEY + email)) || EMAIL_SEND_COOLDOWN / 1000;
      return ResultData.fail(429, `验证码发送过于频繁，请 ${Math.max(Math.ceil(cooldownSec), 1)} 秒后再试`);
    }
    // 同一邮箱每小时发码上限，防止单个邮箱被轰炸触发邮件服务商拦截
    const hourlyCount = await this.redisService.incr(CacheEnum.EMAIL_SEND_HOURLY_KEY + email, EMAIL_SEND_HOURLY_EXPIRESIN);
    if (hourlyCount > EMAIL_SEND_HOURLY_LIMIT) {
      const hourlySec = (await this.redisService.ttl(CacheEnum.EMAIL_SEND_HOURLY_KEY + email)) || EMAIL_SEND_HOURLY_EXPIRESIN / 1000;
      return ResultData.fail(429, `该邮箱本小时内发码次数已达上限，请 ${Math.max(Math.ceil(hourlySec / 60), 1)} 分钟后再试`);
    }
    // 同一 IP 发码频率限制
    const ipCount = await this.redisService.incr(CacheEnum.EMAIL_SEND_IP_KEY + ipaddr, EMAIL_SEND_IP_EXPIRESIN);
    if (ipCount > EMAIL_SEND_IP_LIMIT) {
      return ResultData.fail(429, '操作过于频繁，请稍后再试');
    }
    // 6 位数字验证码，存 Redis 5 分钟，注册成功后才作废（失败可重试）
    const code = String(randomInt(0, 1000000)).padStart(6, '0');
    await this.redisService.set(CacheEnum.EMAIL_CODE_KEY + email, code, EMAIL_CODE_EXPIRESIN);
    try {
      await this.mailService.sendVerificationCode(email, code, EMAIL_CODE_EXPIRESIN / 1000 / 60);
    } catch (error) {
      console.error('发送注册验证码邮件失败:', error);
      // 发送失败不占用发码冷却，用户可立即重试；每小时上限与 IP 限流照常计数防刷
      await this.redisService.del(CacheEnum.EMAIL_SEND_RATE_KEY + email);
      return ResultData.fail(500, '验证码发送失败，请稍后重试');
    }
    return ResultData.ok(null, '验证码已发送，请查收邮件');
  }

  /**
   * 登陆记录
   */
  loginRecord() {}

  /**
   * 获取路由菜单
   */
  async getRouters(userId: number) {
    const menus = await this.menuService.getMenuListByUserId(userId);
    return ResultData.ok(menus);
  }
}
