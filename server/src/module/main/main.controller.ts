import { Controller, Get, Post, Body, HttpCode, Res, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { MainService } from './main.service';
import { RegisterDto, LoginDto } from './dto/index';
import { createMath } from 'src/common/utils/captcha';
import { ResultData } from 'src/common/utils/result';
import { GenerateUUID } from 'src/common/utils/index';
import { RedisService } from 'src/module/common/redis/redis.service';
import { CacheEnum } from 'src/common/enum/index';
import { ConfigService } from 'src/module/system/config/config.service';
import { ClientInfo, ClientInfoDto } from 'src/common/decorators/common.decorator';
import { NotRequireAuth, User, UserDto } from 'src/module/system/user/user.decorator';

@ApiTags('根目录')
@Controller('/')
export class MainController {
  constructor(
    private readonly mainService: MainService,
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
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
    return this.mainService.login(user, clientInfo);
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
  async logout(@User() user: UserDto, @ClientInfo() clientInfo: ClientInfoDto) {
    if (user?.token) {
      await this.redisService.del(`${CacheEnum.LOGIN_TOKEN_KEY}${user.token}`);
    }
    return this.mainService.logout(clientInfo);
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
  register(@Body() user: RegisterDto) {
    return this.mainService.register(user);
  }

  @ApiOperation({
    summary: '获取验证图片',
  })
  @Get('/captchaImage')
  async captchaImage(@Res() res) {
    //是否开启验证码 - 从配置文件读取
    const configService = new (await import('@nestjs/config')).ConfigService();
    const captchaEnabled = configService.get('perm.router.whitelist') !== undefined;

    console.log('=== 调试信息 ===');
    console.log('configService 实例:', configService);
    console.log('尝试读取 sys.account.captchaEnabled 配置...');

    // 使用注入的 ConfigService 读取配置
    const enable = this.configService.getConfigValue('sys.account.captchaEnabled').catch((err) => {
      console.log('数据库查询失败，使用默认配置');
      return 'true'; // 默认开启
    });

    const captchaEnabledValue = (await enable) === 'true';

    console.log('获取到的配置值:', captchaEnabledValue);
    console.log('================');

    const data = {
      captchaEnabled: captchaEnabledValue,
      img: '',
      uuid: '',
    };
    try {
      if (captchaEnabledValue) {
        const captchaInfo = createMath();
        data.img = captchaInfo.data;
        data.uuid = GenerateUUID();
        await this.redisService.set(CacheEnum.CAPTCHA_CODE_KEY + data.uuid, captchaInfo.text.toLowerCase(), 1000 * 60 * 5).catch((err) => {
          console.log('Redis 存储失败:', err.message);
        });
      }

      // 设置响应头禁用缓存
      res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.header('Pragma', 'no-cache');
      res.header('Expires', '0');

      return res.json(ResultData.ok(data, '操作成功'));
    } catch (err) {
      console.error('生成验证码错误:', err);
      return ResultData.fail(500, '生成验证码错误，请重试');
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

    return res.json({
      msg: '操作成功',
      code: 200,
      permissions: user.permissions,
      roles: user.roles,
      user: user.user,
    });
  }

  @ApiOperation({
    summary: '路由信息',
  })
  @Get('/getRouters')
  getRouters(@User() user: UserDto) {
    const userId = user.user.userId.toString();
    return this.mainService.getRouters(+userId);
  }
}
