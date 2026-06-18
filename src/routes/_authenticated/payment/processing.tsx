import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { usePaymentSessionStatus } from '@/features/payment/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/_authenticated/payment/processing')({
  component: PaymentProcessingPage,
  validateSearch: (s: Record<string, unknown>) => ({
    tran_id: typeof s.tran_id === 'string' ? s.tran_id : '',
  }),
})

function PaymentProcessingPage() {
  const { tran_id } = Route.useSearch()
  const { user } = useAuthStore()
  const schoolId = user?.schoolId ?? ''
  const navigate = useNavigate()

  const { data: session } = usePaymentSessionStatus(schoolId, tran_id || null)

  useEffect(() => {
    if (!session) return
    if (session.status === 'COMPLETED') {
      navigate({ to: '/payment/success', search: { tran_id } })
    } else if (session.status === 'FAILED') {
      navigate({ to: '/payment/failed', search: { tran_id } })
    } else if (session.status === 'CANCELLED') {
      navigate({ to: '/payment/cancelled', search: { tran_id } })
    }
  }, [session, navigate, tran_id])

  return (
    <div className="max-w-md mx-auto mt-12">
      <Card>
        <CardHeader className="text-center">
          <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto mb-2" />
          <CardTitle>Processing Payment</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            Your payment is being processed. Please do not close this page.
          </p>
          <p className="text-xs text-muted-foreground font-mono">{tran_id}</p>
          <p className="text-xs text-muted-foreground">
            This may take up to 30 seconds.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
