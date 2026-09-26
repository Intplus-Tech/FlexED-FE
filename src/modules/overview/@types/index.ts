import { ClassItem } from "@/@types/class";
import { ClassCollectionItem, Transaction, TransactionsItems } from "@/@types/transaction";

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
  /** Formatted, e.g. "₦150,000". Rendered as a sub-line when its raw amount is > 0. */
  arrearsBroughtForward?: string;
}

export interface RecentTransactionsProps {
  transactions: TransactionsItems | null;
  isLoading?: boolean;
  classItems: ClassItem[];
}

export interface SmsBalanceProps {
  available: string | number;
  smsCount: string | number;
  lastSent: string | number;
  onTopUp?: () => void;
}
