import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { pathToRegexp } from 'path-to-regexp';
import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

import { UserService } from 'src/module/system/user/user.service';

interface WhiteRoute {
  path: string;
  method?: string;
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private globalWhiteList: WhiteRoute[] = [];
  constructor(
    private readonly reflector: Reflector,
    private readonly userService: UserService,
    private readonly config: ConfigService,
  ) {
    super();
    this.globalWhiteList = [].concat(this.config.get('perm.router.whitelist') || []);
  }

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const notRequireAuth = this.reflector.getAllAndOverride('notRequireAuth', [ctx.getClass(), ctx.getHandler()]);

    if (notRequireAuth) {
      await this.jumpActivate(ctx);
      return true;
    }

    const isInWhiteList = this.checkWhiteList(ctx);
    if (isInWhiteList) {
      await this.jumpActivate(ctx);
      return true;
    }

    const req = ctx.switchToHttp().getRequest();
    const accessToken = req.get('Authorization');

    if (!accessToken) throw new UnauthorizedException('请重新登录');
    const atUserId = await this.userService.parseToken(accessToken);
    if (!atUserId) throw new UnauthorizedException('当前登录已过期，请重新登录');
    return await this.activate(ctx);
  }

  async activate(ctx: ExecutionContext) {
    return super.canActivate(ctx) as boolean;
  }

  /**
   * 跳过验证
   * @param ctx
   * @returns
   */
  async jumpActivate(ctx: ExecutionContext) {
    try {
      await this.activate(ctx);
    } catch (e) {
      // 未登录不做任何处理，直接返回 true
    }

    return true;
  }

  /**
   * 检查接口是否在白名单内
   * @param ctx
   * @returns
   */
  checkWhiteList(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    // 优先用 req.route.path（路由模板，不含全局前缀），
    // fallback 到去掉前缀的 req.path，避免 req.route 不存在时崩溃
    let requestPath: string;
    if (req.route?.path) {
      requestPath = req.route.path;
    } else {
      const prefix = this.config.get<string>('app.prefix') || '';
      requestPath = req.path || req.url || '';
      if (prefix && requestPath.startsWith(prefix)) {
        requestPath = requestPath.slice(prefix.length);
      }
    }

    return this.globalWhiteList.some((route) => {
      // 请求方法类型相同（未配置 method 则匹配所有方法）
      if (route.method && req.method.toUpperCase() !== route.method.toUpperCase()) {
        return false;
      }
      try {
        // 兼容配置中的 {id} 语法，转换为 path-to-regexp 的 :id 语法
        const pattern = route.path.replace(/\{(\w+)\}/g, ':$1');
        const regex = pathToRegexp(pattern);
        return regex.test(requestPath);
      } catch {
        // 路径模式解析失败，跳过该规则
        return false;
      }
    });
  }
}
