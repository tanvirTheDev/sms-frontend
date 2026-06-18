import { createFileRoute, Link } from '@tanstack/react-router'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/_authenticated/payment/cancelled')({
  component: PaymentCancelledPage,
  validateSearch: (s: Record<string, unknown>) => ({
    tran_id: typeof s.tran_id === 'string' ? s.tran_id : '',
  }),
})

function PaymentCancelledPage() {
  const { tran_id } = Route.useSearch()

  return (
    <div className="max-w-md mx-auto mt-12">
      <Card>
        <CardHeader className="text-center">
          <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-2" />
          <CardTitle>Payment Cancelled</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            You cancelled the payment. No amount has been deducted.
          </p>
          {tran_id && (
            <p className="text-xs text-muted-foreground font-mono">Ref: {tran_id}</p>
          )}
          <div className="flex gap-3">
            <Button asChild className="flex-1">
              <Link to="/fees">Back to Fees</Link>
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
