import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrganizationsService } from '../organizations/organizations.service';
import { BalanceReportDto, BalanceReportSection, BalanceReportItem } from './dto/balance-report.dto';
import { ProfitLossReportDto, ProfitLossReportSection, ProfitLossReportItem } from './dto/profit-loss-report.dto';
import { CashFlowReportDto, CashFlowSection, CashFlowItem } from './dto/cash-flow-report.dto';
import { AccountType } from '../common/types/account-type.type';

@Injectable()
export class ReportsService {
  constructor(
    private prisma: PrismaService,
    private organizationsService: OrganizationsService,
  ) {}

  async getBalanceReport(
    userId: string,
    organizationId: string,
    dateFrom: Date | null,
    dateTo: Date | null,
    includeInactive = false,
  ): Promise<BalanceReportDto> {
    // Проверяем доступ к организации
    await this.organizationsService.checkAccess(userId, organizationId);

    // Получаем все активные счета организации
    const accounts = await this.prisma.account.findMany({
      where: {
        organizationId,
        ...(includeInactive ? {} : { isActive: true }),
        type: {
          in: ['ASSET', 'LIABILITY', 'EQUITY'],
        },
      },
      orderBy: [{ code: 'asc' }],
    });

    // Вычисляем начальные остатки и обороты по счетам
    const accountBalances = new Map<string, { 
      openingDebit: number; 
      openingCredit: number; 
      periodDebit: number; 
      periodCredit: number;
    }>();

    // Инициализируем все счета нулями
    accounts.forEach((account) => {
      accountBalances.set(account.id, { 
        openingDebit: 0, 
        openingCredit: 0, 
        periodDebit: 0, 
        periodCredit: 0 
      });
    });

    // Для баланса нужно учитывать начальные остатки (все проводки до начала периода)
    // и обороты за период
    // Если dateFrom указан, получаем начальные остатки (все проводки до dateFrom)
    if (dateFrom) {
      // Получаем все проводки до начала периода для расчета начальных остатков
      const openingTransactions = await this.prisma.transaction.findMany({
        where: {
          organizationId,
          date: {
            lt: dateFrom,
          },
        },
      });

      // Считаем начальные остатки
      openingTransactions.forEach((transaction) => {
        const debitBalance = accountBalances.get(transaction.debitAccountId);
        const creditBalance = accountBalances.get(transaction.creditAccountId);
        const amount = transaction.amount.toNumber();

        if (debitBalance) {
          debitBalance.openingDebit += amount;
        }
        if (creditBalance) {
          creditBalance.openingCredit += amount;
        }
      });
    }

    // Получаем проводки за период
    // Если период не указан (dateFrom и dateTo оба null), получаем все проводки
    // Если указан dateFrom, получаем проводки с dateFrom
    // Если указан dateTo, получаем проводки до dateTo
    const periodTransactions = await this.prisma.transaction.findMany({
      where: {
        organizationId,
        date: {
          ...(dateFrom ? { gte: dateFrom } : {}),
          ...(dateTo ? { lte: dateTo } : {}),
        },
      },
    });

    // Считаем обороты за период
    periodTransactions.forEach((transaction) => {
      const debitBalance = accountBalances.get(transaction.debitAccountId);
      const creditBalance = accountBalances.get(transaction.creditAccountId);
      const amount = transaction.amount.toNumber();

      if (debitBalance) {
        debitBalance.periodDebit += amount;
      }
      if (creditBalance) {
        creditBalance.periodCredit += amount;
      }
    });

    // Группируем по типам счетов
    const assets: BalanceReportItem[] = [];
    const liabilities: BalanceReportItem[] = [];
    const equity: BalanceReportItem[] = [];

    accounts.forEach((account) => {
      const balances = accountBalances.get(account.id) || { 
        openingDebit: 0, 
        openingCredit: 0, 
        periodDebit: 0, 
        periodCredit: 0 
      };
      
      // Для активов: начальный остаток = дебет - кредит (до начала периода)
      // Для пассивов и капитала: начальный остаток = кредит - дебет (до начала периода)
      const openingBalance =
        account.type === 'ASSET'
          ? balances.openingDebit - balances.openingCredit
          : balances.openingCredit - balances.openingDebit;

      // Обороты за период
      const periodDebit = balances.periodDebit;
      const periodCredit = balances.periodCredit;

      // Конечный остаток = начальный остаток + обороты за период
      // Для активов: конечный остаток = начальный + дебет - кредит
      // Для пассивов: конечный остаток = начальный + кредит - дебет
      const closingBalance =
        account.type === 'ASSET'
          ? openingBalance + periodDebit - periodCredit
          : openingBalance + periodCredit - periodDebit;

      const item: BalanceReportItem = {
        accountId: account.id,
        accountCode: account.code,
        accountName: account.name,
        accountType: account.type,
        openingBalance,
        debit: periodDebit,
        credit: periodCredit,
        closingBalance,
      };

      if (account.type === 'ASSET') {
        assets.push(item);
      } else if (account.type === 'LIABILITY') {
        liabilities.push(item);
      } else if (account.type === 'EQUITY') {
        equity.push(item);
      }
    });

    // Вычисляем итоги (по конечным остаткам)
    const assetsTotal = assets.reduce((sum, item) => sum + item.closingBalance, 0);
    const liabilitiesTotal = liabilities.reduce((sum, item) => sum + item.closingBalance, 0);
    const equityTotal = equity.reduce((sum, item) => sum + item.closingBalance, 0);

    return {
      organizationId,
      dateFrom,
      dateTo,
      generatedAt: new Date(),
      assets: {
        type: 'ASSET',
        typeLabel: 'Активы',
        items: assets,
        total: assetsTotal,
      },
      liabilities: {
        type: 'LIABILITY',
        typeLabel: 'Пассивы',
        items: liabilities,
        total: liabilitiesTotal,
      },
      equity: {
        type: 'EQUITY',
        typeLabel: 'Капитал',
        items: equity,
        total: equityTotal,
      },
      totalAssets: assetsTotal,
      totalLiabilitiesAndEquity: liabilitiesTotal + equityTotal,
    };
  }

