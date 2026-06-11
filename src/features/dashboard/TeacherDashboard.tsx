import { GraduationCap, BookOpen, Bell } from 'lucide-react'
import { StatCard } from './widgets/StatCard'
import { RecentNotices } from './widgets/RecentNotices'
import { useStudentCount } from './hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
  schoolId: string
  userName: string
}

export function TeacherDashboard({ schoolId, userName }: Props) {
  const { data: studentCount, isLoading } = useStudentCount(schoolId)

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
          title="Total Students"
          value={studentCount}
          subtitle="School-wide"
          icon={GraduationCap}
          isLoading={isLoading}
        />
        <StatCard
          title="My Classes"
          value="—"
          subtitle="Assigned sections"
          icon={BookOpen}
        />
        <StatCard
          title="Today's Attendance"
          value="—"
          subtitle="Mark from Attendance module"
          icon={Bell}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Today&apos;s Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Open the Classes module to view your routine and take attendance.
            </p>
          </CardContent>
        </Card>
        <RecentNotices schoolId={schoolId} />
      </div>
    </div>
  )
}
