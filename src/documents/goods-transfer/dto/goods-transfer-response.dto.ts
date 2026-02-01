import { DocumentStatus } from '@prisma/client';

export class GoodsTransferItemResponseDto {
  id: string;
  goodsTransferId: string;
  productId: string;
  quantity: number;
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

export class GoodsTransferResponseDto {
  id: string;
  organizationId: string;
  number: string;
  date: Date;
  status: DocumentStatus;
  warehouseFromId: string;
  warehouseToId: string;
  employeeId?: string | null;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
  cancelledAt?: Date | null;
  cancelledBy?: string | null;
  warehouseFrom?: {
    id: string;
    name: string;
  };
  warehouseTo?: {
    id: string;
    name: string;
  };
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  items: GoodsTransferItemResponseDto[];
}
