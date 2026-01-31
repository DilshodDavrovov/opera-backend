import { AccountType } from '@prisma/client';

export type AccountTypeType = typeof AccountType[keyof typeof AccountType];
export { AccountType };
