import { Module } from '@nestjs/common';
import { CounterpartiesModule } from './counterparties/counterparties.module';
import { WarehousesModule } from './warehouses/warehouses.module';
import { ProductsModule } from './products/products.module';
import { CostItemsModule } from './cost-items/cost-items.module';
import { BankAccountsModule } from './bank-accounts/bank-accounts.module';
import { CashRegistersModule } from './cash-registers/cash-registers.module';
import { EmployeesModule } from './employees/employees.module';
import { ContractsModule } from './contracts/contracts.module';

@Module({
  imports: [
    CounterpartiesModule,
    WarehousesModule,
    ProductsModule,
    CostItemsModule,
    BankAccountsModule,
    CashRegistersModule,
    EmployeesModule,
    ContractsModule,
  ],
  exports: [
    CounterpartiesModule,
    WarehousesModule,
    ProductsModule,
    CostItemsModule,
    BankAccountsModule,
    CashRegistersModule,
    EmployeesModule,
    ContractsModule,
  ],
})
export class ReferencesModule {}
