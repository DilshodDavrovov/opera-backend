export class CounterpartyResponseDto {
  id: string;
  organizationId: string;
  name: string;
  inn?: string | null;
  kpp?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