  async getProfitLossReport(
    userId: string,
    organizationId: string,
    dateFrom: Date,
    dateTo: Date,
    includeInactive = false,
  ): Promise<ProfitLossReportDto> {
    // Проверяем доступ к организации
    await this.organizationsService.checkAccess(userId, organizationId);

    // Получаем счета доходов и расходов
    const accounts = await this.prisma.account.findMany({
      where: {
        organizationId,
        ...(includeInactive ? {} : { isActive: true }),
        type: {
          in: ['REVENUE', 'EXPENSE'],
        },
      },
      orderBy: [{ code: 'asc' }],
    });

    // Получаем проводки за период
    const transactions = await this.prisma.transaction.findMany({
      where: {
        organizationId,
        date: {
          gte: dateFrom,
          lte: dateTo,
        },
      },
      include: {
        debitAccount: true,
        creditAccount: true,
      },
    });

    // Вычисляем обороты по счетам
    const accountBalances = new Map<string, { debit: number; credit: number }>();

    accounts.forEach((account) => {
      accountBalances.set(account.id, { debit: 0, credit: 0 });
    });

    transactions.forEach((transaction) => {
      const debitBalance = accountBalances.get(transaction.debitAccountId);
      const creditBalance = accountBalances.get(transaction.creditAccountId);
      const amount = transaction.amount.toNumber();

      if (debitBalance) {
        debitBalance.debit += amount;
      }
      if (creditBalance) {
        creditBalance.credit += amount;
      }
    });

    // Группируем по типам
    const revenue: ProfitLossReportItem[] = [];
    const expenses: ProfitLossReportItem[] = [];

    accounts.forEach((account) => {
      const balances = accountBalances.get(account.id) || { debit: 0, credit: 0 };
      
      // Для доходов: баланс = кредит - дебет (доходы увеличивают капитал)
      // Для расходов: баланс = дебет - кредит (расходы уменьшают капитал)
      const balance =
        account.type === 'REVENUE'
          ? balances.credit - balances.debit
          : balances.debit - balances.credit;

      const item: ProfitLossReportItem = {
        accountId: account.id,
        accountCode: account.code,
        accountName: account.name,
        accountType: account.type,
        debit: balances.debit,
        credit: balances.credit,
        balance,
      };

      if (account.type === 'REVENUE') {
        revenue.push(item);
      } else if (account.type === 'EXPENSE') {
        expenses.push(item);
      }
    });

    // Вычисляем итоги
    const revenueTotal = revenue.reduce((sum, item) => sum + item.balance, 0);
    const expensesTotal = expenses.reduce((sum, item) => sum + item.balance, 0);
    const netProfit = revenueTotal - expensesTotal;

    return {
      organizationId,
      dateFrom,
      dateTo,
      generatedAt: new Date(),
      revenue: {
        type: 'REVENUE',
        typeLabel: 'Доходы',
        items: revenue,
        total: revenueTotal,
      },
      expenses: {
        type: 'EXPENSE',
        typeLabel: 'Расходы',
        items: expenses,
        total: expensesTotal,
      },
      grossProfit: netProfit,
      netProfit,
    };
  }

