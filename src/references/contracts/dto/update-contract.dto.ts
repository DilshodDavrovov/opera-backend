import {
  IsString,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsNumber,
  Min,
} from 'class-validator';

export class UpdateContractDto {
  @IsString()
  @IsOptional()
  counterpartyId?: string;

  @IsString()
  @IsOptional()
  number?: string;

  @IsDateString()
  @IsOptional()
  date?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  amount?: number;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
