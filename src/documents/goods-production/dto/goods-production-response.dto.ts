import { DocumentStatus } from '@prisma/client';

export class GoodsProductionItemResponseDto {
  id: string;
  goodsProductionId: string;
  productId: string;
  quantity: number;
  price?: number | null;
  amount?: number | null;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
  product?: {
    id: string;
    code: string;
    name: string;
    unit?: string | null;
  };
}

export class GoodsProductionResponseDto {
  id: string;
  organizationId: string;
  number: string;
  date: Date;
  status: DocumentStatus;
  warehouseId: string;
  costItemId?: string | null;
  employeeId?: string | null;
  description?: string | null;
  totalAmount?: number | null;
  createdAt: Date;
  updatedAt: Date;
  cancelledAt?: Date | null;
  cancelledBy?: string | null;
  warehouse?: {
    id: string;
    name: string;
  };
  costItem?: {
    id: string;
    code: string;
    name: string;
  };
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  items: GoodsProductionItemResponseDto[];
}
