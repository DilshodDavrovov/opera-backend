import { Module } from '@nestjs/common';
import { CostItemsService } from './cost-items.service';
import { CostItemsController } from './cost-items.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { OrganizationsModule } from '../../organizations/organizations.module';

@Module({
  imports: [PrismaModule, OrganizationsModule],
  controllers: [CostItemsController],
  providers: [CostItemsService],
  exports: [CostItemsService],
})
export class CostItemsModule {}
