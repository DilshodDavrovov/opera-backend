export interface ProfitLossReportItem {
  accountId: string;
  accountCode: string;
  accountName: string;
  accountType: string;
  debit: number;
  credit: number;
  balance: number; // для доходов: кредит - дебет, для расходов: дебет - кредит
}

export interface ProfitLossReportSection {
  type: 'REVENUE' | 'EXPENSE';
  typeLabel: string;
  items: ProfitLossReportItem[];
  total: number;
}

export class ProfitLossReportDto {
  organizationId: string;
  dateFrom: Date;
  dateTo: Date;
  generatedAt: Date;
  revenue: ProfitLossReportSection;
  expenses: ProfitLossReportSection;
  grossProfit: number; // revenue.total - expenses.total
  netProfit: number; // то же что grossProfit для упрощения
}
