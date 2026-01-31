export class TransactionResponseDto {
  id: string;
  organizationId: string;
  debitAccountId: string;
  creditAccountId: string;
  amount: number;
  description?: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}
