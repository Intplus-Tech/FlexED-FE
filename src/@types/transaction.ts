export interface Transaction {
  _id: string;
  reference: string;
  groupReference: string;
  student: Student;
  paymentItem: PaymentItems;
  school: string;
  amount: number;
  status: "PENDING" | "PAID" | "FAILED";
  type: "DEBIT" | "CREDIT";
  walletCredited: boolean;
  provider: "SQUAD";
  providerReference: string;
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
  reminderSchedules: any[];
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
  data: Transaction[];
  statusCode: number;
}

export interface MakePaymentRequest {
  studentId: string;
  paymentItemId: string;
  schoolId: string;
  callbackUrl: string;
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
  data: PaymentCategory[];
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
}

export interface Discount {
  type?: string;
  expiresAt?: string;
  value?: number;
}

export type DiscountType = "PERCENTAGE" | "FLAT";

export interface GetPaymentItemsResponse {
  success: boolean;
  message: string;
  data: PaymentItem[];
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
