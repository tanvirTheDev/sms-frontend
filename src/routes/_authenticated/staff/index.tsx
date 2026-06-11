import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useStaffList } from '@/features/staff/hooks'
import { STAFF_ROLES, ROLE_GROUP_LABELS } from '@/features/staff/constants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Plus, Search, Users, Phone, Briefcase,
  ChevronLeft, ChevronRight, Loader2, AlertCircle,
} from 'lucide-react'
import type { StaffListItem } from '@/types/staff'

export const Route = createFileRoute('/_authenticated/staff/')({
  component: StaffListPage,
})

const ROLE_FILTER_OPTIONS = [
  { value: '', label: 'All Roles' },
  ...STAFF_ROLES.map(({ value, label }) => ({ value, label })),
]

function roleBadgeVariant(role: string): 'default' | 'secondary' | 'outline' {
  const group = ROLE_GROUP_LABELS[role]
  if (group === 'Admin') return 'default'
  if (group === 'Teacher') return 'secondary'
  return 'outline'
}

function StaffCard({ staff }: { staff: StaffListItem }) {
  const roleLabel = STAFF_ROLES.find(r => r.value === staff.role)?.label ?? staff.role
  const isMpo = staff.mpoStatus === 'MPO'
  const joiningYear = staff.joiningDate ? new Date(staff.joiningDate).getFullYear() : null

  return (
    <Link to="/staff/$staffId" params={{ staffId: staff.id }}>
      <Card className="hover:border-primary transition-colors cursor-pointer h-full">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary font-semibold text-sm">
              {staff.name.slice(0, 2).toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-sm leading-snug truncate">{staff.name}</p>
                  {staff.nameBn && (
                    <p className="text-xs text-muted-foreground">{staff.nameBn}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <Badge variant={staff.isActive ? 'secondary' : 'outline'} className="text-xs">
                    {staff.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  {isMpo && (
                    <Badge variant="default" className="text-xs">MPO</Badge>
                  )}
                </div>
              </div>

              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Briefcase className="h-3 w-3 shrink-0" />
                  <span className="truncate">{staff.designation}</span>
                  <span className="text-muted-foreground/40">·</span>
                  <Badge variant={roleBadgeVariant(staff.role)} className="text-[10px] h-4 px-1">
                    {roleLabel}
                  </Badge>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Phone className="h-3 w-3 shrink-0" />
                  <span>{staff.phone}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-2 pt-2 border-t">
                {staff.employeeId && (
                  <span className="text-xs text-muted-foreground">ID: {staff.employeeId}</span>
                )}
                {joiningYear && (
                  <span className="text-xs text-muted-foreground ml-auto">Joined {joiningYear}</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function StaffListPage() {
  const { user } = useAuthStore()
  const schoolId = user?.schoolId ?? null

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading, isError } = useStaffList(schoolId, {
    page,
    limit: 12,
    search: debouncedSearch || undefined,
    role: roleFilter || undefined,
  })

  const staffList = data?.data ?? []
  const meta = data?.meta

  const handleSearch = (val: string) => {
    setSearch(val)
    clearTimeout((window as any).__staffSearchTimer)
    ;(window as any).__staffSearchTimer = setTimeout(() => {
      setDebouncedSearch(val)
      setPage(1)
    }, 400)
  }

  const canManage = user?.role && ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL'].includes(user.role)

  if (!schoolId && user?.role !== 'SUPER_ADMIN') {
    return (
      <div className="text-center py-16 text-muted-foreground text-sm">
        No school assigned to your account.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Staff</h1>
          <p className="text-sm text-muted-foreground">
            {meta ? `${meta.total} staff member${meta.total !== 1 ? 's' : ''}` : 'Manage staff members'}
          </p>
        </div>
        {canManage && (
          <Link to="/staff/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Staff
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            className="pl-9"
            placeholder="Search name, phone, employee ID…"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        {/* Role filter — native select for simplicity */}
        <select
          className="h-8 rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1) }}
        >
          {ROLE_FILTER_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading staff…
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" /> Failed to load staff
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && staffList.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">
            No staff found{debouncedSearch ? ` for "${debouncedSearch}"` : ''}.
          </p>
          {canManage && (
            <Link to="/staff/new">
              <Button variant="link" className="mt-2">Add first staff member</Button>
            </Link>
          )}
        </div>
      )}

      {/* Grid */}
      {staffList.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {staffList.map((s) => (
            <StaffCard key={s.id} staff={s} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-muted-foreground">
            Page {meta.page} of {meta.totalPages} · {meta.total} total
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline" size="sm"
              onClick={() => setPage(p => p - 1)}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline" size="sm"
              onClick={() => setPage(p => p + 1)}
              disabled={page >= meta.totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
