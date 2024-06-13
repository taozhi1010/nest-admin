import { CanActivate, Inject, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
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
