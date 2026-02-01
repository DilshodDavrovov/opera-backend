import { Module } from '@nestjs/common';
import { CashExpenseOrderService } from './cash-expense-order.service';
import { CashExpenseOrderController } from './cash-expense-order.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { OrganizationsModule } from '../../organizations/organizations.module';

@Module({
  imports: [PrismaModule, OrganizationsModule],
  controllers: [CashExpenseOrderController],
  providers: [CashExpenseOrderService],
  exports: [CashExpenseOrderService],
})
export class CashExpenseOrderModule {}
