import { AccountType } from '../../common/types/account-type.type';

export class AccountResponseDto {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  organizationId: string;
  parentId?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
