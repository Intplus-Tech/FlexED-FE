/**
 * Wallet / payout types.
 *
 * Every monetary field in this file is in **kobo**, as documented by the API
 * spec (`SchoolWallet.balance`, `Payout.amount`, `Payout.feeAmount`,
 * `WalletLedgerEntry.amount`). This differs from the transaction and fee
 * endpoints, whose amounts are plain Naira — use `koboToNaira` / `nairaToKobo`
 * at the UI boundary rather than mixing the two units.
 */

export type PayoutStatus =
  | "PENDING"
  | "PROCESSING"
  | "SUCCESS"
  | "FAILED"
  | "REVERSED";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** Staff member who requested the payout. Null when the user can't be resolved. */
export interface PayoutInitiator {
  _id: string;
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  role: string;
  email: string;
}

export interface SettlementAccount {
  _id: string;
  school: string;
  bankName: string;
  /** NIP bank code. Required by the provider before a payout can be sent. */
  bankCode?: string | null;
  accountName: string;
  accountNumber: string;
  isPrimary: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Payout {
  _id: string;
  school: string;
  /** An id, or the populated account depending on the endpoint. */
  settlementAccount: string | SettlementAccount;
  initiatedBy: PayoutInitiator | null;
  /** Kobo. */
  amount: number;
  /** Kobo. */
  feeAmount: number;
  status: PayoutStatus;
  providerReference: string;
  providerNipReference?: string | null;
  raw?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface GetPayoutsResponse {
  success: boolean;
  message: string;
  statusCode: number;
  data: {
    data: Payout[];
    pagination: PaginationMeta;
  };
}

export interface GetPayoutByIdResponse {
  success: boolean;
  message: string;
  statusCode: number;
  data: Payout;
}

export interface LastSettlement {
  _id: string;
  /** Kobo. */
  amount: number;
  /** Kobo. */
  feeAmount: number;
  status: PayoutStatus;
  providerReference: string;
  createdAt: string;
  initiatedBy: PayoutInitiator | null;
}

export interface SchoolWallet {
  _id: string;
  school: string;
  /** Kobo. */
  balance: number;
  createdAt?: string;
  updatedAt?: string;
  lastSettlement: LastSettlement | null;
}

export interface GetSchoolWalletResponse {
  success: boolean;
  message: string;
  statusCode: number;
  data: SchoolWallet;
}

export type WalletLedgerType = "CREDIT" | "DEBIT";

export interface WalletLedgerEntry {
  _id: string;
  school: string;
  type: WalletLedgerType;
  /** Kobo. */
  amount: number;
  reference: string;
  payout?: string | null;
  transaction?: string | null;
  /** Kobo. */
  balanceAfter: number;
  meta?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface GetWalletLedgerResponse {
  success: boolean;
  message: string;
  statusCode: number;
  data: {
    data: WalletLedgerEntry[];
    pagination: PaginationMeta;
  };
}

export interface GetSettlementAccountsResponse {
  success: boolean;
  message: string;
  statusCode: number;
  data: SettlementAccount[];
}

export interface CreatePayoutRequest {
  /** Kobo. The payout fee is charged by the backend on top of this. */
  amount: number;
  /** Omit to settle to the school's primary account. */
  settlementAccountId?: string;
}
