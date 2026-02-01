import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateCostItemDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
