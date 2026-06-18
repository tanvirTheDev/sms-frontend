import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { format, differenceInDays } from 'date-fns'
import {
  Plus, Loader2, Trash2, X, Save,
  Check, XCircle, Calendar, Clock, CheckCircle, Ban,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { staffApi } from '@/api/staff'
import {
  useAllLeaves, useStaffLeaves, useCreateLeave,
  useReviewLeave, useCancelLeave, useDeleteLeave,
} from '@/features/leave/hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { LeaveApplication, LeaveType, CreateLeavePayload } from '@/types/leave'

export const Route = createFileRoute('/_authenticated/leaves/')({
  component: LeavesPage,
})

const LEAVE_TYPES: { value: LeaveType; label: string }[] = [
  { value: 'SICK', label: 'Sick Leave' },
  { value: 'CASUAL', label: 'Casual Leave' },
  { value: 'EARNED', label: 'Earned Leave' },
  { value: 'MATERNITY', label: 'Maternity Leave' },
  { value: 'PATERNITY', label: 'Paternity Leave' },
  { value: 'HAJJ', label: 'Hajj Leave' },
  { value: 'EXTRAORDINARY', label: 'Extraordinary Leave' },
  { value: 'OTHER', label: 'Other' },
]

const STATUS_CONFIG = {
  PENDING:   { label: 'Pending',   icon: Clock,        cls: 'text-amber-600 bg-amber-50 border-amber-200' },
  APPROVED:  { label: 'Approved',  icon: CheckCircle,  cls: 'text-green-600 bg-green-50 border-green-200' },
  REJECTED:  { label: 'Rejected',  icon: XCircle,      cls: 'text-red-600 bg-red-50 border-red-200' },
  CANCELLED: { label: 'Cancelled', icon: Ban,           cls: 'text-gray-500 bg-gray-50 border-gray-200' },
}

// ── Apply Form ─────────────────────────────────────────────────

function ApplyForm({ schoolId, staffId, onClose }: { schoolId: string; staffId: string; onClose: () => void }) {
  const [form, setForm] = useState<CreateLeavePayload>({
    type: 'SICK', fromDate: '', toDate: '', days: 1,
    year: new Date().getFullYear(), reason: '',
  })

  const { mutate: create, isPending } = useCreateLeave(schoolId, staffId)

  useEffect(() => {
    if (form.fromDate && form.toDate && form.toDate >= form.fromDate) {
      setForm((f) => ({ ...f, days: differenceInDays(new Date(form.toDate), new Date(form.fromDate)) + 1 }))
    }
  }, [form.fromDate, form.toDate])

  const valid = form.fromDate && form.toDate && form.toDate >= form.fromDate && form.reason.trim().length >= 5

  return (
    <Card className="border-primary/30">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Apply for Leave</h3>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}><X className="h-3.5 w-3.5" /></Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-medium">Leave Type *</label>
            <select className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as LeaveType }))}>
              {LEAVE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium">From Date *</label>
            <Input className="mt-1 h-9" type="date" value={form.fromDate}
              onChange={(e) => setForm((f) => ({ ...f, fromDate: e.target.value }))} />
          </div>

          <div>
            <label className="text-xs font-medium">To Date *</label>
            <Input className="mt-1 h-9" type="date" min={form.fromDate} value={form.toDate}
              onChange={(e) => setForm((f) => ({ ...f, toDate: e.target.value }))} />
          </div>

          <div>
            <label className="text-xs font-medium">Days (auto)</label>
            <Input className="mt-1 h-9 bg-muted" readOnly value={form.days} />
          </div>

          <div>
            <label className="text-xs font-medium">Year</label>
            <Input className="mt-1 h-9" type="number" min={2020} max={2099} value={form.year ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, year: Number(e.target.value) }))} />
          </div>

          <div className="sm:col-span-2 md:col-span-3">
            <label className="text-xs font-medium">Reason * <span className="text-muted-foreground font-normal">(min 5 chars)</span></label>
            <textarea className="mt-1 w-full h-20 rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
              placeholder="Explain the reason for leave…"
              value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} />
          </div>
        </div>

        <div className="flex gap-2">
          <Button size="sm" disabled={!valid || isPending} onClick={() => create(form, { onSuccess: onClose })}>
            {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Save className="h-3.5 w-3.5 mr-1" />}
            Submit Application
          </Button>
          <Button size="sm" variant="outline" onClick={onClose}>Cancel</Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ── Review Dialog ──────────────────────────────────────────────

