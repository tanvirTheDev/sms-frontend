import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'
import type { RegisterPayload, LoginPayload, ForgotPasswordPayload, ResetPasswordPayload, VerifyPhonePayload, StudentLoginPayload } from '@/api/auth'

export function useLogin() {
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: ({ data }) => {
      const { accessToken, refreshToken, user } = data.data!
      setAuth(user, accessToken, refreshToken)
      toast.success('Login successful')
      navigate({ to: '/dashboard' })
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const msg = error.response?.data?.message ?? 'Login failed'
      const friendly: Record<string, string> = {
        INVALID_CREDENTIALS: 'Invalid phone number or password',
        ACCOUNT_INACTIVE: 'Your account is inactive. Contact support.',
      }
      toast.error(friendly[msg] ?? msg)
    },
  })
}

export function useRegister() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
    onSuccess: ({ data }) => {
      const phone = data.data?.phone
      toast.success('OTP sent to your phone')
      navigate({ to: '/auth/verify-phone', search: { phone: phone ?? '' } })
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const msg = error.response?.data?.message ?? 'Registration failed'
      const friendly: Record<string, string> = {
        PHONE_ALREADY_REGISTERED: 'This phone number is already registered',
        EMAIL_ALREADY_REGISTERED: 'This email is already registered',
      }
      toast.error(friendly[msg] ?? msg)
    },
  })
}

export function useVerifyPhone() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (payload: VerifyPhonePayload) => authApi.verifyPhone(payload),
    onSuccess: () => {
      toast.success('Phone verified successfully')
      navigate({ to: '/auth/login' })
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const msg = error.response?.data?.message ?? 'Verification failed'
      const friendly: Record<string, string> = {
        INVALID_OTP: 'Invalid or expired OTP',
        OTP_EXPIRED: 'OTP has expired. Request a new one.',
        OTP_MAX_ATTEMPTS_EXCEEDED: 'Too many attempts. Request a new OTP.',
      }
      toast.error(friendly[msg] ?? msg)
    },
  })
}

export function useResendOtp() {
  return useMutation({
    mutationFn: ({ phone, purpose }: { phone: string; purpose: 'PHONE_VERIFICATION' | 'PASSWORD_RESET' }) =>
      authApi.resendOtp(phone, purpose),
    onSuccess: () => toast.success('OTP resent successfully'),
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const msg = error.response?.data?.message ?? 'Failed to resend OTP'
      const friendly: Record<string, string> = {
        OTP_SEND_TOO_SOON: 'Please wait 60 seconds before requesting another OTP',
      }
      toast.error(friendly[msg] ?? msg)
    },
  })
}

export function useForgotPassword() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (payload: ForgotPasswordPayload) => authApi.forgotPassword(payload),
    onSuccess: (_, variables) => {
      toast.success('If this number is registered, an OTP has been sent')
      navigate({ to: '/auth/reset-password', search: { phone: variables.phone } })
    },
  })
}

export function useResetPassword() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (payload: ResetPasswordPayload) => authApi.resetPassword(payload),
    onSuccess: () => {
      toast.success('Password reset successfully. Please login.')
      navigate({ to: '/auth/login' })
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const msg = error.response?.data?.message ?? 'Reset failed'
      const friendly: Record<string, string> = {
        INVALID_OTP: 'Invalid or expired OTP',
        OTP_EXPIRED: 'OTP has expired. Request a new one.',
      }
      toast.error(friendly[msg] ?? msg)
    },
  })
}

export function useStudentLogin() {
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (payload: StudentLoginPayload) => authApi.studentLogin(payload),
    onSuccess: ({ data }) => {
      const { accessToken, refreshToken, user } = data.data!
      setAuth(user, accessToken, refreshToken)
      toast.success('Login successful')
      navigate({ to: '/dashboard' })
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const msg = error.response?.data?.message ?? 'Login failed'
      const friendly: Record<string, string> = {
        INVALID_CREDENTIALS: 'Invalid student ID or password',
        ACCOUNT_INACTIVE: 'Account is inactive. Contact your school.',
        NO_ACTIVE_ENROLLMENT: 'No active enrollment found. Contact your school.',
      }
      toast.error(friendly[msg] ?? msg)
    },
  })
}

export function useMe() {
  const { isAuthenticated, setUser } = useAuthStore()

  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const { data } = await authApi.getMe()
      if (data.data) setUser(data.data)
      return data.data
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  })
}
