import { Link } from '@tanstack/react-router'
import { UserCheck, BookOpen, GraduationCap, CreditCard, Loader2, User } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useStudent } from '@/features/students/hooks'
import { useMyFees } from '@/features/fees/hooks'
import { StatCard } from './widgets/StatCard'
import { RecentNotices } from './widgets/RecentNotices'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BDT } from '@/features/fees/constants'
import { cn } from '@/lib/utils'

interface Props {
  schoolId: string
  userName: string
}

export function StudentDashboard({ schoolId, userName }: Props) {
  const { user } = useAuthStore()
  const studentId = user?.studentId ?? null

  const { data: student, isLoading: loadingStudent } = useStudent(schoolId, studentId)
  const { data: feesData, isLoading: loadingFees } = useMyFees(schoolId, studentId)

  const fees = feesData?.fees ?? []
  const summary = feesData?.summary
  const pendingCount = fees.filter((f) => f.status === 'UNPAID' || f.status === 'PARTIAL').length

  const displayName = student?.name ?? userName

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Welcome, {displayName}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {new Date().toLocaleDateString('en-BD', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard
          title="Attendance"
          value="—"
          subtitle="This month"
          icon={UserCheck}
        />
        <StatCard
          title="Exam Results"
          value="—"
          subtitle="Latest result"
          icon={BookOpen}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Student profile card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4" />
              My Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingStudent && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading…
              </div>
            )}
            {!loadingStudent && !student && (
              <p className="text-sm text-muted-foreground">Profile not found. Contact your school.</p>
            )}
            {student && (
              <div className="flex gap-4">
                {student.photo ? (
                  <img
                    src={student.photo}
                    alt={student.name}
                    className="h-16 w-16 rounded-full object-cover shrink-0 border"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border">
                    <GraduationCap className="h-7 w-7 text-primary" />
                  </div>
                )}
                <div className="space-y-1.5 min-w-0">
                  <div>
                    <p className="font-semibold text-sm">{student.name}</p>
                    {student.nameBn && (
                      <p className="text-xs text-muted-foreground">{student.nameBn}</p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="secondary" className="text-[10px]">
                      {student.studentId}
                    </Badge>
                    {student.section && (
                      <Badge variant="outline" className="text-[10px]">
                        {student.section.class.name} — {student.section.name}
                      </Badge>
                    )}
                    {student.gender && (
                      <Badge variant="outline" className="text-[10px]">{student.gender}</Badge>
                    )}
                  </div>
                  {student.dateOfBirth && (
                    <p className="text-xs text-muted-foreground">
                      DOB: {new Date(student.dateOfBirth).toLocaleDateString('en-BD')}
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Fee summary card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              My Fees
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loadingFees && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading…
              </div>
            )}
            {!loadingFees && summary && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-muted/40 border p-3">
                    <p className="text-xs text-muted-foreground">Total Billed</p>
                    <p className="font-bold text-sm mt-0.5">{BDT(summary.totalBilled)}</p>
                  </div>
                  <div className={cn(
                    'rounded-lg border p-3',
                    summary.totalDue > 0 ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100',
                  )}>
                    <p className="text-xs text-muted-foreground">Outstanding</p>
                    <p className={cn(
                      'font-bold text-sm mt-0.5',
                      summary.totalDue > 0 ? 'text-red-600' : 'text-green-700',
                    )}>
                      {BDT(summary.totalDue)}
                    </p>
                  </div>
                </div>
                {pendingCount > 0 && (
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded px-2 py-1.5">
                    {pendingCount} fee{pendingCount !== 1 ? 's' : ''} pending payment
                  </p>
                )}
              </>
            )}
            {!loadingFees && !summary && !studentId && (
              <p className="text-sm text-muted-foreground">No fee data available.</p>
            )}
            <Button variant="outline" size="sm" asChild className="w-full mt-1">
              <Link to="/fees">View All Fees</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <RecentNotices schoolId={schoolId} />
    </div>
  )
}
