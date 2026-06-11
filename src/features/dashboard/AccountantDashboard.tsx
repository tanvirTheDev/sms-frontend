import { DollarSign, AlertCircle, TrendingUp } from 'lucide-react'
import { StatCard } from './widgets/StatCard'
import { FeeSummaryCard } from './widgets/FeeSummaryCard'
import { DueReportCard } from './widgets/DueReportCard'
import { useFeeSummary } from './hooks'

interface Props {
  schoolId: string
}

export function AccountantDashboard({ schoolId }: Props) {
  const { data: feeSummary, isLoading } = useFeeSummary(schoolId)

  const collectionRate =
    feeSummary?.totalBilled && feeSummary?.totalCollected
      ? ((parseFloat(feeSummary.totalCollected) / parseFloat(feeSummary.totalBilled)) * 100).toFixed(1)
      : null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Finance Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Fee collection overview — {new Date().getFullYear()}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Collected"
          value={
            feeSummary?.totalCollected
              ? `৳ ${parseFloat(feeSummary.totalCollected).toLocaleString('en-BD')}`
              : null
          }
          subtitle={`${new Date().getFullYear()} total`}
          icon={DollarSign}
          isLoading={isLoading}
          trendUp={true}
        />
        <StatCard
          title="Total Due"
          value={
            feeSummary?.totalDue
              ? `৳ ${parseFloat(feeSummary.totalDue).toLocaleString('en-BD')}`
              : null
          }
          subtitle="Outstanding amount"
          icon={AlertCircle}
          isLoading={isLoading}
        />
        <StatCard
          title="Collection Rate"
          value={collectionRate ? `${collectionRate}%` : null}
          subtitle="Billed vs collected"
          icon={TrendingUp}
          isLoading={isLoading}
          trendUp={collectionRate ? parseFloat(collectionRate) >= 70 : undefined}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <FeeSummaryCard schoolId={schoolId} />
        <DueReportCard schoolId={schoolId} />
      </div>
    </div>
  )
}
