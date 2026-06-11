import { UserCheck, DollarSign, Bell } from 'lucide-react'
import { StatCard } from './widgets/StatCard'
import { RecentNotices } from './widgets/RecentNotices'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
  schoolId: string
}

export function ParentDashboard({ schoolId }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Parent Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor your child&apos;s progress and stay updated.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Child Attendance"
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
          title="Notices"
          value="—"
          subtitle="Unread"
          icon={Bell}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Child Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Your child&apos;s profile, class, and section details appear here.
            </p>
          </CardContent>
        </Card>
        <RecentNotices schoolId={schoolId} />
      </div>
    </div>
  )
}
