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
import { GoodsWriteOffItemDto } from './create-goods-write-off.dto';

export class UpdateGoodsWriteOffDto {
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
  @Type(() => GoodsWriteOffItemDto)
  @IsOptional()
  items?: GoodsWriteOffItemDto[];
}
