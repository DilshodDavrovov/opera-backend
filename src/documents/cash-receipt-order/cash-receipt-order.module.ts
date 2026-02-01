import { Module } from '@nestjs/common';
import { CashReceiptOrderService } from './cash-receipt-order.service';
import { CashReceiptOrderController } from './cash-receipt-order.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { OrganizationsModule } from '../../organizations/organizations.module';

@Module({
  imports: [PrismaModule, OrganizationsModule],
  controllers: [CashReceiptOrderController],
  providers: [CashReceiptOrderService],
  exports: [CashReceiptOrderService],
})
export class CashReceiptOrderModule {}
