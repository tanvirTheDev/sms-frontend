import { Loader2, Bell, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useRecentNotices } from '../hooks'
import { formatDistanceToNow } from 'date-fns'
import type { NoticeTarget } from '@/types'

const targetColors: Record<NoticeTarget, string> = {
  ALL: 'secondary',
  TEACHERS: 'outline',
  STUDENTS: 'outline',
  PARENTS: 'outline',
  STAFF: 'outline',
}

interface Props {
  schoolId: string
}

export function RecentNotices({ schoolId }: Props) {
  const { data: notices, isLoading, isError } = useRecentNotices(schoolId)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 pb-3">
        <Bell className="h-4 w-4 text-muted-foreground" />
        <CardTitle className="text-base">Recent Notices</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading notices…
          </div>
        )}
        {isError && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            Failed to load notices
          </div>
        )}
        {!isLoading && !isError && (!notices || notices.length === 0) && (
          <p className="text-sm text-muted-foreground">No published notices.</p>
        )}
        {notices && notices.length > 0 && (
          <ul className="space-y-3">
            {notices.map((notice) => (
              <li key={notice.id} className="flex flex-col gap-1 border-b last:border-0 pb-3 last:pb-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium leading-snug">{notice.title}</p>
                  <Badge
                    variant={targetColors[notice.target] as 'secondary' | 'outline'}
                    className="shrink-0 text-xs"
                  >
                    {notice.target}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {notice.publishedAt
                    ? formatDistanceToNow(new Date(notice.publishedAt), { addSuffix: true })
                    : 'Draft'}
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
