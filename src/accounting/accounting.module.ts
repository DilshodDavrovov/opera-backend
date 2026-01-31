import { Module } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { TransactionsService } from './transactions.service';
import { AccountsController } from './accounts.controller';
import { TransactionsController } from './transactions.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { OrganizationsModule } from '../organizations/organizations.module';

@Module({
  imports: [PrismaModule, OrganizationsModule],
  controllers: [AccountsController, TransactionsController],
  providers: [AccountsService, TransactionsService],
  exports: [AccountsService, TransactionsService],
})
export class AccountingModule {}
