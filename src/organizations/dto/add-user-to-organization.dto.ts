import { IsEmail, IsNotEmpty, IsIn } from 'class-validator';
import { Role } from '../../common/types/role.type';
import type { RoleType } from '../../common/types/role.type';

export class AddUserToOrganizationDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsIn([Role.OWNER, Role.ACCOUNTANT, Role.VIEWER])
  @IsNotEmpty()
  role: RoleType;
}
