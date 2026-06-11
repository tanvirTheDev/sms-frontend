import { createFileRoute } from '@tanstack/react-router'
import { useAuthStore } from '@/store/authStore'
import { AdminDashboard } from '@/features/dashboard/AdminDashboard'
import { TeacherDashboard } from '@/features/dashboard/TeacherDashboard'
import { AccountantDashboard } from '@/features/dashboard/AccountantDashboard'
import { StudentDashboard } from '@/features/dashboard/StudentDashboard'
import { ParentDashboard } from '@/features/dashboard/ParentDashboard'
import { SuperAdminDashboard } from '@/features/dashboard/SuperAdminDashboard'
import { Card, CardContent } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  const { user } = useAuthStore()

  if (!user) return null

  const { role, schoolId, phone } = user

  // Roles that need a schoolId to show data
  const needsSchool =
    role !== 'SUPER_ADMIN' && !schoolId

  if (needsSchool) {
    return (
      <div className="flex items-center gap-3 text-sm text-muted-foreground p-4">
        <AlertCircle className="h-5 w-5 text-destructive" />
        Your account is not linked to a school yet. Contact your administrator.
      </div>
    )
  }

  switch (role) {
    case 'SUPER_ADMIN':
      return <SuperAdminDashboard />

    case 'SCHOOL_ADMIN':
      return <AdminDashboard schoolId={schoolId!} roleName="Admin" />

    case 'PRINCIPAL':
      return <AdminDashboard schoolId={schoolId!} roleName="Principal" />

    case 'ACCOUNTANT':
      return <AccountantDashboard schoolId={schoolId!} />

    case 'TEACHER':
      return <TeacherDashboard schoolId={schoolId!} userName={phone} />

    case 'OFFICE_STAFF':
    case 'LIBRARIAN':
      return (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {role.replace('_', ' ')} view
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <StaffNoticeDashboard schoolId={schoolId!} />
          </div>
        </div>
      )

    case 'STUDENT':
      return <StudentDashboard schoolId={schoolId!} userName={phone} />

    case 'PARENT':
    case 'GUARDIAN':
      return <ParentDashboard schoolId={schoolId!} />

    default:
      return (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              No dashboard configured for role: {role}
            </p>
          </CardContent>
        </Card>
      )
  }
}

// Inline minimal dashboard for OFFICE_STAFF / LIBRARIAN
import { RecentNotices } from '@/features/dashboard/widgets/RecentNotices'
import { useStudentCount } from '@/features/dashboard/hooks'
import { StatCard } from '@/features/dashboard/widgets/StatCard'
import { GraduationCap } from 'lucide-react'

function StaffNoticeDashboard({ schoolId }: { schoolId: string }) {
  const { data: studentCount, isLoading } = useStudentCount(schoolId)
  return (
    <>
      <div className="space-y-4">
        <StatCard
          title="Active Students"
          value={studentCount}
          subtitle="School-wide"
          icon={GraduationCap}
          isLoading={isLoading}
        />
        <RecentNotices schoolId={schoolId} />
      </div>
    </>
  )
}
