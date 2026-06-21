import { createFileRoute, Link, useRouterState } from '@tanstack/react-router'
import { useState, useEffect, useMemo } from 'react'
import { format } from 'date-fns'
import {
  Loader2, ArrowRight, Trash2, CalendarDays, BookOpen, FlaskConical, Layers, TrendingUp, X,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useAcademicYears } from '@/features/academic-setup/hooks'
import { classApi } from '@/api/academic'
import { studentsApi } from '@/api/students'
import { usePromotions, useBulkPromote, useUpdatePromotionGroup, useDeletePromotion } from '@/features/promotion/hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { SchoolClass, ClassSection } from '@/types/academic'
import type { StudentListItem } from '@/types/student'
import type { PromotionStatus, SubjectGroup, PromotionRecord } from '@/api/promotion'

export const Route = createFileRoute('/_authenticated/academic-setup/promotion')({
  component: PromotionPage,
})

// ── SubNav (shared across academic-setup routes) ──────────────────

function SubNav() {
  const { location } = useRouterState()
  const items = [
    { to: '/academic-setup', label: 'Academic Years', icon: CalendarDays },
    { to: '/academic-setup/wings', label: 'Wings', icon: Layers },
    { to: '/academic-setup/classes', label: 'Classes & Sections', icon: BookOpen },
    { to: '/academic-setup/subjects', label: 'Subjects', icon: FlaskConical },
    { to: '/academic-setup/promotion', label: 'Promotion', icon: TrendingUp },
  ]
  return (
    <div className="flex gap-1 border-b pb-0 mb-6 overflow-x-auto">
      {items.map(({ to, label, icon: Icon }) => {
        const active = location.pathname === to
        return (
          <Link key={to} to={to}>
            <button
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap',
                active ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          </Link>
        )
      })}
    </div>
  )
}

// ── Constants ─────────────────────────────────────────────────────

const STATUSES: { value: PromotionStatus; label: string; color: string }[] = [
  { value: 'PROMOTED', label: 'Promoted', color: 'text-green-700' },
  { value: 'FAILED', label: 'Failed', color: 'text-red-600' },
  { value: 'DETAINED', label: 'Detained', color: 'text-amber-600' },
  { value: 'TRANSFERRED', label: 'Transferred', color: 'text-blue-600' },
  { value: 'DROPPED', label: 'Dropped', color: 'text-gray-500' },
]

const STATUS_BADGE: Record<PromotionStatus, string> = {
  PROMOTED: 'bg-green-50 text-green-700 border-green-200',
  FAILED: 'bg-red-50 text-red-700 border-red-200',
  DETAINED: 'bg-amber-50 text-amber-700 border-amber-200',
  TRANSFERRED: 'bg-blue-50 text-blue-700 border-blue-200',
  DROPPED: 'bg-gray-50 text-gray-600 border-gray-200',
}

const GROUPS: { value: SubjectGroup; label: string }[] = [
  { value: 'NONE', label: 'None / General' },
  { value: 'SCIENCE', label: 'Science' },
  { value: 'HUMANITIES', label: 'Humanities' },
  { value: 'COMMERCE', label: 'Commerce' },
  { value: 'GENERAL', label: 'General' },
  { value: 'DAKHIL_SCIENCE', label: 'Dakhil Science' },
  { value: 'DAKHIL_GENERAL', label: 'Dakhil General' },
  { value: 'ALIM_SCIENCE', label: 'Alim Science' },
  { value: 'ALIM_GENERAL', label: 'Alim General' },
]

// ── Student row state ─────────────────────────────────────────────

interface StudentRow {
  studentId: string
  name: string
  studentDisplayId: string
  status: PromotionStatus
  toSectionId: string
  groupAssigned: SubjectGroup
}

// ── Bulk Promote Tab ──────────────────────────────────────────────

