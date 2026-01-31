import {
  IsString,
  IsNumber,
  IsDateString,
  IsOptional,
  Min,
} from 'class-validator';

export class UpdateTransactionDto {
  @IsString()
  @IsOptional()
  debitAccountId?: string;

  @IsString()
  @IsOptional()
  creditAccountId?: string;

  @IsNumber()
  @Min(0.01)
  @IsOptional()
  amount?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  date?: string;
}
