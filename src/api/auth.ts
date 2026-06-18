import { apiClient } from './client'
import type { ApiResponse, LoginResponse, UserProfile } from '@/types/auth'

export interface RegisterPayload {
  phone: string
  password: string
  confirmPassword: string
  email?: string
}

export interface VerifyPhonePayload {
  phone: string
  otp: string
}

export interface LoginPayload {
  phone: string
  password: string
}

export interface ForgotPasswordPayload {
  phone: string
}

export interface ResetPasswordPayload {
  phone: string
  otp: string
  newPassword: string
  confirmPassword: string
}

export type OtpPurpose = 'PHONE_VERIFICATION' | 'PASSWORD_RESET' | 'LOGIN' | 'EMAIL_VERIFICATION'

export interface StudentLoginPayload {
  loginId: string
  schoolId: string
  password: string
}

export const authApi = {
  register: (payload: RegisterPayload) =>
    apiClient.post<ApiResponse<{ phone: string }>>('/auth/register', payload),

  verifyPhone: (payload: VerifyPhonePayload) =>
    apiClient.post<ApiResponse>('/auth/verify-phone', payload),

  login: (payload: LoginPayload) =>
    apiClient.post<ApiResponse<LoginResponse>>('/auth/login', payload),

  refresh: (refreshToken: string) =>
    apiClient.post<ApiResponse<LoginResponse>>('/auth/refresh', { refreshToken }),

  logout: (refreshToken: string) =>
    apiClient.post<ApiResponse>('/auth/logout', { refreshToken }),

  forgotPassword: (payload: ForgotPasswordPayload) =>
    apiClient.post<ApiResponse>('/auth/forgot-password', payload),

  resetPassword: (payload: ResetPasswordPayload) =>
    apiClient.post<ApiResponse>('/auth/reset-password', payload),

  resendOtp: (phone: string, purpose: OtpPurpose) =>
    apiClient.post<ApiResponse>('/auth/resend-otp', { phone, purpose }),

  getMe: () =>
    apiClient.get<ApiResponse<UserProfile>>('/auth/me'),

  studentLogin: (payload: StudentLoginPayload) =>
    apiClient.post<ApiResponse<LoginResponse>>('/auth/student-login', payload),
}
