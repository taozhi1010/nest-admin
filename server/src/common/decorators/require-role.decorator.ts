import { SetMetadata } from '@nestjs/common';

export const RequireRole = (role: string) => SetMetadata('role', role);
