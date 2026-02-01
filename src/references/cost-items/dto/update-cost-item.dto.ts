import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateCostItemDto {
  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
