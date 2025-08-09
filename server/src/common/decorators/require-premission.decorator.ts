import { SetMetadata } from '@nestjs/common';

export const RequirePermission = (permission: string) => SetMetadata('permission', permission);
