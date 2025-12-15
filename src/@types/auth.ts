export interface SignInResponse {
  data: {
    token: string;
    user: {
      id: string;
      email: string;
      role: string;
      isVerified: boolean;
      schoolId: string;
    };
  };
}

export interface CreateSchoolRequest {
  name: string;
  address: string;
  contactEmail: string;
  contactName: string;
  contactPhone: string;
  logoUrl?: string;
  metadata?: {
    additionalProp1: unknown;
  };
  schoolType: "Public" | "Private";
  password: string;
}
export interface CreateSchoolResponse {
  message: string;
}

export interface VerifyAccountRequest {
  email: string;
  otp: string;
}

export interface ForgotPasswordRequest {
  email: string;
}
export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  data: null;
  statusCode: number;
}

export interface ResetPasswordRequest {
  email: string;
  token?: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface ResendOTPRequest {
  email: string;
}