function ReviewDialog({
  leave, action, schoolId, onClose,
}: {
  leave: LeaveApplication; action: 'APPROVED' | 'REJECTED'; schoolId: string; onClose: () => void
}) {
  const [note, setNote] = useState('')
  const { mutate: review, isPending } = useReviewLeave(schoolId, leave.staffId)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{action === 'APPROVED' ? 'Approve' : 'Reject'} Leave</h3>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}><X className="h-3.5 w-3.5" /></Button>
          </div>

          <div className="text-sm space-y-0.5">
            <p className="font-medium">{leave.staff.name}</p>
            <p className="text-muted-foreground">
              {LEAVE_TYPES.find((t) => t.value === leave.type)?.label} ·{' '}
              {format(new Date(leave.fromDate), 'dd MMM')} – {format(new Date(leave.toDate), 'dd MMM yyyy')} ({leave.days} days)
            </p>
          </div>

          <div>
            <label className="text-xs font-medium">Review note (optional)</label>
            <textarea className="mt-1 w-full h-20 rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
              placeholder="Add a note for the applicant…"
              value={note} onChange={(e) => setNote(e.target.value)} />
          </div>

          <div className="flex gap-2">
            <Button size="sm" disabled={isPending}
              className={action === 'APPROVED' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}
              onClick={() => review({ leaveId: leave.id, payload: { status: action, reviewNote: note.trim() || undefined } }, { onSuccess: onClose })}>
              {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />}
              Confirm {action === 'APPROVED' ? 'Approval' : 'Rejection'}
            </Button>
            <Button size="sm" variant="outline" onClick={onClose}>Cancel</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ── Leave Card ─────────────────────────────────────────────────

