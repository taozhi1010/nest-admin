import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    // 全局配置，
    const req = ctx.switchToHttp().getRequest();

    const prem = this.reflector.getAllAndOverride('permission', [ctx.getClass(), ctx.getHandler()]);

    //不需要鉴权
    if (prem) {
      return this.hasPermission(prem, req.user.permissions);
    }

    return true;
  }

  /**
   * 检查用户是否含有权限
   * @param permission
   * @param userId
   * @returns
   */
  hasPermission(permission: string, permissions: string[]) {
    const AllPermission = '*:*:*';
    return permissions.includes(AllPermission) || permissions.some((v) => v === permission);
  }
}
