import { Module } from '@nestjs/common';
import { GoodsTransferService } from './goods-transfer.service';
import { GoodsTransferController } from './goods-transfer.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { OrganizationsModule } from '../../organizations/organizations.module';

@Module({
  imports: [PrismaModule, OrganizationsModule],
  controllers: [GoodsTransferController],
  providers: [GoodsTransferService],
  exports: [GoodsTransferService],
})
export class GoodsTransferModule {}
