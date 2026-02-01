import { DocumentStatus } from '@prisma/client';

export class GoodsReceiptItemResponseDto {
  id: string;
  goodsReceiptId: string;
  productId: string;
  quantity: number;
  price: number;
  amount: number;
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

export class GoodsReceiptResponseDto {
  id: string;
  organizationId: string;
  number: string;
  date: Date;
  status: DocumentStatus;
  counterpartyId?: string | null;
  warehouseId: string;
  contractId?: string | null;
  employeeId?: string | null;
  description?: string | null;
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
  cancelledAt?: Date | null;
  cancelledBy?: string | null;
  counterparty?: {
    id: string;
    name: string;
  };
  warehouse?: {
    id: string;
    name: string;
  };
  contract?: {
    id: string;
    number: string;
  };
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  items: GoodsReceiptItemResponseDto[];
}
