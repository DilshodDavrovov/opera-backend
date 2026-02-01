import { Module } from '@nestjs/common';
import { GoodsProductionService } from './goods-production.service';
import { GoodsProductionController } from './goods-production.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { OrganizationsModule } from '../../organizations/organizations.module';

@Module({
  imports: [PrismaModule, OrganizationsModule],
  controllers: [GoodsProductionController],
  providers: [GoodsProductionService],
  exports: [GoodsProductionService],
})
export class GoodsProductionModule {}
