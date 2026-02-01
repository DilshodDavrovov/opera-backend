import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { AccountingModule } from './accounting/accounting.module';
import { ReportsModule } from './reports/reports.module';
import { ReferencesModule } from './references/references.module';
import { GoodsReceiptModule } from './documents/goods-receipt/goods-receipt.module';
import { GoodsSaleModule } from './documents/goods-sale/goods-sale.module';
import { GoodsTransferModule } from './documents/goods-transfer/goods-transfer.module';
import { GoodsWriteOffModule } from './documents/goods-write-off/goods-write-off.module';
import { GoodsProductionModule } from './documents/goods-production/goods-production.module';
import { CashReceiptOrderModule } from './documents/cash-receipt-order/cash-receipt-order.module';
import { CashExpenseOrderModule } from './documents/cash-expense-order/cash-expense-order.module';
import { PaymentIncomingModule } from './documents/payment-incoming/payment-incoming.module';
import { PaymentOutgoingModule } from './documents/payment-outgoing/payment-outgoing.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    OrganizationsModule,
    AccountingModule,
    ReportsModule,
    ReferencesModule,
    GoodsReceiptModule,
    GoodsSaleModule,
    GoodsTransferModule,
    GoodsWriteOffModule,
    GoodsProductionModule,
    CashReceiptOrderModule,
    CashExpenseOrderModule,
    PaymentIncomingModule,
    PaymentOutgoingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
