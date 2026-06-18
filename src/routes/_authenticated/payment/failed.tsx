import { createFileRoute, Link } from '@tanstack/react-router'
import { XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/_authenticated/payment/failed')({
  component: PaymentFailedPage,
  validateSearch: (s: Record<string, unknown>) => ({
    tran_id: typeof s.tran_id === 'string' ? s.tran_id : '',
  }),
})

function PaymentFailedPage() {
  const { tran_id } = Route.useSearch()

  return (
    <div className="max-w-md mx-auto mt-12">
      <Card>
        <CardHeader className="text-center">
          <XCircle className="h-12 w-12 text-destructive mx-auto mb-2" />
          <CardTitle className="text-destructive">Payment Failed</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Your payment could not be processed. No amount has been deducted.
          </p>
          {tran_id && (
            <p className="text-xs text-muted-foreground font-mono">Ref: {tran_id}</p>
          )}
          <div className="flex gap-3">
            <Button asChild className="flex-1">
              <Link to="/fees">Try Again</Link>
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
