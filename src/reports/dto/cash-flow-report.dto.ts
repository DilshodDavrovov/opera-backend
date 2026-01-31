export interface CashFlowItem {
  accountId: string;
  accountCode: string;
  accountName: string;
  inflow: number; // поступления (дебет)
  outflow: number; // выплаты (кредит)
  netFlow: number; // inflow - outflow
}

export interface CashFlowSection {
  category: string;
  items: CashFlowItem[];
  totalInflow: number;
  totalOutflow: number;
  netFlow: number;
}

export class CashFlowReportDto {
  organizationId: string;
  dateFrom: Date;
  dateTo: Date;
  generatedAt: Date;
  operating: CashFlowSection;
  investing: CashFlowSection;
  financing: CashFlowSection;
  totalInflow: number;
  totalOutflow: number;
  netCashFlow: number; // totalInflow - totalOutflow
  openingBalance: number; // баланс на начало периода
  closingBalance: number; // баланс на конец периода
}
