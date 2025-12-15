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
  isLoading?: boolean;
}

export interface FeeMetricsProps {
  feesThisTerm: string;
  feesCollected: string;
  totalOutstanding: string;
  percentageOutstanding: string;
}

export interface RecentTransactionsProps {
  // transactions: Transaction[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transactions: any;
  isLoading?: boolean;
}

export interface SmsBalanceProps {
  available: string | number;
  smsCount: string | number;
  lastSent: string | number;
  onTopUp?: () => void;
}
