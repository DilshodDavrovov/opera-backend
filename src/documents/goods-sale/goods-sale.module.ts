import { Module } from '@nestjs/common';
import { GoodsSaleService } from './goods-sale.service';
import { GoodsSaleController } from './goods-sale.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { OrganizationsModule } from '../../organizations/organizations.module';

@Module({
  imports: [PrismaModule, OrganizationsModule],
  controllers: [GoodsSaleController],
  providers: [GoodsSaleService],
  exports: [GoodsSaleService],
})
export class GoodsSaleModule {}
