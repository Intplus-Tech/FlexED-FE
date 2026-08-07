export type WalletLedgerType = "CREDIT" | "DEBIT";

export type WalletLedgerReason =
  | "OVERPAYMENT"
  | "PAYMENT_APPLIED"
  | "REFUND"
  | "ADJUSTMENT"
  | "OPENING_BALANCE";

export interface ParentWallet {
  _id: string;
  parent: string;
  school: string;
  balance: number;
  /** Off-platform credit (recorded via top-up) — spent before platform-held credit. */
  externalBalance?: number;
  /** balance - externalBalance */
  platformBalance?: number;
  createdAt: string;
  updatedAt: string;
}

export interface GetParentWalletResponse {
  success: boolean;
  message: string;
  statusCode: number;
  data: ParentWallet;
}

export interface ParentWalletLedgerEntry {
  _id: string;
  parent: string;
  school: string;
  type: WalletLedgerType;
  reason: WalletLedgerReason;
  amount: number;
  reference: string;
  transaction: string | null;
  student: { firstName?: string; lastName?: string } | null;
  balanceAfter: number;
  meta?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface ParentWalletLedgerPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface GetParentWalletLedgerResponse {
  success: boolean;
  message: string;
  statusCode: number;
  data: {
    data: ParentWalletLedgerEntry[];
    pagination: ParentWalletLedgerPagination;
  };
}

export type TopUpReason = "OPENING_BALANCE" | "ADJUSTMENT";

export interface TopUpParentWalletRequest {
  amount: number;
  reason?: TopUpReason;
  reference?: string;
  note?: string;
}

export interface ParentWalletTopUpResult {
  parentId: string;
  parentName?: string | null;
  amount: number;
  reason: TopUpReason;
  reference: string;
  duplicate: boolean;
  ledgerEntryId?: string;
  balance: number;
  externalBalance: number;
}

export interface TopUpParentWalletResponse {
  success: boolean;
  message: string;
  statusCode: number;
  data: ParentWalletTopUpResult;
}

export interface BulkTopUpEntry {
  parentId: string;
  amount: number;
  reason?: TopUpReason;
  reference?: string;
  note?: string;
}

export interface BulkTopUpRequest {
  schoolId?: string;
  reason?: TopUpReason;
  entries: BulkTopUpEntry[];
}

export interface BulkTopUpFailure {
  row: number;
  parentId: string;
  error: string;
}

export interface BulkTopUpResult {
  successful: (ParentWalletTopUpResult & { row: number })[];
  failed: BulkTopUpFailure[];
  totalCredited: number;
}

export interface BulkTopUpResponse {
  success: boolean;
  message: string;
  statusCode: number;
  data: BulkTopUpResult;
}
