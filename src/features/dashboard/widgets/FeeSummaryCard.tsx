import { DollarSign, AlertCircle, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useFeeSummary } from '../hooks'

interface Props {
  schoolId: string
}

function fmt(val: string | undefined) {
  if (!val) return '—'
  const n = parseFloat(val)
  if (isNaN(n)) return '—'
  return `৳ ${n.toLocaleString('en-BD')}`
}

export function FeeSummaryCard({ schoolId }: Props) {
  const { data, isLoading, isError } = useFeeSummary(schoolId)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 pb-3">
        <DollarSign className="h-4 w-4 text-muted-foreground" />
        <CardTitle className="text-base">Fee Summary ({new Date().getFullYear()})</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
        {isError && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" /> Failed to load
          </div>
        )}
        {data && (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-0.5">
              <p className="text-xs text-muted-foreground">Total Billed</p>
              <p className="text-sm font-semibold">{fmt(data.totalBilled)}</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-xs text-muted-foreground">Collected</p>
              <p className="text-sm font-semibold text-green-600">{fmt(data.totalCollected)}</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-xs text-muted-foreground">Due</p>
              <p className="text-sm font-semibold text-destructive">{fmt(data.totalDue)}</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-xs text-muted-foreground">Waived</p>
              <p className="text-sm font-semibold text-muted-foreground">{fmt(data.totalWaived)}</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-xs text-muted-foreground">Paid students</p>
              <p className="text-sm font-semibold">{data.paidCount ?? '—'}</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-xs text-muted-foreground">Unpaid students</p>
              <p className="text-sm font-semibold text-destructive">{data.unpaidCount ?? '—'}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
