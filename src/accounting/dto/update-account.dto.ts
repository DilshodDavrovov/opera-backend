import { IsString, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { AccountType } from '../../common/types/account-type.type';

export class UpdateAccountDto {
  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(AccountType)
  @IsOptional()
  type?: AccountType;

  @IsString()
  @IsOptional()
  parentId?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
