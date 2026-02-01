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

export class GoodsTransferItemDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  @Min(0.01)
  @IsNotEmpty()
  quantity: number;

  @IsString()
  @IsOptional()
  description?: string | null;
}

export class CreateGoodsTransferDto {
  @IsString()
  @IsNotEmpty()
  number: string;

  @IsDateString()
  @IsOptional()
  date?: string;

  @IsString()
  @IsNotEmpty()
  warehouseFromId: string;

  @IsString()
  @IsNotEmpty()
  warehouseToId: string;

  @IsString()
  @IsOptional()
  employeeId?: string | null;

  @IsString()
  @IsOptional()
  description?: string | null;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GoodsTransferItemDto)
  items: GoodsTransferItemDto[];
}
