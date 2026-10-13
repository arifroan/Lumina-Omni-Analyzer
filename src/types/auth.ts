export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  provider: 'google' | 'email';
  isEmailVerified: boolean;
  createdAt: number;
  lastLoginAt: number;
}

export type AuthMode = 'signin' | 'signup' | 'otp' | 'forgot';
export type OtpPurpose = 'signup' | 'login' | 'reset';

export interface SendOtpResponse {
  success: boolean;
  message: string;
  otpCode?: string;
  expiresInSeconds?: number;
  error?: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sendOtp: (email: string, purpose: OtpPurpose) => Promise<SendOtpResponse>;
  verifyOtp: (payload: {
    email: string;
    code: string;
    purpose: OtpPurpose;
    name?: string;
    password?: string;
  }) => Promise<VerifyOtpResponse>;
  loginWithGoogle: (email?: string, name?: string) => Promise<boolean>;
  loginWithPassword: (email: string, password: string) => Promise<{ success: boolean; requiresOtp?: boolean; error?: string }>;
  logout: () => void;
}
