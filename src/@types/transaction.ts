export interface Transaction {
  _id: string;
  reference: string;
  groupReference: string;
  student: Student;
  parent?: string | null;
  paymentItem: PaymentItems;
  school: string;
  amount: number;
  status: "PENDING" | "PAID" | "FAILED";
  type: "DEBIT" | "CREDIT";
  walletCredited: boolean;
  provider: "SQUAD" | "PAYSTACK" | "FLUTTERWAVE" | "MANUAL" | "WALLET";
  providerReference: string;
  /** Paid above what this fee required. 0 for ordinary payments. */
  surplusAmount?: number;
  /** Whether surplusAmount has already reached the parent's wallet. */
  surplusCredited?: boolean;
  /**
   * Whether this transaction fully settled the fee item. Not present on
   * older records / not guaranteed by the API schema — treat undefined as
   * "unknown", not as false. A PAID transaction with closesPaymentItem
   * false (e.g. an underpaid transfer, or a partial wallet redemption)
   * does NOT mean the fee item is fully paid.
   */
  closesPaymentItem?: boolean;
  meta: SquadMeta;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Student {
  _id: string;
  id: string;
  firstName: string;
  lastName: string;
  admissionNumber: string;
  school: string;
  class: string;
  dateOfBirth: string;
  gender: "MALE" | "FEMALE";
  isDeleted: boolean;
  deletedAt: string | null;
  deletedBy: string | null;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface PaymentItems {
  _id: string;
  name: string;
  amount: number;
  category: string;
  school: string;
  academicPeriod: string;
  period: "PER_SESSION" | "PER_TERM";
  classes: string[];
  applicableTo: "ALL_STUDENTS" | "RETURNING_STUDENTS_ONLY";
  reminderSchedules: string[];
  description: string;
  dueDate: string;
  status: "PENDING" | "PAID";
  isSmsTopup: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface SquadMeta {
  status: number;
  success: boolean;
  message: string;
  data: SquadMetaData;
}

export interface SquadMetaData {
  is_blocked: boolean;
  account_name: string;
  account_number: string;
  expected_amount: string;
  expires_at: string;
  transaction_reference: string;
  bank: string;
  currency: "NGN";
}


export interface GetTransactionsResponse {
  success: boolean;
  message: string;
  data: TransactionsItems;
  statusCode: number;
}
export interface TransactionsItems {
    items: Transaction[],
    meta: Meta
}
export interface Meta {
    "page": number,
    "limit": number,
    "total": number,
    "totalPages": number,
    "hasNextPage": boolean,
    "hasPrevPage": boolean
}

/** Student shape returned inside a by-student group: `class` is populated to `{ _id, name }`. */
export type GroupedStudent = Omit<Student, "class"> & {
  class?: { _id: string; name: string } | string | null;
};

/**
 * One row from `GET /payments/transactions/by-student` — the student's fee
 * position for the academic period plus the transactions that matched the
 * current search/filters.
 *
 * The `total*` figures describe the student's whole fee position for the
 * period and are NOT narrowed by the `status`/`category` filters, so
 * filtering to PENDING does not zero out what the student has already paid.
 * `paymentsTotalAmount` is the sum of the returned `payments` array only.
 */
export interface StudentTransactionGroup {
  student: GroupedStudent;
  /** Total the student has paid across all applicable fees in the period. */
  totalAmountPaid: number;
  /** Alias of `totalAmountPaid`. */
  totalPaid: number;
  /** What the student still owes (never negative — overpayment is reported separately). */
  totalOutstanding: number;
  /** Alias of `totalOutstanding`. */
  outstanding: number;
  /** Total billed to the student for the period, after discounts and exemptions. */
  totalBilled: number;
  /** Alias of `totalBilled`. */
  totalOwed: number;
  /** Amount paid above what was billed, if any. */
  overpaid: number;
  status: "COMPLETED" | "PART_PAYMENT" | "OUTSTANDING";
  /** Number of entries in `payments`. */
  paymentCount: number;
  /** Sum of the `amount` of every entry in `payments`. */
  paymentsTotalAmount: number;
  /** Timestamp of the student's most recent matching transaction; the sort key. */
  lastTransactionAt: string;
  /** The student's matching transactions, newest first, each with `paymentItem` populated. */
  payments: Transaction[];
}

export interface TransactionsByStudentItems {
  items: StudentTransactionGroup[];
  /** `meta.total` is the number of matching students, not transactions. */
  meta: Meta;
  search?: string;
}

export interface GetTransactionsByStudentResponse {
  success: boolean;
  message: string;
  data: TransactionsByStudentItems;
  statusCode: number;
}
export interface MakePaymentRequest {
  studentId: string;
  paymentItemId: string;
  schoolId: string;
  callbackUrl: string;
}

export interface ManualPaymentItem {
  paymentItemId: string;
  receiptNumber: string;
  dateOfPayment: string;
  /** Cash actually collected. Defaults to the amount due; anything above it
   * is credited to the parent's wallet. Must not be below the amount due —
   * use manual-allocations for part payments. */
  amountPaid?: number;
}

export interface CollectManualPaymentRequest {
  studentId: string;
  paidAllTogether: boolean;
  groupRef: string;
  payments: ManualPaymentItem[];
}

export interface CollectManualPaymentResponse {
  success: boolean;
  message: string;
  statusCode: number;
  data: {
    groupRef: string | null;
    paidAllTogether: boolean;
    count: number;
    transactions: Transaction[];
    /** Total collected above the items' fees, credited to the parent's wallet. */
    surplusCredited: number;
  };
}

export interface StudentFeeProfilePaymentItem {
  paymentItemId: string;
  name: string;
  totalAmount: number;
  amountPaidPreviously: number;
  currentBalance: number;
  status: "COMPLETED" | "PART_PAYMENT" | "OUTSTANDING";
  discount: Discount | null;
  dueDate: string | null;
}

export interface StudentFeeProfile {
  studentId: string;
  name: string;
  admissionNumber: string;
  class: {
    id: string;
    name: string;
    level: string;
  };
  totalExpectedBalance: number;
  paymentItem: StudentFeeProfilePaymentItem[];
}

export interface StudentFeeProfileResponse {
  success: boolean;
  message: string;
  data: StudentFeeProfile;
  statusCode: number;
}

export interface ManualAllocationItem {
  paymentItemId: string;
  amountAllocated: number;
}

export interface ManualAllocationRequest {
  studentId: string;
  referenceNumber: string;
  dateOfPayment: string;
  totalAmountPaid: number;
  allocations: ManualAllocationItem[];
}

export interface ManualAllocationResponse {
  success: boolean;
  message: string;
  statusCode: number;
  data: {
    referenceNumber: string;
    studentId: string;
    totalAmountPaid: number;
    count: number;
    transactions: Transaction[];
    /** Amount allocated beyond what the items owed, credited to the parent's wallet. */
    surplusCredited: number;
  };
}

export interface GetPaymentMetricsResponse {
  success: boolean;
  message: string;
  data: CollectionsTotalsData;
  statusCode: number;
}

export interface CollectionsTotalsData {
  schoolId: string;
  period: string | null;
  totalPaidAll: number;
  totalPaidPeriod: number;
  totalExpectedAll: number;
  totalExpectedPeriod: number;
  outstandingAll: number;
  outstandingPeriod: number;
}

export interface GetPaymentsSummaryResponse {
  success: boolean;
  message: string;
  data: PaymentsSummaryData;
  statusCode: number;
}

export interface PaymentsSummaryData {
  schoolId: string;
  categories: PaymentCategoryItem[];
}

export interface PaymentCategoryItem {
  category: "FULLY_PAID" | "PARTIALLY_PAID" | "OVERDUE";
  label: string;
  totalAmount: number;
  studentCount: number;
  students: PaymentStudentItem[];
}

export interface PaymentStudentItem {
  time: string; // ISO date string
  transactionId: string;
  studentName: string;
  className: string;
  amountPaid: number;
}

export interface CreatePaymentCategory {
  name: string;
  description?: string;
}

export interface CreatePaymentCategoryResponse {
  success: boolean;
  message: string;
  data: {
    items: PaymentCategory[];
    meta: Meta;
  };
  statusCode: number;
}

export interface PaymentCategory {
  _id: string;
  name: string;
  description: string;
  isActive: boolean;
}

export interface CreatePaymentItemRequest {
  name: string;
  amount: number;
  category: string;
  school: string;
  academicPeriod: string;
  period: string;
  classes: string[];
  // applicableTo: ApplicableTo;
  applicableTo: string;
  reminderSchedules?: string[];
  description: string;
  dueDate: string;
  discount?: Discount;
  students?: string[];
  individuals?: string[];
}

export interface UpdatePaymentItemRequest {
  name: string;
  amount: number;
  period: string;
  description: string;
  classes: string[];
  applicableTo: string;
  dueDate: string;
  discount?: Discount | null;
  students?: string[];
  individuals?: string[];
}

export interface Discount {
  type?: string;
  expiresAt?: string;
  value?: number;
}

export interface IndividualStudent {
  _id: string;
  id: string;
  firstName: string;
  lastName: string;
  admissionNumber: string;
  school: string;
  class: string;
  gender: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export type DiscountType = "PERCENTAGE" | "FLAT";

export interface GetPaymentItemsResponse {
  success: boolean;
  message: string;
  data: {
    items: PaymentItem[];
    meta: Meta;
  };
  statusCode: number;
}

export interface PaymentItem {
  _id: string;
  name: string;
  amount: number;
  category: PaymentCategory;
  school: string;
  academicPeriod: string;
  period: PaymentPeriod;
  classes: SchoolClass[];
  applicableTo: ApplicableTo;
  reminderSchedules: string[];
  discount?: Discount;
  description: string;
  dueDate: string;
  status: PaymentStatus;
  isSmsTopup: boolean;
  students?: string[];
  individuals?: IndividualStudent[] | string[];
  createdAt: string;
  updatedAt: string;
}

export interface PaymentCategory {
  _id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SchoolClass {
  _id: string;
  name: string;
  level: string;
  classType: ClassType;
  createdAt: string;
  updatedAt: string;
}

export type PaymentPeriod = "PER_TERM" | "PER_SESSION";

export type ApplicableTo =
  | "NEW_STUDENTS_ONLY"
  | "RETURNING_STUDENTS_ONLY"
  | "ALL_STUDENTS"
  | "SPECIFIC_CLASSES_ONLY"
  | "INDIVIDUAL_SELECTION";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED";

export type ClassType = "NATIVE" | "INTERNATIONAL";

export interface GetClassCollectionsSummaryResponse {
  success: boolean;
  message: string;
  data: ClassCollectionsSummary;
  statusCode: number;
}

export interface ClassCollectionsSummary {
  schoolId: string;
  period: AcademicPeriodSummary;
  totalPaid: number;
  totalExpected: number;
  items: ClassCollectionItem[];
}

export interface AcademicPeriodSummary {
  id: string;
  name: string;
}

export interface ClassCollectionItem {
  classId: string;
  className: string;
  level: string;
  paidAmount: number;
  expectedAmount: number;
  percentPaid: number;
  totalStudents: number;
}

export interface GetTransactionChartDataResponse {
  success: boolean;
  data: ChartData[];
}

export interface ChartData {
  day: string;
  fullPayment: number;
  partPayment: number;
}

export interface Bank {
  code: string;
  name: string;
}

export interface GetBanksResponse {
  success: boolean;
  message: string;
  data: Bank[];
  statusCode: number;
}

export interface ValidateAccountRequest {
  bankCode: string;
  accountNumber: string;
}

export interface ValidateAccountResponse {
  success: boolean;
  message: string;
  data: {
    account_number: string;
    account_name: string;
  };
  statusCode: number;
}

export interface CreateSettlementAccountRequest {
  school: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  isPrimary: boolean;
}

export interface CreateSettlementAccountResponse {
  success: boolean;
  message: string;
  data: {
    _id: string;
    school: string;
    bankName: string;
    accountName: string;
    accountNumber: string;
    isPrimary: boolean;
    createdAt: string;
    updatedAt: string;
  };
  statusCode: number;
}
