import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { randomInt } from 'crypto';
import * as bcrypt from 'bcryptjs';
import { RedisService } from 'src/module/common/redis/redis.service';
import { GetNowDate, GenerateUUID } from 'src/common/utils/index';
import { CacheEnum, DelFlagEnum, StatusEnum } from 'src/common/enum/index';
import {
  LOGIN_TOKEN_EXPIRESIN,
  REGISTER_IP_LIMIT,
  REGISTER_RATE_EXPIRESIN,
  SYS_USER_TYPE,
  EMAIL_CODE_EXPIRESIN,
  EMAIL_SEND_COOLDOWN,
  EMAIL_SEND_HOURLY_EXPIRESIN,
  EMAIL_SEND_HOURLY_LIMIT,
  EMAIL_SEND_IP_EXPIRESIN,
  EMAIL_SEND_IP_LIMIT,
} from 'src/common/constant/index';
import { ResultData, SUCCESS_CODE } from 'src/common/utils/result';
import { LoginDto, RegisterDto } from './dto/index';
import { ClientInfoDto } from 'src/common/decorators/common.decorator';
import { Captcha } from 'src/common/decorators/captcha.decorator';
import { recordLoginFailure, clearLoginFailure } from 'src/common/utils/login-captcha';
import { UserType } from '../user/dto/user';
import { UserDto } from '../user/user.decorator';
import { UserEntity } from '../user/entities/sys-user.entity';
import { SysDeptEntity } from '../dept/entities/dept.entity';
import { UserService } from '../user/user.service';
import { MenuService } from '../menu/menu.service';
import { ConfigService } from '../config/config.service';
import { MailService } from 'src/module/common/mail/mail.service';
import { LoginlogService } from 'src/module/monitor/loginlog/loginlog.service';
import { AxiosService } from 'src/module/common/axios/axios.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(SysDeptEntity)
    private readonly sysDeptEntityRep: Repository<SysDeptEntity>,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly configService: ConfigService, // @Captcha 装饰器按名注入依赖，名字不可改
    private readonly userService: UserService,
    private readonly loginlogService: LoginlogService,
    private readonly axiosService: AxiosService,
    private readonly menuService: MenuService,
    private readonly mailService: MailService,
  ) {}

  /**
   * 登陆：IP 归属地解析 + 凭证校验（含动态验证码）+ 登录日志
   * @param user
   * @returns
   */
  async login(user: LoginDto, clientInfo: ClientInfoDto) {
    const loginLog = {
      ...clientInfo,
      userName: user.username,
      status: '0',
      msg: '',
      loginTime: new Date(),
    };
    try {
      const loginLocation = await this.axiosService.getIpAddress(clientInfo.ipaddr);
      loginLog.loginLocation = loginLocation;
    } catch (error) {}
    const loginRes = await this.doLogin(user, loginLog);
    loginLog.status = loginRes.code === SUCCESS_CODE ? '0' : '1';
    loginLog.msg = loginRes.msg;
    this.loginlogService.create(loginLog);
    return loginRes;
  }

  /**
   * 登录凭证校验与会话签发
   * @param user
   * @param clientInfo 含登录日志扩展字段的客户端信息
   */
  @Captcha('user')
  private async doLogin(user: LoginDto, clientInfo: ClientInfoDto) {
    const data = await this.userRepo.findOne({
      where: {
        userName: user.username,
      },
      select: ['userId', 'password'],
    });

    if (!(data && bcrypt.compareSync(user.password, data.password))) {
      // 累计密码错误次数，达到阈值后下次登录需要验证码
      await recordLoginFailure(this.redisService, user.username);
      return ResultData.fail(500, `账号或密码错误`);
    }

    await clearLoginFailure(this.redisService, user.username);
    this.userService.clearCacheByUserId(data.userId);

    const userData = await this.userService.getUserinfo(data.userId);

    if (userData.delFlag === DelFlagEnum.DELETE) {
      return ResultData.fail(500, `您已被禁用，如需正常使用请联系管理员`);
    }
    if (userData.status === StatusEnum.STOP) {
      return ResultData.fail(500, `您已被停用，如需正常使用请联系管理员`);
    }

    /**
     * 更新用户登录信息
     */
    const loginDate = new Date();
    await this.userRepo.update(
      {
        userId: data.userId,
      },
      {
        loginDate: loginDate,
        loginIp: clientInfo.ipaddr,
      },
    );

    const uuid = GenerateUUID();
    const token = this.createToken({ uuid: uuid, userId: userData.userId });
    const permissions = await this.userService.getUserPermissions(userData.userId);
    const deptData = await this.sysDeptEntityRep.findOne({
      where: {
        deptId: userData.deptId,
      },
      select: ['deptName'],
    });

    /**
     * 设置公司名称
     */
    userData['deptName'] = deptData.deptName || '';
    const roles = userData.roles.map((item) => item.roleKey);

    const userInfo = {
      browser: clientInfo.browser,
      ipaddr: clientInfo.ipaddr,
      loginLocation: clientInfo.loginLocation,
      loginTime: loginDate,
      os: clientInfo.os,
      permissions: permissions,
      roles: roles,
      token: uuid,
      user: userData,
      userId: userData.userId,
      username: userData.userName,
      deptId: userData.deptId,
    };

    await this.updateRedisToken(uuid, userInfo);

    return ResultData.ok(
      {
        token,
      },
      '登录成功',
    );
  }

  /**
   * 退出登陆：删除 Redis 会话 + 登录日志
   * @param user
   * @param clientInfo
   */
  async logout(user: UserDto, clientInfo: ClientInfoDto) {
    const loginLog = {
      ...clientInfo,
      status: '0',
      msg: '退出成功',
      loginTime: new Date(),
    };
    if (user?.token) {
      await this.redisService.del(`${CacheEnum.LOGIN_TOKEN_KEY}${user.token}`);
    }
    try {
      const loginLocation = await this.axiosService.getIpAddress(clientInfo.ipaddr);
      loginLog.loginLocation = loginLocation;
    } catch (error) {}
    this.loginlogService.create(loginLog);
    return ResultData.ok();
  }

  /**
   * 注册
   */
  async register(user: RegisterDto, ipaddr: string) {
    // 注册验证：已配置邮件服务走邮箱验证码，否则走图片验证码
    const verifyFail = await this.validateRegisterVerification(user);
    if (verifyFail) return verifyFail;
    const loginDate = GetNowDate();
    // IP 注册频率限制：同一 IP 每小时最多 REGISTER_IP_LIMIT 次（含验证码失败的尝试）
    const rateCount = await this.redisService.incr(CacheEnum.REGISTER_RATE_KEY + ipaddr, REGISTER_RATE_EXPIRESIN);
    if (rateCount > REGISTER_IP_LIMIT) {
      return ResultData.fail(429, '注册过于频繁，请稍后再试');
    }
    const checkUserNameUnique = await this.userRepo.findOne({
      where: {
        userName: user.username,
      },
      select: ['userName'],
    });
    if (checkUserNameUnique) {
      return ResultData.fail(500, `保存用户'${user.username}'失败，注册账号已存在`);
    }
    // 邮箱占用查重（sys_user.email 无唯一索引，应用层兜底；未填邮箱时跳过）
    if (user.email) {
      const checkEmailUnique = await this.userRepo.findOne({
        where: {
          email: user.email,
        },
        select: ['userId'],
      });
      if (checkEmailUnique) {
        return ResultData.fail(500, '该邮箱已被其他账号使用');
      }
    }
    user['userName'] = user.username;
    user['nickName'] = user.username;
    user['password'] = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10));
    try {
      await this.userRepo.save({ ...user, userType: SYS_USER_TYPE.CUSTOM, loginDate });
    } catch (error) {
      // 并发注册撞车时前置查重拦不住，靠 user_name 唯一索引兜底（ER_DUP_ENTRY）
      if (error?.code === 'ER_DUP_ENTRY') {
        return ResultData.fail(500, `保存用户'${user.username}'失败，注册账号已存在`);
      }
      throw error;
    }
    // 邮箱验证码一次性使用，注册成功后才作废（失败可凭原码重试）
    if (user.email) {
      await this.redisService.del(CacheEnum.EMAIL_CODE_KEY + user.email);
    }
    return ResultData.ok();
  }

  /**
   * 注册验证方式校验：
   * - 已配置邮件服务（邮箱验证码注册开启）→ 校验邮箱验证码；验证通过不删码，注册失败可凭原码重试
   * - 未配置 → 图片验证码（原 @Captcha('user','always') 行为）
   * @returns null 表示校验通过，否则返回失败的 ResultData
   */
  private async validateRegisterVerification(user: RegisterDto): Promise<ResultData | null> {
    if (this.mailService.isEnabled()) {
      if (!user.email) return ResultData.fail(500, '请输入邮箱');
      if (!user.emailCode) return ResultData.fail(500, '请输入邮箱验证码');
      const code = await this.redisService.get(CacheEnum.EMAIL_CODE_KEY + user.email);
      if (!code) return ResultData.fail(500, '邮箱验证码已过期，请重新获取');
      if (String(code) !== String(user.emailCode)) return ResultData.fail(500, '邮箱验证码错误');
      return null;
    }
    if (!user.code) return ResultData.fail(500, '请输入验证码');
    const code = await this.redisService.get(CacheEnum.CAPTCHA_CODE_KEY + user.uuid);
    if (!code) return ResultData.fail(500, '验证码已过期');
    if (String(code) !== String(user.code)) return ResultData.fail(500, '验证码错误');
    // 图片验证码一次性使用，校验通过后立即作废
    await this.redisService.del(CacheEnum.CAPTCHA_CODE_KEY + user.uuid);
    return null;
  }

  /**
   * 检查账号是否已被注册（注册页实时校验用，注册提交时后端仍会兜底校验）
   */
  async checkUsername(username: string) {
    const exist = await this.userRepo.findOne({
      where: { userName: username },
      select: ['userId'],
    });
    return ResultData.ok({ exists: !!exist });
  }

  /**
   * 检查邮箱是否已被其他账号使用（注册发码实时校验用，注册提交时后端仍会兜底校验）
   */
  async checkEmailRegistered(email: string) {
    const exist = await this.userRepo.findOne({
      where: { email },
      select: ['userId'],
    });
    return ResultData.ok({ exists: !!exist });
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
    const emailRes = await this.checkEmailRegistered(email);
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
   * 获取路由菜单
   */
  async getRouters(userId: number) {
    const menus = await this.menuService.getMenuListByUserId(userId);
    return ResultData.ok(menus);
  }

  /**
   * 更新redis中用户权限和角色信息
   */
  async updateRedisUserRolesAndPermissions(uuid: string, userId: number) {
    const userData = await this.userService.getUserinfo(userId);

    const permissions = await this.userService.getUserPermissions(userId);
    const roles = userData.roles.map((item) => item.roleKey);

    await this.updateRedisToken(uuid, {
      permissions: permissions,
      roles: roles,
    });
  }

  /**
   * 更新redis中的元数据
   * @param token
   * @param metaData
   */
  async updateRedisToken(token: string, metaData: Partial<UserType>) {
    const oldMetaData = await this.redisService.get(`${CacheEnum.LOGIN_TOKEN_KEY}${token}`);

    let newMetaData = metaData;
    if (oldMetaData) {
      newMetaData = Object.assign(oldMetaData, metaData);
    }

    await this.redisService.set(`${CacheEnum.LOGIN_TOKEN_KEY}${token}`, newMetaData, LOGIN_TOKEN_EXPIRESIN);
  }

  /**
   * 从数据声明生成令牌
   *
   * @param payload 数据声明
   * @return 令牌
   */
  createToken(payload: { uuid: string; userId: number }): string {
    const accessToken = this.jwtService.sign(payload);
    return accessToken;
  }

  /**
   * 从令牌中获取数据声明
   *
   * @param token 令牌
   * @return 数据声明
   */
  parseToken(token: string) {
    try {
      if (!token) return null;
      const payload = this.jwtService.verify(token.replace('Bearer ', ''));
      return payload;
    } catch (error) {
      return null;
    }
  }
}
