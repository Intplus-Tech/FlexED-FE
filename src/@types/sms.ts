export interface SmsTopup {
  schoolId: string;
  amount: number;
}

export interface SmsWalletResponse {
  success: boolean;
  message: string;
  data: SmsWallet;
  statusCode: number;
}

export interface SmsWallet {
  avalable: number;
  sms: number;
  totalSent: number;
  school: string;
}
