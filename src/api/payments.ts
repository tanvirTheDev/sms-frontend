import { apiClient } from './client'

export interface InitiatePaymentPayload {
  feeCollectionId: string
  studentId?: string
}

export interface InitiatePaymentResult {
  sessionId: string
  tranId: string
  amount: number
  gatewayUrl: string
}

export type PaymentSessionStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'

export interface PaymentSession {
  id: string
  tranId: string
  schoolId: string
  studentId: string
  feeCollectionId: string
  amount: number
  status: PaymentSessionStatus
  bankTranId: string | null
  cardBrand: string | null
  ipnVerified: boolean
  createdAt: string
  completedAt: string | null
}

export interface PaymentSessionWithStudent extends PaymentSession {
  student: { id: string; name: string; studentId: string }
  feeCollection: { id: string; feeType: string; billingMonth: number | null; billingYear: number }
}

export interface ListSessionsQuery {
  page?: number
  limit?: number
  studentId?: string
  status?: PaymentSessionStatus
}

const base = (schoolId: string) => `/schools/${schoolId}`

export const paymentsApi = {
  initiate: (schoolId: string, payload: InitiatePaymentPayload) =>
    apiClient.post<{ success: boolean; message: string; data: InitiatePaymentResult }>(
      `${base(schoolId)}/payments/initiate`,
      payload,
    ),

  getSessionStatus: (schoolId: string, tranId: string) =>
    apiClient.get<{ success: boolean; data: PaymentSession }>(
      `${base(schoolId)}/payments/session/${tranId}`,
    ),

  listSessions: (schoolId: string, query: ListSessionsQuery = {}) =>
    apiClient.get<{
      success: boolean
      data: PaymentSessionWithStudent[]
      meta: { total: number; page: number; limit: number; totalPages: number }
    }>(`${base(schoolId)}/payments/sessions`, { params: query }),
}
