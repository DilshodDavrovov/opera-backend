export interface BalanceReportItem {
  accountId: string;
  accountCode: string;
  accountName: string;
  accountType: string;
  openingBalance: number; // начальный остаток на начало периода
  debit: number; // обороты по дебету за период
  credit: number; // обороты по кредиту за период
  closingBalance: number; // конечный остаток (начальный + обороты)
}

export interface BalanceReportSection {
  type: 'ASSET' | 'LIABILITY' | 'EQUITY';
  typeLabel: string;
  items: BalanceReportItem[];
  total: number;
}

export class BalanceReportDto {
  organizationId: string;
  dateFrom: Date | null;
  dateTo: Date | null;
  generatedAt: Date;
  assets: BalanceReportSection;
  liabilities: BalanceReportSection;
  equity: BalanceReportSection;
  totalAssets: number;
  totalLiabilitiesAndEquity: number;
}
