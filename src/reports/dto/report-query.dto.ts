import { IsOptional, IsDateString, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class ReportQueryDto {
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  includeInactive?: boolean;
}
