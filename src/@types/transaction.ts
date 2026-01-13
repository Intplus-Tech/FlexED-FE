export interface Transaction {
  _id: string;
  reference: string;
  student: {
    name: string;
  };
  paymentItem: Record<string, unknown>;
  school: string;
  amount: number;
  status: string;
  type: string;
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
  reminderSchedules: unknown[];
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
