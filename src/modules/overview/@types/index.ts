import { ClassCollectionItem, Transaction } from "@/@types/transaction";

export interface ClassCollectionData {
  className: string;
  percentage: string;
  collected: string;
  total: string;
}

export interface CollectionByClassProps {
  totalStudents: number;
  data: ClassCollectionItem[];
}

export interface FeeMetricsProps {
  feesThisTerm: string;
  feesCollected: string;
  totalOutstanding: string;
  percentageOutstanding: string;
}

export interface RecentTransactionsProps {
  // transactions: Transaction[];
  transactions: any;
  isLoading?: boolean;
}

export interface SmsBalanceProps {
  available: string | number;
  smsCount: string | number;
  lastSent: string | number;
  onTopUp?: () => void;
}