function BulkPromoteTab({ schoolId }: { schoolId: string }) {
  const { data: years = [] } = useAcademicYears(schoolId)
  const { mutate: bulkPromote, isPending } = useBulkPromote(schoolId)

  // Source (from)
  const [fromYearId, setFromYearId] = useState('')
  const [fromClasses, setFromClasses] = useState<SchoolClass[]>([])
  const [fromClassId, setFromClassId] = useState('')
  const [fromSections, setFromSections] = useState<ClassSection[]>([])
  const [fromSectionId, setFromSectionId] = useState('')

  // Target (to) — default for all PROMOTED students
  const [toYearId, setToYearId] = useState('')
  const [toClasses, setToClasses] = useState<SchoolClass[]>([])
  const [toClassId, setToClassId] = useState('')
  const [toSections, setToSections] = useState<ClassSection[]>([])
  const [defaultToSectionId, setDefaultToSectionId] = useState('')

  // Students
  const [students, setStudents] = useState<StudentListItem[]>([])
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [rows, setRows] = useState<StudentRow[]>([])

  // Load from-classes when fromYear changes
  useEffect(() => {
    setFromClasses([]); setFromClassId(''); setFromSections([]); setFromSectionId('')
    setStudents([]); setRows([])
    if (!fromYearId) return
    classApi.list(schoolId, { academicYearId: fromYearId }).then((r) => setFromClasses(r.data.data ?? [])).catch(() => {})
  }, [fromYearId, schoolId])

  // Load from-sections when fromClass changes
  useEffect(() => {
    setFromSections([]); setFromSectionId(''); setStudents([]); setRows([])
    if (!fromClassId) return
    classApi.listSections(schoolId, fromClassId).then((r) => setFromSections(r.data.data ?? [])).catch(() => {})
  }, [fromClassId, schoolId])

  // Load students when fromSection changes
  useEffect(() => {
    setStudents([]); setRows([])
    if (!fromSectionId) return
    setLoadingStudents(true)
    studentsApi.list(schoolId, { sectionId: fromSectionId, isActive: true, limit: 200 })
      .then((r) => {
        const s = r.data.data ?? []
        setStudents(s)
        setRows(s.map((st) => ({
          studentId: st.id,
          name: st.name,
          studentDisplayId: st.studentId,
          status: 'PROMOTED',
          toSectionId: defaultToSectionId,
          groupAssigned: 'NONE',
        })))
      })
      .catch(() => {})
      .finally(() => setLoadingStudents(false))
  }, [fromSectionId, schoolId])

  // Load to-classes when toYear changes
  useEffect(() => {
    setToClasses([]); setToClassId(''); setToSections([]); setDefaultToSectionId('')
    if (!toYearId) return
    classApi.list(schoolId, { academicYearId: toYearId }).then((r) => setToClasses(r.data.data ?? [])).catch(() => {})
  }, [toYearId, schoolId])

  // Load to-sections when toClass changes
  useEffect(() => {
    setToSections([]); setDefaultToSectionId('')
    if (!toClassId) return
    classApi.listSections(schoolId, toClassId).then((r) => setToSections(r.data.data ?? [])).catch(() => {})
  }, [toClassId, schoolId])

  // Apply default toSectionId to all PROMOTED rows when it changes
  useEffect(() => {
    setRows((prev) => prev.map((r) => r.status === 'PROMOTED' ? { ...r, toSectionId: defaultToSectionId } : r))
  }, [defaultToSectionId])

  const updateRow = (studentId: string, patch: Partial<StudentRow>) => {
    setRows((prev) => prev.map((r) => r.studentId === studentId ? { ...r, ...patch } : r))
  }

  const handleSubmit = () => {
    if (!fromYearId || !fromSectionId) return
    const records = rows.map((r) => ({
      studentId: r.studentId,
      status: r.status,
      toSectionId: r.status === 'PROMOTED' && r.toSectionId ? r.toSectionId : undefined,
      groupAssigned: r.groupAssigned,
    }))
    bulkPromote(
      { academicYearId: fromYearId, fromSectionId, records },
      { onSuccess: () => { setStudents([]); setRows([]) } },
    )
  }

  const promotedCount = rows.filter((r) => r.status === 'PROMOTED').length
  const canSubmit = rows.length > 0 && !isPending &&
    rows.every((r) => r.status !== 'PROMOTED' || r.toSectionId)

  const sel = 'h-9 rounded-md border border-input bg-background px-3 text-sm w-full'

  return (
    <div className="space-y-5">
      {/* Source section picker */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="text-sm font-semibold">Source (Promoting From)</h3>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium mb-1 block">Academic Year</label>
              <select className={sel} value={fromYearId} onChange={(e) => setFromYearId(e.target.value)}>
                <option value="">Select year</option>
                {years.map((y) => <option key={y.id} value={y.id}>{y.name} ({y.year})</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Class</label>
              <select className={sel} value={fromClassId} onChange={(e) => setFromClassId(e.target.value)} disabled={!fromYearId}>
                <option value="">Select class</option>
                {fromClasses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Section</label>
              <select className={sel} value={fromSectionId} onChange={(e) => setFromSectionId(e.target.value)} disabled={!fromClassId}>
                <option value="">Select section</option>
                {fromSections.map((s) => <option key={s.id} value={s.id}>Section {s.name}</option>)}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Default target section picker */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="text-sm font-semibold">Default Target (Promoting To)</h3>
          <p className="text-xs text-muted-foreground">Must be from a different academic year. Applied to all PROMOTED students; can override per student below.</p>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium mb-1 block">Academic Year</label>
              <select className={sel} value={toYearId} onChange={(e) => setToYearId(e.target.value)}>
                <option value="">Select year</option>
                {years.filter((y) => y.id !== fromYearId).map((y) => <option key={y.id} value={y.id}>{y.name} ({y.year})</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Class</label>
              <select className={sel} value={toClassId} onChange={(e) => setToClassId(e.target.value)} disabled={!toYearId}>
                <option value="">Select class</option>
                {toClasses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Section</label>
              <select className={sel} value={defaultToSectionId} onChange={(e) => setDefaultToSectionId(e.target.value)} disabled={!toClassId}>
                <option value="">Select section</option>
                {toSections.map((s) => <option key={s.id} value={s.id}>Section {s.name}</option>)}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Student list */}
      {loadingStudents && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-6">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading students…
        </div>
      )}

      {!loadingStudents && fromSectionId && students.length === 0 && (
        <div className="text-center py-10 text-muted-foreground text-sm">No active students in this section.</div>
      )}

      {rows.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {rows.length} student{rows.length !== 1 ? 's' : ''} · {promotedCount} promoted
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setRows((r) => r.map((s) => ({ ...s, status: 'PROMOTED', toSectionId: defaultToSectionId })))}>
                All Promoted
              </Button>
              <Button variant="outline" size="sm" onClick={() => setRows((r) => r.map((s) => ({ ...s, status: 'FAILED', toSectionId: '' })))}>
                All Failed
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            {rows.map((row) => (
              <Card key={row.studentId} className={cn(row.status !== 'PROMOTED' && 'opacity-75')}>
                <CardContent className="p-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{row.name}</p>
                      <p className="text-xs text-muted-foreground">{row.studentDisplayId}</p>
                    </div>

                    {/* Status */}
                    <select
                      className="h-8 rounded-md border border-input bg-background px-2 text-xs font-medium w-32"
                      value={row.status}
                      onChange={(e) => {
                        const status = e.target.value as PromotionStatus
                        updateRow(row.studentId, {
                          status,
                          toSectionId: status === 'PROMOTED' ? defaultToSectionId : '',
                        })
                      }}
                    >
                      {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>

                    {/* To Section (only for PROMOTED) */}
                    {row.status === 'PROMOTED' && (
                      <>
                        <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                        <select
                          className={cn('h-8 rounded-md border px-2 text-xs w-36', !row.toSectionId ? 'border-destructive' : 'border-input bg-background')}
                          value={row.toSectionId}
                          onChange={(e) => updateRow(row.studentId, { toSectionId: e.target.value })}
                        >
                          <option value="">Pick section</option>
                          {toSections.map((s) => <option key={s.id} value={s.id}>Section {s.name}</option>)}
                        </select>

                        {/* Subject group */}
                        <select
                          className="h-8 rounded-md border border-input bg-background px-2 text-xs w-32"
                          value={row.groupAssigned}
                          onChange={(e) => updateRow(row.studentId, { groupAssigned: e.target.value as SubjectGroup })}
                        >
                          {GROUPS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
                        </select>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button disabled={!canSubmit} onClick={handleSubmit}>
              {isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Promote {rows.length} Student{rows.length !== 1 ? 's' : ''}
            </Button>
            {rows.some((r) => r.status === 'PROMOTED' && !r.toSectionId) && (
              <p className="text-xs text-destructive">All PROMOTED students need a target section.</p>
            )}
          </div>
        </>
      )}
    </div>
  )
}

// ── History Tab ───────────────────────────────────────────────────

function HistoryTab({ schoolId }: { schoolId: string }) {
  const { data: years = [] } = useAcademicYears(schoolId)
  const [yearFilter, setYearFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [editingGroup, setEditingGroup] = useState<PromotionRecord | null>(null)
  const [groupValue, setGroupValue] = useState<SubjectGroup>('NONE')
  const [groupLog, setGroupLog] = useState('')

  const { data: records = [], isLoading } = usePromotions(schoolId, {
    academicYearId: yearFilter || undefined,
    status: statusFilter as any || undefined,
  })

  const { mutate: updateGroup, isPending: updatingGroup } = useUpdatePromotionGroup(schoolId)
  const { mutate: deleteRecord } = useDeletePromotion(schoolId)

  const startEditGroup = (r: PromotionRecord) => {
    setEditingGroup(r)
    setGroupValue(r.groupAssigned)
    setGroupLog('')
  }

  const sel = 'h-9 rounded-md border border-input bg-background px-3 text-sm'

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <select className={sel} value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}>
          <option value="">All Years</option>
          {years.map((y) => <option key={y.id} value={y.id}>{y.name} ({y.year})</option>)}
        </select>
        <select className={sel} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <span className="text-xs text-muted-foreground ml-auto">{records.length} record{records.length !== 1 ? 's' : ''}</span>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-8">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      )}

      {!isLoading && records.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">No promotion records found.</div>
      )}

      {/* Group edit modal */}
      {editingGroup && (
        <Card className="border-primary/40">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Update Subject Group — {editingGroup.student.name}</h3>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingGroup(null)}>
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium mb-1 block">New Group</label>
                <select className={cn(sel, 'w-full')} value={groupValue} onChange={(e) => setGroupValue(e.target.value as SubjectGroup)}>
                  {GROUPS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Reason (min 10 chars)</label>
                <Input
                  className="h-9"
                  placeholder="Explain why the group is changing…"
                  value={groupLog}
                  onChange={(e) => setGroupLog(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                disabled={groupLog.length < 10 || updatingGroup}
                onClick={() => updateGroup(
                  { id: editingGroup.id, payload: { groupAssigned: groupValue, groupChangeLog: groupLog } },
                  { onSuccess: () => setEditingGroup(null) },
                )}
              >
                {updatingGroup && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />}
                Save Group
              </Button>
              <Button variant="outline" size="sm" onClick={() => setEditingGroup(null)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {records.map((r) => (
          <Card key={r.id}>
            <CardContent className="p-3">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">{r.student.name}</span>
                    <span className="text-xs text-muted-foreground">{r.student.studentId}</span>
                    <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded border', STATUS_BADGE[r.status])}>
                      {r.status}
                    </span>
                    {r.groupAssigned !== 'NONE' && (
                      <Badge variant="secondary" className="text-[10px]">{r.groupAssigned}</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Year: {r.academicYear.name}
                    {r.promotedAt && ` · ${format(new Date(r.promotedAt), 'dd MMM yyyy')}`}
                  </p>
                  {r.groupChangeLog && (
                    <p className="text-xs text-muted-foreground italic">Log: {r.groupChangeLog}</p>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  {r.status === 'PROMOTED' && (
                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => startEditGroup(r)}>
                      Group
                    </Button>
                  )}
                  {r.status !== 'PROMOTED' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => { if (confirm('Delete this record?')) deleteRecord(r.id) }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────

function PromotionPage() {
  const { user } = useAuthStore()
  const schoolId = user?.schoolId ?? ''
  const [tab, setTab] = useState<'promote' | 'history'>('promote')

  if (!schoolId) return null

  return (
    <div className="space-y-6">
      <SubNav />

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Student Promotion</h1>
        <p className="text-sm text-muted-foreground">Promote, fail, or transfer students at year-end.</p>
      </div>

      <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit">
        {[
          { key: 'promote', label: 'Bulk Promote' },
          { key: 'history', label: 'History' },
        ].map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key as any)}
            className={cn(
              'px-4 py-1.5 rounded-md text-sm font-medium transition-colors',
              tab === key ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'promote' && <BulkPromoteTab schoolId={schoolId} />}
      {tab === 'history' && <HistoryTab schoolId={schoolId} />}
    </div>
  )
}
