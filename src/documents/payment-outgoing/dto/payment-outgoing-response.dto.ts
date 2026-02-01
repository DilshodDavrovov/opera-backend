import { DocumentStatus } from '@prisma/client';

export class PaymentOutgoingResponseDto {
  id: string;
  organizationId: string;
  number: string;
  date: Date;
  status: DocumentStatus;
  bankAccountId: string;
  counterpartyId: string;
  contractId?: string | null;
  amount: number;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
  cancelledAt?: Date | null;
  cancelledBy?: string | null;
  bankAccount?: {
    id: string;
    name: string;
    accountNumber: string;
  };
  counterparty?: {
    id: string;
    name: string;
  };
  contract?: {
    id: string;
    number: string;
  };
}
