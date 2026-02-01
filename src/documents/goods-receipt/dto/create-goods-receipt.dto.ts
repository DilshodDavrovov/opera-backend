import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsDateString,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class GoodsReceiptItemDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  @Min(0.01)
  @IsNotEmpty()
  quantity: number;

  @IsNumber()
  @Min(0.01)
  @IsNotEmpty()
  price: number;

  @IsString()
  @IsOptional()
  description?: string | null;
}

export class CreateGoodsReceiptDto {
  @IsString()
  @IsNotEmpty()
  number: string;

  @IsDateString()
  @IsOptional()
  date?: string;

  @IsString()
  @IsOptional()
  counterpartyId?: string | null;

  @IsString()
  @IsNotEmpty()
  warehouseId: string;

  @IsString()
  @IsOptional()
  contractId?: string | null;

  @IsString()
  @IsOptional()
  employeeId?: string | null;

  @IsString()
  @IsOptional()
  description?: string | null;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GoodsReceiptItemDto)
  items: GoodsReceiptItemDto[];
}
