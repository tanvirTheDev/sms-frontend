import { UserCheck, DollarSign, BookOpen } from 'lucide-react'
import { StatCard } from './widgets/StatCard'
import { RecentNotices } from './widgets/RecentNotices'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
  schoolId: string
  userName: string
}

export function StudentDashboard({ schoolId, userName }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome, {userName}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {new Date().toLocaleDateString('en-BD', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Attendance"
          value="—"
          subtitle="This month"
          icon={UserCheck}
        />
        <StatCard
          title="Pending Fees"
          value="—"
          subtitle="Due amount"
          icon={DollarSign}
        />
        <StatCard
          title="Exam Results"
          value="—"
          subtitle="Latest result"
          icon={BookOpen}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">My Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Student profile details will appear here once connected to student API.
            </p>
          </CardContent>
        </Card>
        <RecentNotices schoolId={schoolId} />
      </div>
    </div>
  )
}
