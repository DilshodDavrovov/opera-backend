import {
  IsString,
  IsOptional,
  IsDateString,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { GoodsReceiptItemDto } from './create-goods-receipt.dto';

export class UpdateGoodsReceiptDto {
  @IsString()
  @IsOptional()
  number?: string;

  @IsDateString()
  @IsOptional()
  date?: string;

  @IsString()
  @IsOptional()
  counterpartyId?: string | null;

  @IsString()
  @IsOptional()
  warehouseId?: string | null;

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
  @IsOptional()
  items?: GoodsReceiptItemDto[];
}
