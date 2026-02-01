import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateCashRegisterDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
