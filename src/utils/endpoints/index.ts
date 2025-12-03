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
};

export const ApiEndpoints = {
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL!,
  auth,
  school,
};
