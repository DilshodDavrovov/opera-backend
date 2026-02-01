import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateBankAccountDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  accountNumber: string;

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