function LeaveCard({
  leave, canReview, schoolId,
  onReview, onCancel, onDelete,
}: {
  leave: LeaveApplication
  canReview: boolean
  schoolId: string
  onReview: (leave: LeaveApplication, action: 'APPROVED' | 'REJECTED') => void
  onCancel: (leave: LeaveApplication) => void
  onDelete: (leave: LeaveApplication) => void
}) {
  const cfg = STATUS_CONFIG[leave.status]
  const Icon = cfg.icon

  return (
    <Card>
      <CardContent className="p-4 space-y-2.5">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold text-sm">{leave.staff.name}
              {leave.staff.nameBn && <span className="text-muted-foreground font-normal ml-1.5 text-xs">{leave.staff.nameBn}</span>}
            </p>
            <p className="text-xs text-muted-foreground">{leave.staff.designation}
              {leave.staff.employeeId && <span className="ml-1">· {leave.staff.employeeId}</span>}
            </p>
          </div>
          <span className={cn('flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border shrink-0', cfg.cls)}>
            <Icon className="h-3 w-3" /> {cfg.label}
          </span>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="bg-muted px-2 py-0.5 rounded font-medium">
            {LEAVE_TYPES.find((t) => t.value === leave.type)?.label}
          </span>
          <span className="flex items-center gap-1 text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {format(new Date(leave.fromDate), 'dd MMM')} – {format(new Date(leave.toDate), 'dd MMM yyyy')}
            <span className="font-semibold text-foreground ml-1">{leave.days} day{leave.days !== 1 ? 's' : ''}</span>
          </span>
        </div>

        {/* Reason */}
        <p className="text-xs text-muted-foreground line-clamp-2">{leave.reason}</p>

        {/* Review note */}
        {leave.reviewNote && (
          <p className="text-xs bg-muted px-2.5 py-1.5 rounded">
            <span className="font-medium">Note: </span>{leave.reviewNote}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-1.5 flex-wrap pt-0.5">
          {canReview && leave.status === 'PENDING' && (
            <>
              <Button size="sm" className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white"
                onClick={() => onReview(leave, 'APPROVED')}>
                <Check className="h-3 w-3 mr-1" /> Approve
              </Button>
              <Button size="sm" variant="destructive" className="h-7 text-xs"
                onClick={() => onReview(leave, 'REJECTED')}>
                <XCircle className="h-3 w-3 mr-1" /> Reject
              </Button>
            </>
          )}
          {leave.status === 'PENDING' && (
            <>
              <Button size="sm" variant="outline" className="h-7 text-xs"
                onClick={() => onCancel(leave)}>
                <Ban className="h-3 w-3 mr-1" /> Cancel
              </Button>
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                onClick={() => onDelete(leave)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// ── Main Page ─────────────────────────────────────────────────

function LeavesPage() {
  const { user } = useAuthStore()
  const schoolId = user?.schoolId ?? ''
  const role = user?.role ?? ''
  const ownStaffId = user?.staffId ?? null   // set after backend fix

  const isReviewer = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL'].includes(role)

  // Filters
  const [filterStatus, setFilterStatus] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterYear, setFilterYear] = useState(new Date().getFullYear())

  // Admin: browse leaves by staff (optional — if empty shows all)
  const [staffSearch, setStaffSearch] = useState('')
  const [staffSuggestions, setStaffSuggestions] = useState<{ id: string; name: string; designation: string }[]>([])
  const [showStaffDrop, setShowStaffDrop] = useState(false)
  const [staffSearching, setStaffSearching] = useState(false)
  const [browseStaffId, setBrowseStaffId] = useState('')

  const [showApplyForm, setShowApplyForm] = useState(false)
  const [reviewTarget, setReviewTarget] = useState<{ leave: LeaveApplication; action: 'APPROVED' | 'REJECTED' } | null>(null)

  const filterParams = {
    status: filterStatus || undefined,
    type: filterType || undefined,
    year: filterYear || undefined,
  }

  // School-wide list (admin/principal — no staffId required)
  const { data: allLeaves = [], isLoading: allLoading } = useAllLeaves(
    isReviewer && !browseStaffId ? schoolId : null,
    filterParams
  )

  // Per-staff list: reviewer drilling into one staff, or own staff viewing self
  const staffIdForQuery = isReviewer ? browseStaffId : (ownStaffId ?? '')
  const { data: staffLeaves = [], isLoading: staffLoading } = useStaffLeaves(
    staffIdForQuery ? schoolId : null,
    staffIdForQuery || null,
    filterParams
  )

  const { mutate: cancelLeave } = useCancelLeave(schoolId, staffIdForQuery)
  const { mutate: deleteLeave } = useDeleteLeave(schoolId, staffIdForQuery)

  // Staff search (admin only — to drill into one person's leaves)
  useEffect(() => {
    if (!isReviewer || staffSearch.trim().length < 2) { setStaffSuggestions([]); setShowStaffDrop(false); return }
    const t = setTimeout(async () => {
      setStaffSearching(true)
      try {
        const r = await staffApi.list(schoolId, { search: staffSearch.trim(), limit: 8 })
        setStaffSuggestions((r.data.data ?? []).map((s: any) => ({ id: s.id, name: s.name, designation: s.designation })))
        setShowStaffDrop(true)
      } catch { } finally { setStaffSearching(false) }
    }, 350)
    return () => clearTimeout(t)
  }, [staffSearch, schoolId, isReviewer])

  const leaves: LeaveApplication[] = isReviewer
    ? (browseStaffId ? staffLeaves : allLeaves)
    : staffLeaves
  const isLoading = isReviewer ? (browseStaffId ? staffLoading : allLoading) : staffLoading

  const kpi = {
    total: leaves.length,
    pending: leaves.filter((l) => l.status === 'PENDING').length,
    approved: leaves.filter((l) => l.status === 'APPROVED').length,
    rejected: leaves.filter((l) => l.status === 'REJECTED').length,
  }

  if (!schoolId) return <div className="text-center py-16 text-muted-foreground text-sm">No school assigned.</div>

  return (
    <div className="space-y-6">
      {reviewTarget && (
        <ReviewDialog
          leave={reviewTarget.leave}
          action={reviewTarget.action}
          schoolId={schoolId}
          onClose={() => setReviewTarget(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Staff Leaves</h1>
          <p className="text-sm text-muted-foreground">
            {isReviewer
              ? 'Review and manage all staff leave applications.'
              : 'Apply for leave and track your applications.'}
          </p>
        </div>
        {/* Staff can apply if staffId is known; admin can apply on behalf when drilled in */}
        {(ownStaffId || (isReviewer && browseStaffId)) && !showApplyForm && (
          <Button size="sm" onClick={() => setShowApplyForm(true)}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Apply for Leave
          </Button>
        )}
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="p-3">
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="text-2xl font-bold">{kpi.total}</p>
        </CardContent></Card>
        <Card><CardContent className="p-3">
          <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3 text-amber-500" />Pending</p>
          <p className="text-2xl font-bold text-amber-600">{kpi.pending}</p>
        </CardContent></Card>
        <Card><CardContent className="p-3">
          <p className="text-xs text-muted-foreground flex items-center gap-1"><CheckCircle className="h-3 w-3 text-green-500" />Approved</p>
          <p className="text-2xl font-bold text-green-600">{kpi.approved}</p>
        </CardContent></Card>
        <Card><CardContent className="p-3">
          <p className="text-xs text-muted-foreground flex items-center gap-1"><XCircle className="h-3 w-3 text-red-500" />Rejected</p>
          <p className="text-2xl font-bold text-red-500">{kpi.rejected}</p>
        </CardContent></Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Admin: staff search to drill into one person's leaves */}
        {isReviewer && (
          <div className="relative">
            <div className="relative">
              <Input className="h-9 w-52 pr-8" placeholder="Filter by staff (optional)…"
                value={staffSearch}
                onChange={(e) => {
                  setStaffSearch(e.target.value)
                  if (!e.target.value) setBrowseStaffId('')
                }} />
              {staffSearching && <Loader2 className="absolute right-2 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />}
            </div>
            {showStaffDrop && staffSuggestions.length > 0 && (
              <div className="absolute z-50 w-56 mt-0.5 bg-popover border rounded-md shadow-md max-h-40 overflow-y-auto">
                {staffSuggestions.map((s) => (
                  <button key={s.id} className="w-full text-left px-3 py-2 hover:bg-muted text-sm border-b last:border-0"
                    onClick={() => { setBrowseStaffId(s.id); setStaffSearch(s.name); setShowStaffDrop(false) }}>
                    <p className="font-medium">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.designation}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <select className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="CANCELLED">Cancelled</option>
        </select>

        <select className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="">All Types</option>
          {LEAVE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>

        <Input className="h-9 w-20" type="number" min={2020} max={2099} value={filterYear}
          onChange={(e) => setFilterYear(Number(e.target.value))} />
      </div>

      {/* No staffId warning for non-admin staff */}
      {!isReviewer && !ownStaffId && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4 text-sm text-amber-800">
            <p className="font-semibold mb-1">Wrong account</p>
            <p>This login account has no staff record attached. Use the account your admin created for you when adding you as staff — not a self-registered account.</p>
          </CardContent>
        </Card>
      )}

      {/* Apply form */}
      {showApplyForm && (
        <ApplyForm
          schoolId={schoolId}
          staffId={isReviewer ? browseStaffId : ownStaffId!}
          onClose={() => setShowApplyForm(false)}
        />
      )}

      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-8">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      )}

      {!isLoading && leaves.length === 0 && (
        <div className="text-center py-16 text-muted-foreground text-sm">
          No leave applications found.
        </div>
      )}

      {leaves.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {leaves.map((leave) => (
            <LeaveCard
              key={leave.id}
              leave={leave}
              canReview={isReviewer}
              schoolId={schoolId}
              onReview={(l, action) => setReviewTarget({ leave: l, action })}
              onCancel={(l) => {
                if (confirm('Cancel this leave application?'))
                  cancelLeave({ leaveId: l.id })
              }}
              onDelete={(l) => {
                if (confirm('Delete this leave application? Only pending leaves can be deleted.'))
                  deleteLeave(l.id)
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
