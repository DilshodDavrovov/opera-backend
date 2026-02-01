import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsDateString,
  IsNumber,
  Min,
} from 'class-validator';

export class CreatePaymentIncomingDto {
  @IsString()
  @IsNotEmpty()
  number: string;

  @IsDateString()
  @IsOptional()
  date?: string;

  @IsString()
  @IsNotEmpty()
  bankAccountId: string;

  @IsString()
  @IsNotEmpty()
  counterpartyId: string;

  @IsString()
  @IsOptional()
  contractId?: string | null;

  @IsNumber()
  @Min(0.01)
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsOptional()
  description?: string | null;
}
