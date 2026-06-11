import { Link } from '@tanstack/react-router'
import { School, Users, GraduationCap, Activity, Plus } from 'lucide-react'
import { StatCard } from './widgets/StatCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useSchools } from '@/features/schools/hooks'

export function SuperAdminDashboard() {
  const { data: schoolsData, isLoading } = useSchools({ page: 1, limit: 5 })
  const totalSchools = schoolsData?.meta?.total
  const recentSchools = schoolsData?.data ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Super Admin</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Platform-wide overview — {new Date().toLocaleDateString('en-BD', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Link to="/schools/new">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1.5" /> Add School
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Schools"
          value={isLoading ? '…' : String(totalSchools ?? '—')}
          subtitle="Registered institutions"
          icon={School}
        />
        <StatCard title="Total Students" value="—" subtitle="All schools" icon={GraduationCap} />
        <StatCard title="Total Staff" value="—" subtitle="All schools" icon={Users} />
        <StatCard title="System Health" value="OK" subtitle="All services running" icon={Activity} />
      </div>

      {/* Recent Schools */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">Recent Schools</CardTitle>
          <Link to="/schools">
            <Button variant="link" size="sm" className="h-auto p-0">View all</Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {recentSchools.length === 0 && !isLoading && (
            <p className="text-sm text-muted-foreground px-6 pb-4">No schools registered yet.</p>
          )}
          <ul className="divide-y">
            {recentSchools.map((school) => (
              <li key={school.id}>
                <Link
                  to="/schools/$schoolId"
                  params={{ schoolId: school.id }}
                  className="flex items-center justify-between px-6 py-3 hover:bg-muted transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium">{school.name}</p>
                    <p className="text-xs text-muted-foreground">{school.district}, {school.division}</p>
                  </div>
                  <Badge variant={school.isActive ? 'secondary' : 'outline'} className="text-xs shrink-0">
                    {school.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </Link>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
