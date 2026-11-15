import { Controller, Get, Post, Body, HttpCode, Res, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiQuery } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, SendEmailCodeDto } from './dto/index';
import { createMath } from 'src/common/utils/captcha';
import { isCaptchaRequired } from 'src/common/utils/login-captcha';
import { ResultData } from 'src/common/utils/result';
import { GenerateUUID } from 'src/common/utils/index';
import { RedisService } from 'src/module/common/redis/redis.service';
import { MailService } from 'src/module/common/mail/mail.service';
import { CacheEnum } from 'src/common/enum/index';
import { ConfigService } from '../config/config.service';
import { ClientInfo, ClientInfoDto } from 'src/common/decorators/common.decorator';
import { NotRequireAuth, User, UserDto } from '../user/user.decorator';

@ApiTags('认证')
@Controller('/')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  @ApiOperation({
    summary: '用户登录',
  })
  @ApiBody({
    type: LoginDto,
    required: true,
  })
  @Post('/login')
  @HttpCode(200)
  login(@Body() user: LoginDto, @ClientInfo() clientInfo: ClientInfoDto) {
    return this.authService.login(user, clientInfo);
  }

  @ApiOperation({
    summary: '退出登录',
  })
  @ApiBody({
    type: LoginDto,
    required: true,
  })
  @NotRequireAuth()
  @Post('/logout')
  @HttpCode(200)
  logout(@User() user: UserDto, @ClientInfo() clientInfo: ClientInfoDto) {
    return this.authService.logout(user, clientInfo);
  }

  @ApiOperation({
    summary: '用户注册',
  })
  @ApiBody({
    type: RegisterDto,
    required: true,
  })
  @Post('/register')
  @HttpCode(200)
  register(@Body() user: RegisterDto, @ClientInfo() clientInfo: ClientInfoDto) {
    return this.authService.register(user, clientInfo.ipaddr);
  }

  @ApiOperation({
    summary: '检查账号是否已被注册',
  })
  @ApiQuery({
    name: 'username',
    required: true,
    description: '账号，2-50 个字符',
  })
  @NotRequireAuth()
  @Get('/register/check')
  async checkUsername(@Query('username') username: string) {
    const name = (username || '').trim();
    if (name.length < 2 || name.length > 50) {
      return ResultData.fail(400, '账号长度必须为 2 到 50 个字符');
    }
    return await this.authService.checkUsername(name);
  }

  @ApiOperation({
    summary: '获取注册页配置（是否开启邮箱验证码注册）',
  })
  @NotRequireAuth()
  @Get('/register/config')
  getRegisterConfig() {
    return ResultData.ok({ emailRegisterEnabled: this.mailService.isEnabled() });
  }

  @ApiOperation({
    summary: '发送注册邮箱验证码',
  })
  @ApiBody({
    type: SendEmailCodeDto,
    required: true,
  })
  @NotRequireAuth()
  @Post('/register/emailCode')
  @HttpCode(200)
  sendEmailCode(@Body() dto: SendEmailCodeDto, @ClientInfo() clientInfo: ClientInfoDto) {
    return this.authService.sendEmailCode(dto.email, clientInfo.ipaddr);
  }

  @ApiOperation({
    summary: '获取验证图片',
  })
  @Get('/captchaImage')
  async captchaImage(@Query('username') username: string, @Query('type') type: string, @Res() res) {
    // type=register：注册验证码无条件生成；默认登录场景按账号失败次数动态判断
    const required = type === 'register' ? true : await isCaptchaRequired(this.configService, this.redisService, username);

    const data = {
      captchaEnabled: required,
      img: '',
      uuid: '',
    };
    try {
      if (required) {
        const captchaInfo = createMath();
        data.img = captchaInfo.data;
        data.uuid = GenerateUUID();
        await this.redisService.set(CacheEnum.CAPTCHA_CODE_KEY + data.uuid, captchaInfo.text.toLowerCase(), 1000 * 60 * 5);
      }

      // 设置响应头禁用缓存
      res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.header('Pragma', 'no-cache');
      res.header('Expires', '0');

      return res.json(ResultData.ok(data, '操作成功'));
    } catch (err) {
      console.error('生成验证码错误:', err);
      return res.json(ResultData.fail(500, '生成验证码错误，请重试'));
    }
  }

  @ApiOperation({
    summary: '用户信息',
  })
  @Get('/getInfo')
  async getInfo(@User() user: UserDto, @Res() res) {
    // 设置响应头禁用缓存
    res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.header('Pragma', 'no-cache');
    res.header('Expires', '0');

    const { password: _password, ...safeUser } = user.user;

    return res.json({
      msg: '操作成功',
      code: 200,
      permissions: user.permissions,
      roles: user.roles,
      user: safeUser,
    });
  }

  @ApiOperation({
    summary: '路由信息',
  })
  @Get('/getRouters')
  getRouters(@User() user: UserDto) {
    const userId = user.user.userId.toString();
    return this.authService.getRouters(+userId);
  }
}
