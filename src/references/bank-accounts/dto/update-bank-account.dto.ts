import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateBankAccountDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  accountNumber?: string;

  @IsString()
  @IsOptional()
  bankName?: string;

  @IsString()
  @IsOptional()
  bik?: string;

  @IsString()
  @IsOptional()
  corrAccount?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
