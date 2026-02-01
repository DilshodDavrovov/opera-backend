import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateCashRegisterDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
