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
  getSchoolMetrics: (schoolId: string) =>
    `/schools/${schoolId}/payments/summary`,
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
  getClassCollection: `/payments/class-collections`,
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
  getStudentsBySchool: (schoolId: string) => `/students/school/${schoolId}`,
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
};

export const classes = {
  getAllClasses: "/classes",
  createClass: "/classes",
  getClassById: (id: string) => `/classes/${id}`,
  updateClass: (id: string) => `/classes/${id}`,
};

export const sms = {
  getSmsWallet: (schoolId: string) => `/sms-wallet/school/${schoolId}`,
  smsWalletTopUp: "/sms-wallet/topup",
  smsTopupInitiate: `/sms-wallet/topup/initiate`,
};

export const ApiEndpoints = {
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL!,
  auth,
  school,
  payment,
  student,
  sms,
  academicSession,
  classes,
};
