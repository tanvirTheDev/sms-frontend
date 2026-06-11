import { GraduationCap, Users, DollarSign, AlertCircle } from 'lucide-react'
import { StatCard } from './widgets/StatCard'
import { RecentNotices } from './widgets/RecentNotices'
import { FeeSummaryCard } from './widgets/FeeSummaryCard'
import { DueReportCard } from './widgets/DueReportCard'
import { useStudentCount, useStaffCount, useFeeSummary, useDueReport } from './hooks'

interface Props {
  schoolId: string
  roleName: string
}

export function AdminDashboard({ schoolId, roleName }: Props) {
  const { data: studentCount, isLoading: studentsLoading } = useStudentCount(schoolId)
  const { data: staffCount, isLoading: staffLoading } = useStaffCount(schoolId)
  const { data: feeSummary, isLoading: feeLoading } = useFeeSummary(schoolId)
  const { data: dueReport, isLoading: dueLoading } = useDueReport(schoolId)

  const totalDue = dueReport?.meta.total ?? 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {roleName} overview — {new Date().toLocaleDateString('en-BD', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Students"
          value={studentCount}
          subtitle="Enrolled this year"
          icon={GraduationCap}
          isLoading={studentsLoading}
        />
        <StatCard
          title="Total Staff"
          value={staffCount}
          subtitle="Active members"
          icon={Users}
          isLoading={staffLoading}
        />
        <StatCard
          title="Collected (BDT)"
          value={
            feeSummary?.totalCollected
              ? `৳ ${parseFloat(feeSummary.totalCollected).toLocaleString('en-BD')}`
              : null
          }
          subtitle={`${new Date().getFullYear()} total`}
          icon={DollarSign}
          isLoading={feeLoading}
        />
        <StatCard
          title="Pending Fee Students"
          value={totalDue > 0 ? totalDue : feeSummary?.unpaidCount}
          subtitle="Have outstanding dues"
          icon={AlertCircle}
          isLoading={dueLoading || feeLoading}
        />
      </div>

      {/* Detail cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          <FeeSummaryCard schoolId={schoolId} />
        </div>
        <div className="lg:col-span-1">
          <DueReportCard schoolId={schoolId} />
        </div>
        <div className="lg:col-span-1">
          <RecentNotices schoolId={schoolId} />
        </div>
      </div>
    </div>
  )
}
