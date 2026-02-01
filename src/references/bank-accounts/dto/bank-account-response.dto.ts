export class BankAccountResponseDto {
  id: string;
  organizationId: string;
  name: string;
  accountNumber: string;
  bankName: string | null;
  bik: string | null;
  corrAccount: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
