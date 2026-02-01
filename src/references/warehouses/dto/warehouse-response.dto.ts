export class WarehouseResponseDto {
  id: string;
  organizationId: string;
  name: string;
  address?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
