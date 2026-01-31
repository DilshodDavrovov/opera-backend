import { Module } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { OrganizationsController } from './organizations.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { OrganizationAccessGuard } from './guards/organization-access.guard';
import { RoleGuard } from './guards/role.guard';

@Module({
  imports: [PrismaModule],
  controllers: [OrganizationsController],
  providers: [OrganizationsService, OrganizationAccessGuard, RoleGuard],
  exports: [OrganizationsService, OrganizationAccessGuard, RoleGuard],
})
export class OrganizationsModule {}
