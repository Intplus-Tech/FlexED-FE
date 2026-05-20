import { id } from "zod/locales";

export const auth = {
  login: "auth/login",
  changePassword: "auth/change-password",
  resetPassword: "auth/reset-password",
  verifyAccount: "auth/verify-account",
  resentOtp: "auth/resend-otp",
  forgotPassword: "auth/forgot-password",
};

export const school = {
  registerSchool: "/schools/register",
  getSchools: "/schools",
  getSchool: `/schools/me`,
  getSchoolMetrics: (schoolId: string) =>
    `/schools/${schoolId}/payments/summary`,

  getSchoolStaff: `/school-staff`,
  updateSchool: "/schools",
};

export const schoolStaff = {
  inviteStaff: "/schools/invite-staff",
  acceptInvite: "/school-staff/invite/accept",
  updateStaff: (staffId: string) => `/school-staff/${staffId}`,
  deleteStaff: (staffId: string) => `/school-staff/${staffId}`,
  getInviteDetails: "/school-staff/invite/details",
};

export const file = {
  uploadFile: "/files",
};

export const payment = {
  createPaymentCategory: "/payments/categories",
  getPaymentCategories: "/payments/categories",
  createPaymentItems: "/payments/items",
  getPaymentItems: "/payments/items",
  createPaymentReminder: "/payments/reminders",
  getPaymentReminders: "/payments/reminders",
  getStudentPayments: (paymentItemId: string) =>
    `/payments/items/${paymentItemId}/students`,
  getPaymentTransactions: "/payments/transactions",
  getPaymentMetrics: "/payments/collections-totals",
  makePayment: `/payments/initiate-student-payment`,
  collectManualPayment: "/payments/manual",
  getClassCollection: `/payments/class-collections`,
  bulkDeleteTransactions: "/payments/transactions/bulk/delete",

  getTransactionChartData: (schoolId: string) =>
    `/payments/school/${schoolId}/weekly-summary`,
  updatePaymentItem: (paymentItemId: string) => `/payments/items/${paymentItemId}`,
  deletePaymentItem: (paymentItemId: string) => `/payments/items/${paymentItemId}`,
  getPaymentItem: (paymentItemId: string) => `/payments/items/${paymentItemId}`,
  getBanks: "/payments/banks",
  validateAccount: "/payments/validate-account",
  createSettlementAccount: "/settlement-accounts",
  getStudentFeeProfile: (studentId: string) => `/payments/students/${studentId}/fee-profile`,
  allocateManualPayment: "/payments/manual-allocations",
};

export const academicSession = {
  getAllAcademicSessions: "/academic-periods",
  createAcademicSession: "/academic-periods",
  updateAcademicSession: (id: string) => `/academic-periods/${id}`,
  setAcademicSessionStatus: (id: string) =>
    `/academic-periods/${id}/set-active`,
};

export const student = {
  createStudent: "/students",
  downloadStudents: "/students/bulk/template",
  bulkStudentUpload: "/students/bulk/upload",
  getStudentsBySchool: `/students/school/`,
  getStudentByParent: (parentId: string) => `/students/parent/${parentId}`,
  getAllPendingPaymentForStudent: (studentId: string) =>
    `/students/${studentId}/payments/pending`,
  getAllStudent: `/students/school/`,
  getStudentById: (id: string) => `/students/${id}`,
  deleteStudent: (id: string) => `/students/${id}`,
  updateStudent: (id: string) => `/students/${id}`,
  getStudentByAdmissionNumber: (admissionNumber: string) =>
    `/students/admission/${admissionNumber}`,
  dowloadStudentCSVFormat: `/students/bulk/template`,
  uploadBulkStudent: (id: string) => `/students/bulk/upload/${id}`,
  bulkDelete: "/students/bulk/delete",
  bulkDiscount: "/students/bulk/discounts",
  assignClass: "/students/assign-class",
};

export const classes = {
  getAllClasses: "/classes",
  createClass: "/classes",
  getClassById: (id: string) => `/classes/${id}`,
  updateClass: (id: string) => `/classes/${id}`,
  deleteClass: (id: string) => `/classes/${id}`,
};

export const sms = {
  getSmsWallet: (schoolId: string) => `/sms-wallet/school/${schoolId}`,
  smsWalletTopUp: "/sms-wallet/topup",
  smsTopupInitiate: `/sms-wallet/topup/initiate`,
};

export const payout = {
  getPayouts: "/payouts",
  getPayoutById: (id: string) => `/payouts/${id}`,
  getWallet: "/wallet",
  createPayout: "/payouts",
};

export const settlementAccount = {
  getSchoolAccounts: (schoolId: string) => `/settlement-accounts/school/${schoolId}`,
};

export const ApiEndpoints = {
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL!,
  auth,
  school,
  schoolStaff,
  payment,
  student,
  sms,
  academicSession,
  classes,
  file,
  payout,
  settlementAccount,
};