  async getCashFlowReport(
    userId: string,
    organizationId: string,
    dateFrom: Date,
    dateTo: Date,
    includeInactive = false,
  ): Promise<CashFlowReportDto> {
    // Проверяем доступ к организации
    await this.organizationsService.checkAccess(userId, organizationId);

    // Получаем все счета организации
    const accounts = await this.prisma.account.findMany({
      where: {
        organizationId,
        ...(includeInactive ? {} : { isActive: true }),
      },
      orderBy: [{ code: 'asc' }],
    });

    // Получаем проводки за период
    const transactions = await this.prisma.transaction.findMany({
      where: {
        organizationId,
        date: {
          gte: dateFrom,
          lte: dateTo,
        },
      },
      include: {
        debitAccount: true,
        creditAccount: true,
      },
    });

    // Вычисляем движение денежных средств
    // Для упрощения: считаем все проводки как операционные
    // В реальной системе нужна более сложная логика классификации
    const accountFlows = new Map<string, { inflow: number; outflow: number }>();

    accounts.forEach((account) => {
      accountFlows.set(account.id, { inflow: 0, outflow: 0 });
    });

    transactions.forEach((transaction) => {
      const debitFlow = accountFlows.get(transaction.debitAccountId);
      const creditFlow = accountFlows.get(transaction.creditAccountId);
      const amount = transaction.amount.toNumber();

      if (debitFlow) {
        debitFlow.inflow += amount;
      }
      if (creditFlow) {
        creditFlow.outflow += amount;
      }
    });

    // Группируем по категориям (упрощенная версия)
    const operatingItems: CashFlowItem[] = [];
    const investingItems: CashFlowItem[] = [];
    const financingItems: CashFlowItem[] = [];

    accounts.forEach((account) => {
      const flows = accountFlows.get(account.id) || { inflow: 0, outflow: 0 };
      const netFlow = flows.inflow - flows.outflow;

      const item: CashFlowItem = {
        accountId: account.id,
        accountCode: account.code,
        accountName: account.name,
        inflow: flows.inflow,
        outflow: flows.outflow,
        netFlow,
      };

      // Упрощенная классификация: все счета идут в операционные
      // В реальной системе нужна более сложная логика
      operatingItems.push(item);
    });

    // Вычисляем итоги
    const operatingTotalInflow = operatingItems.reduce((sum, item) => sum + item.inflow, 0);
    const operatingTotalOutflow = operatingItems.reduce((sum, item) => sum + item.outflow, 0);
    const operatingNetFlow = operatingTotalInflow - operatingTotalOutflow;

    const investingTotalInflow = investingItems.reduce((sum, item) => sum + item.inflow, 0);
    const investingTotalOutflow = investingItems.reduce((sum, item) => sum + item.outflow, 0);
    const investingNetFlow = investingTotalInflow - investingTotalOutflow;

    const financingTotalInflow = financingItems.reduce((sum, item) => sum + item.inflow, 0);
    const financingTotalOutflow = financingItems.reduce((sum, item) => sum + item.outflow, 0);
    const financingNetFlow = financingTotalInflow - financingTotalOutflow;

    const totalInflow = operatingTotalInflow + investingTotalInflow + financingTotalInflow;
    const totalOutflow = operatingTotalOutflow + investingTotalOutflow + financingTotalOutflow;
    const netCashFlow = totalInflow - totalOutflow;

    // Вычисляем балансы на начало и конец периода
    // Для упрощения: баланс на начало = 0, так как мы считаем только движение за период
    // В реальной системе нужно учитывать остатки на денежных счетах на начало периода
    const openingBalance = 0;
    const closingBalance = openingBalance + netCashFlow;

    return {
      organizationId,
      dateFrom,
      dateTo,
      generatedAt: new Date(),
      operating: {
        category: 'Операционная деятельность',
        items: operatingItems,
        totalInflow: operatingTotalInflow,
        totalOutflow: operatingTotalOutflow,
        netFlow: operatingNetFlow,
      },
      investing: {
        category: 'Инвестиционная деятельность',
        items: investingItems,
        totalInflow: investingTotalInflow,
        totalOutflow: investingTotalOutflow,
        netFlow: investingNetFlow,
      },
      financing: {
        category: 'Финансовая деятельность',
        items: financingItems,
        totalInflow: financingTotalInflow,
        totalOutflow: financingTotalOutflow,
        netFlow: financingNetFlow,
      },
      totalInflow,
      totalOutflow,
      netCashFlow,
      openingBalance,
      closingBalance,
    };
  }
}
