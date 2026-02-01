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
import { GoodsProductionItemDto } from './create-goods-production.dto';

export class UpdateGoodsProductionDto {
  @IsString()
  @IsOptional()
  number?: string;

  @IsDateString()
  @IsOptional()
  date?: string;

  @IsString()
  @IsOptional()
  warehouseId?: string | null;

  @IsString()
  @IsOptional()
  costItemId?: string | null;

  @IsString()
  @IsOptional()
  employeeId?: string | null;

  @IsString()
  @IsOptional()
  description?: string | null;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GoodsProductionItemDto)
  @IsOptional()
  items?: GoodsProductionItemDto[];
}
