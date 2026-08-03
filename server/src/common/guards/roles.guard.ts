import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    // 全局配置，
    const req = ctx.switchToHttp().getRequest();

    const role = this.reflector.getAllAndOverride('role', [ctx.getClass(), ctx.getHandler()]);

    //不需要鉴权
    if (role) {
      // req.user 可能为 undefined（如白名单路由未登录访问），需空值保护
      if (!req.user || !req.user.roles) {
        return false;
      }
      return this.hasRole(role, req.user.roles);
    }

    return true;
  }

  /**
   * 检测用户是否属于某个角色
   * @param role
   * @param roles
   * @returns
   */
  hasRole(role: string, roles: string[]) {
    return roles.some((v) => v === role);
  }
}
