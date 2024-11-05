import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import * as Useragent from 'useragent';

export const ClientInfo = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const agent = Useragent.parse(request.headers['user-agent']);
  const os = agent.os.toJSON().family;
  const browser = agent.toAgent();

  const clientInfo = {
    userAgent: request.headers['user-agent'],
    ipaddr: request.ip,
    browser: browser,
    os: os,
    loginLocation: '',
  };

  return clientInfo;
});

export type ClientInfoDto = {
  userAgent: string;
  ipaddr: string;
  browser: string;
  os: string;
  loginLocation: string;
};
