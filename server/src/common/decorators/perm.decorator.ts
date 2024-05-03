import { SetMetadata } from '@nestjs/common';

/**
 * 接口 允许 无权限访问
 */
export const ALLOW_NO_PERM = 'allowNoPerm';

export const AllowNoPerm = () => SetMetadata(ALLOW_NO_PERM, true);
