import { DocumentStatus } from '@prisma/client';

export class CashReceiptOrderResponseDto {
  id: string;
  organizationId: string;
  number: string;
  date: Date;
  status: DocumentStatus;
  cashRegisterId: string;
  counterpartyId?: string | null;
  employeeId?: string | null;
  costItemId?: string | null;
  amount: number;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
  cancelledAt?: Date | null;
  cancelledBy?: string | null;
  cashRegister?: {
    id: string;
    name: string;
  };
  counterparty?: {
    id: string;
    name: string;
  };
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  costItem?: {
    id: string;
    code: string;
    name: string;
  };
}
