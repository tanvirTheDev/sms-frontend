import { AlertCircle, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useDueReport } from '../hooks'

interface Props {
  schoolId: string
}

export function DueReportCard({ schoolId }: Props) {
  const { data, isLoading, isError } = useDueReport(schoolId)
  const items = data?.data ?? []

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 pb-3">
        <AlertCircle className="h-4 w-4 text-destructive" />
        <CardTitle className="text-base">Students with Due Fees</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
        {isError && (
          <p className="text-sm text-destructive">Failed to load due report</p>
        )}
        {!isLoading && !isError && items.length === 0 && (
          <p className="text-sm text-muted-foreground">No pending dues.</p>
        )}
        {items.length > 0 && (
          <ul className="space-y-2">
            {items.map((item) => (
              <li
                key={item.studentId}
                className="flex items-center justify-between text-sm border-b last:border-0 pb-2 last:pb-0"
              >
                <div>
                  <p className="font-medium">{item.studentName}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.className} – {item.sectionName} &middot; #{item.studentIdNo}
                  </p>
                </div>
                <span className="text-destructive font-semibold shrink-0 ml-2">
                  ৳ {parseFloat(item.totalDue).toLocaleString('en-BD')}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
