import { createFileRoute, Link } from '@tanstack/react-router'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { usePaymentSessionStatus } from '@/features/payment/hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BDT } from '@/features/fees/constants'

export const Route = createFileRoute('/_authenticated/payment/success')({
  component: PaymentSuccessPage,
  validateSearch: (s: Record<string, unknown>) => ({
    tran_id: typeof s.tran_id === 'string' ? s.tran_id : '',
    fee_id: typeof s.fee_id === 'string' ? s.fee_id : undefined,
  }),
})

function PaymentSuccessPage() {
  const { tran_id } = Route.useSearch()
  const { user } = useAuthStore()
  const schoolId = user?.schoolId ?? ''

  const { data: session, isLoading } = usePaymentSessionStatus(schoolId, tran_id || null)

  const isCompleted = session?.status === 'COMPLETED'
  const isPending = !session || session.status === 'PENDING'

  if (isLoading && !session) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">Verifying payment…</span>
      </div>
    )
  }

  if (isPending) {
    return (
      <div className="max-w-md mx-auto mt-12">
        <Card>
          <CardHeader className="text-center">
            <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto mb-2" />
            <CardTitle>Confirming Payment</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Payment received. Waiting for confirmation from the gateway…
            </p>
            <p className="text-xs text-muted-foreground">Transaction ID: {tran_id}</p>
            <p className="text-xs text-muted-foreground">This page will update automatically.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto mt-12">
      <Card>
        <CardHeader className="text-center">
          <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-2" />
          <CardTitle className="text-green-700">Payment Successful</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isCompleted && session && (
            <div className="rounded-lg bg-muted/40 border p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Amount Paid</span>
                <span className="font-bold">{BDT(session.amount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Transaction ID</span>
                <span className="font-mono text-xs">{tran_id}</span>
              </div>
              {session.bankTranId && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Bank Ref</span>
                  <span className="font-mono text-xs">{session.bankTranId}</span>
                </div>
              )}
              {session.cardBrand && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Method</span>
                  <span>{session.cardBrand}</span>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <Button asChild className="flex-1">
              <Link to="/fees">View Fees</Link>
            </Button>
            <Button variant="outline" asChild className="flex-1">
              <Link to="/dashboard">Dashboard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
