import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';
import { UserType } from 'src/module/system/user/dto/user';

export const User = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.user;
});

export type UserDto = UserType;

export const NotRequireAuth = () => SetMetadata('notRequireAuth', true);
