import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateCounterpartyDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  inn?: string;

  @IsString()
  @IsOptional()
  kpp?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
