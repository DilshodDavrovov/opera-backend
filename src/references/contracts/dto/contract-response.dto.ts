export class ContractResponseDto {
  id: string;
  organizationId: string;
  counterpartyId: string;
  number: string;
  date: Date;
  name: string | null;
  amount: number | null;
  startDate: Date | null;
  endDate: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  counterparty?: {
    id: string;
    name: string;
  };
}
