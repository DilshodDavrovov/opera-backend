import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { OrganizationsService } from '../organizations.service';
import { RoleType } from '../../common/types/role.type';

@Injectable()
export class OrganizationAccessGuard implements CanActivate {
  constructor(private organizationsService: OrganizationsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const organizationId = request.params.organizationId || request.body?.organizationId;

    if (!organizationId) {
      throw new ForbiddenException('Organization ID is required');
    }

    // Проверяем базовый доступ
    await this.organizationsService.checkAccess(user.id, organizationId);

    return true;
  }
}
