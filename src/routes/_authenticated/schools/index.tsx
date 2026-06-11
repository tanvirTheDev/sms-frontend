import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useSchools } from '@/features/schools/hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Plus, Search, School, MapPin, Phone, BookOpen,
  ChevronLeft, ChevronRight, Loader2, AlertCircle,
} from 'lucide-react'
import type { School as SchoolType } from '@/types/school'

export const Route = createFileRoute('/_authenticated/schools/')({
  beforeLoad: ({ context: _ctx }) => {
    const raw = localStorage.getItem('sms-auth')
    if (raw) {
      const state = JSON.parse(raw)
      if (state.state?.user?.role !== 'SUPER_ADMIN') {
        throw redirect({ to: '/dashboard' })
      }
    }
  },
  component: SchoolsListPage,
})

function managementBadgeVariant(type: string): 'default' | 'secondary' | 'outline' {
  if (type === 'GOVERNMENT') return 'default'
  if (type === 'MPO') return 'secondary'
  return 'outline'
}

function SchoolCard({ school }: { school: SchoolType }) {
  return (
    <Link to="/schools/$schoolId" params={{ schoolId: school.id }}>
      <Card className="hover:border-primary transition-colors cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <School className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm leading-snug truncate">{school.name}</p>
                {school.nameBn && (
                  <p className="text-xs text-muted-foreground">{school.nameBn}</p>
                )}
                <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="truncate">{school.upazila}, {school.district}, {school.division}</span>
                </div>
                <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
                  <Phone className="h-3 w-3 shrink-0" />
                  <span>{school.phone}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <Badge variant={managementBadgeVariant(school.managementType)} className="text-xs">
                {school.managementType.replace('_', ' ')}
              </Badge>
              <Badge variant={school.isActive ? 'secondary' : 'outline'} className="text-xs">
                {school.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-3 pt-3 border-t text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              {school.level.replace('_', ' ')}
            </span>
            <span>{school.medium}</span>
            <span>{school.gender.replace('_', ' ')}</span>
            {school.eiin && <span>EIIN: {school.eiin}</span>}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function SchoolsListPage() {
  const { user } = useAuthStore()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [debouncedSearch, setDebouncedSearch] = useState('')

  const { data, isLoading, isError } = useSchools({
    page,
    limit: 12,
    search: debouncedSearch || undefined,
  })

  const schools = data?.data ?? []
  const meta = data?.meta

  const handleSearch = (val: string) => {
    setSearch(val)
    clearTimeout((window as any).__schoolSearchTimer)
    ;(window as any).__schoolSearchTimer = setTimeout(() => {
      setDebouncedSearch(val)
      setPage(1)
    }, 400)
  }

  if (user?.role !== 'SUPER_ADMIN') return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Schools</h1>
          <p className="text-sm text-muted-foreground">
            {meta ? `${meta.total} school${meta.total !== 1 ? 's' : ''} registered` : 'Manage all institutions'}
          </p>
        </div>
        <Link to="/schools/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add School
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          className="pl-9"
          placeholder="Search name, EIIN, BANBEIS…"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading schools…
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" /> Failed to load schools
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && schools.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <School className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No schools found{debouncedSearch ? ` for "${debouncedSearch}"` : ''}.</p>
          <Link to="/schools/new">
            <Button variant="link" className="mt-2">Create the first school</Button>
          </Link>
        </div>
      )}

      {/* Grid */}
      {schools.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {schools.map((school) => (
            <SchoolCard key={school.id} school={school} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-muted-foreground">
            Page {meta.page} of {meta.totalPages} &middot; {meta.total} total
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p - 1)}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
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
