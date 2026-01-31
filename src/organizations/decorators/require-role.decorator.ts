import { SetMetadata } from '@nestjs/common';
import { RoleType } from '../../common/types/role.type';

export const REQUIRE_ROLES_KEY = 'requireRoles';
export const RequireRoles = (...roles: RoleType[]) =>
  SetMetadata(REQUIRE_ROLES_KEY, roles);
