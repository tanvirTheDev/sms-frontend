import { createFileRoute, Link } from '@tanstack/react-router'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/_authenticated/payment/error')({
  component: PaymentErrorPage,
  validateSearch: (s: Record<string, unknown>) => ({
    reason: typeof s.reason === 'string' ? s.reason : 'unknown',
  }),
})

function PaymentErrorPage() {
  const { reason } = Route.useSearch()

  const msgs: Record<string, string> = {
    invalid_request: 'Invalid payment request. Please try again from the fees page.',
    unknown: 'An unexpected error occurred. Please contact support if the issue persists.',
  }

  return (
    <div className="max-w-md mx-auto mt-12">
      <Card>
        <CardHeader className="text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-2" />
          <CardTitle>Payment Error</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            {msgs[reason] ?? msgs.unknown}
          </p>
          <p className="text-xs text-muted-foreground">Error code: {reason}</p>
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
