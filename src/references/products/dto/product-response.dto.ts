export class ProductResponseDto {
  id: string;
  organizationId: string;
  code: string;
  name: string;
  unit?: string | null;
  description?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
