import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';
import { UserType } from 'src/module/system/user/dto/user';

export const User = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
	const request = ctx.switchToHttp().getRequest();
	return request.user;
});

export type UserDto = UserType;

export const NotRequireAuth = () => SetMetadata('notRequireAuth', true);

export const UserTool = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
	const request = ctx.switchToHttp().getRequest();

	const username = request.user?.user?.username;

	const injectCreate = (data: any) => {
		if (data.createBy) {
			return;
		}
		data.createBy = username;

		return injectUpdate(data);
	};

	const injectUpdate = (data: any) => {
		if (data.updateBy) {
			return;
		}
		data.updateBy = username;
	};

	return { injectCreate, injectUpdate };
});

export interface UserToolType {
	injectCreate: <T extends { [key: string]: any }>(data: T) => T & { createBy?: string };
	injectUpdate: <T extends { [key: string]: any }>(data: T) => T & { updateBy?: string };
}
