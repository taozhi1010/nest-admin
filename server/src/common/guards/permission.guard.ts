import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();
    const prem = this.reflector.getAllAndOverride('permission', [context.getClass(), context.getHandler()]);
    //不需要鉴权
    if (prem === undefined) return true;
    //调用鉴权
    return this.hasPermission(prem, req.user.permissions);
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
