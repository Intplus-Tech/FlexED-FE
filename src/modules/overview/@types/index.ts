export interface ClassCollectionData {
  className: string;
  percentage: string;
  collected: string;
  total: string;
}

export interface CollectionByClassProps {
  totalStudents: number;
  data: ClassCollectionData[];
}

export interface FeeMetricsProps {
  feesThisTerm: string;
  feesCollected: string;
  totalOutstanding: string;
  percentageOutstanding: string;
}

export interface Transaction {
  id: string;
  time: string;
  transactionId: string;
  studentName: string;
  class: string;
  amountPaid: string;
  percentRemaining: string;
  status: "Successful" | "Failed";
}

export interface RecentTransactionsProps {
  transactions: Transaction[];
  isLoading?: boolean;
}

export interface SmsBalanceProps {
  available: string;
  smsCount: string;
  lastSent: string;
  onTopUp?: () => void;
}
