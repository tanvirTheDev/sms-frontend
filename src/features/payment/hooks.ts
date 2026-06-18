import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { paymentsApi, type InitiatePaymentPayload, type ListSessionsQuery } from '@/api/payments'

const ERR: Record<string, string> = {
  FEE_COLLECTION_NOT_FOUND: 'Fee record not found.',
  FEE_ALREADY_PAID: 'This fee has already been paid.',
  FEE_WAIVED: 'This fee has been waived.',
  PAYMENT_SESSION_ALREADY_PENDING: 'A payment is already in progress for this fee.',
  GATEWAY_ERROR: 'Payment gateway unavailable. Try again shortly.',
}

export function useInitiatePayment(schoolId: string) {
  return useMutation({
    mutationFn: (payload: InitiatePaymentPayload) => paymentsApi.initiate(schoolId, payload),
    onSuccess: ({ data }) => {
      const { gatewayUrl } = data.data!
      window.location.href = gatewayUrl
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message ?? 'Payment failed'
      toast.error(ERR[msg] ?? msg)
    },
  })
}

export function usePaymentSessionStatus(schoolId: string, tranId: string | null, enabled = true) {
  return useQuery({
    queryKey: ['payment-session', schoolId, tranId],
    queryFn: async () => {
      const res = await paymentsApi.getSessionStatus(schoolId, tranId!)
      return res.data.data
    },
    enabled: !!tranId && !!schoolId && enabled,
    refetchInterval: (query) => {
      const status = query.state.data?.status
      if (status === 'PENDING') return 3000
      return false
    },
    staleTime: 0,
  })
}

export function usePaymentSessions(schoolId: string, query: ListSessionsQuery = {}) {
  return useQuery({
    queryKey: ['payment-sessions', schoolId, query],
    queryFn: async () => {
      const res = await paymentsApi.listSessions(schoolId, query)
      return { data: res.data.data, meta: res.data.meta }
    },
    enabled: !!schoolId,
    staleTime: 30 * 1000,
  })
}
