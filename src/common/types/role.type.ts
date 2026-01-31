import { Role } from '@prisma/client';

export type RoleType = typeof Role[keyof typeof Role];
export { Role };
