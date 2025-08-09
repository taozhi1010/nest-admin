import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { GetNowDate } from 'src/common/utils';
import { UAParser } from 'ua-parser-js';

export const ClientInfo = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
	const request = ctx.switchToHttp().getRequest();
	const { browser, os } = UAParser(request.headers['user-agent']);

	const clientInfo = {
		userAgent: request.headers['user-agent'],
		ipaddr: request.ip,
		browser: browser.name,
		os: os.name,
		loginLocation: '',

		dateTime: GetNowDate(),
		username: request.user?.user?.username,
	};

	return clientInfo;
});

export interface ClientInfoDto {
	userAgent: string;
	ipaddr: string;
	browser: string;
	os: string;
	loginLocation: string;
	dateTime: string;
	username?: string;
}
