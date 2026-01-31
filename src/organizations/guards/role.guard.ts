import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { OrganizationsService } from '../organizations.service';
import { REQUIRE_ROLES_KEY } from '../decorators/require-role.decorator';
import { RoleType } from '../../common/types/role.type';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private organizationsService: OrganizationsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<RoleType[]>(
      REQUIRE_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const organizationId =
      request.params.organizationId || request.body?.organizationId;

    if (!organizationId) {
      throw new ForbiddenException('Organization ID is required');
    }

    await this.organizationsService.checkAccess(
      user.id,
      organizationId,
      requiredRoles,
    );

    return true;
  }
}
