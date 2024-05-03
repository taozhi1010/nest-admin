import { SetMetadata } from '@nestjs/common';

export const ALLOW_ANON = 'allowAnon';
/**
 * 允许 接口 不校验 token
 */
export const AllowAnon = () => SetMetadata(ALLOW_ANON, true);
