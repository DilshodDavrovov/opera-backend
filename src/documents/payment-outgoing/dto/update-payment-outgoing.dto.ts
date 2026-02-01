import {
  IsString,
  IsOptional,
  IsDateString,
  IsNumber,
  Min,
} from 'class-validator';

export class UpdatePaymentOutgoingDto {
  @IsString()
  @IsOptional()
  number?: string;

  @IsDateString()
  @IsOptional()
  date?: string;

  @IsString()
  @IsOptional()
  bankAccountId?: string | null;

  @IsString()
  @IsOptional()
  counterpartyId?: string | null;

  @IsString()
  @IsOptional()
  contractId?: string | null;

  @IsNumber()
  @Min(0.01)
  @IsOptional()
  amount?: number;

  @IsString()
  @IsOptional()
  description?: string | null;
}
