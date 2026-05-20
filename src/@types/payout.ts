export interface Payout {
  _id: string;
  school: string;
  settlementAccount: string;
  amount: number;
  feeAmount: number;
  status: "SUCCESS" | "FAILED" | "PENDING";
  providerReference: string;
  providerNipReference: string;
  raw: {
    status: number;
    success: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PayoutPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface GetPayoutsResponse {
  success: boolean;
  message: string;
  statusCode: number;
  data: {
    data: Payout[];
    pagination: PayoutPagination;
  };
}

export interface GetPayoutByIdResponse {
  success: boolean;
  message: string;
  statusCode: number;
  data: Payout;
}

export interface InitiatedBy {
  _id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: string;
  email: string;
}

export interface LastSettlement {
  _id: string;
  amount: number;
  feeAmount: number;
  status: "SUCCESS" | "FAILED" | "PENDING";
  providerReference: string;
  createdAt: string;
  initiatedBy: InitiatedBy;
}

export interface SchoolWallet {
  _id: string;
  school: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
  lastSettlement: LastSettlement | null;
}

export interface GetSchoolWalletResponse {
  success: boolean;
  message: string;
  statusCode: number;
  data: SchoolWallet;
}

export interface SettlementAccount {
  _id: string;
  school: string;
  bankName: string;
  bankCode: string;
  accountName: string;
  accountNumber: string;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GetSettlementAccountsResponse {
  success: boolean;
  message: string;
  statusCode: number;
  data: SettlementAccount[];
  meta?: any;
}

export interface CreatePayoutRequest {
  amount: number;
  settlementAccountId: string;
}
