import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect, useMemo } from 'react'
import { format } from 'date-fns'
import {
  Loader2, Plus, Trash2, Pencil, X, Save, Receipt, Search,
  TrendingUp, AlertCircle, ChevronDown, ChevronUp, CreditCard, CheckCircle2,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useAcademicYears, useClasses } from '@/features/academic-setup/hooks'
import { classApi } from '@/api/academic'
import { studentsApi } from '@/api/students'
import {
  useFeeStructures, useCreateFeeStructure, useUpdateFeeStructure, useDeleteFeeStructure,
  useFeeCollections, useCreateFeeCollection, useUpdateFeeCollection,
  useDueReport, useFeeSummary, useMyFees,
} from '@/features/fees/hooks'
import { useInitiatePayment, usePaymentSessions } from '@/features/payment/hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import {
  FEE_TYPES, PAYMENT_METHODS, PAYMENT_STATUSES, STATUS_COLORS, MONTH_NAMES, BDT,
} from '@/features/fees/constants'
import type { FeeType, PaymentMethod, PaymentStatus, FeeStructure, FeeCollection } from '@/types/fee'
import type { ClassSection } from '@/types/academic'
import type { StudentListItem } from '@/types/student'
import type { PaymentSessionStatus } from '@/api/payments'

export const Route = createFileRoute('/_authenticated/fees/')({
  component: FeesPage,
})

type Tab = 'structures' | 'collect' | 'due' | 'summary' | 'my-fees' | 'payments'

// ── Helpers ───────────────────────────────────────────────────────

function feeTypeLabel(t: FeeType) {
  return FEE_TYPES.find((f) => f.value === t)?.label ?? t
}

function StatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded border', STATUS_COLORS[status])}>
      {status}
    </span>
  )
}

const now = new Date()

// ── Fee Structures Tab ────────────────────────────────────────────

function FeeStructuresTab({ schoolId, canEdit }: { schoolId: string; canEdit: boolean }) {
  const { data: years = [] } = useAcademicYears(schoolId)
  const { data: classes = [] } = useClasses(schoolId)
  const [yearFilter, setYearFilter] = useState('')
  const [classFilter, setClassFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)

  // Form state
  const [form, setForm] = useState({
    academicYearId: '', classId: '', feeType: 'TUITION' as FeeType,
    name: '', amount: '', dueDay: '', isRecurring: false,
  })

  const { data: structures = [], isLoading } = useFeeStructures(schoolId, {
    academicYearId: yearFilter || undefined,
    classId: classFilter || undefined,
  })

  const { mutate: create, isPending: creating } = useCreateFeeStructure(schoolId)
  const { mutate: update, isPending: updating } = useUpdateFeeStructure(schoolId, editId ?? '')
  const { mutate: del } = useDeleteFeeStructure(schoolId)

  const resetForm = () => {
    setForm({ academicYearId: '', classId: '', feeType: 'TUITION', name: '', amount: '', dueDay: '', isRecurring: false })
    setEditId(null)
    setShowForm(false)
  }

  const startEdit = (s: FeeStructure) => {
    setForm({
      academicYearId: s.academicYearId, classId: s.classId, feeType: s.feeType,
      name: s.name, amount: String(s.amount), dueDay: s.dueDay ? String(s.dueDay) : '',
      isRecurring: s.isRecurring,
    })
    setEditId(s.id)
    setShowForm(true)
  }

  const handleSubmit = () => {
    const payload = {
      academicYearId: form.academicYearId,
      classId: form.classId,
      feeType: form.feeType,
      name: form.name.trim(),
      amount: parseFloat(form.amount),
      dueDay: form.dueDay ? parseInt(form.dueDay) : undefined,
      isRecurring: form.isRecurring,
    }
    if (editId) {
      const { academicYearId: _a, classId: _c, ...updatePayload } = payload
      update(updatePayload, { onSuccess: resetForm })
    } else {
      create(payload, { onSuccess: resetForm })
    }
  }

  const grouped = useMemo(() => {
    const map = new Map<string, FeeStructure[]>()
    structures.forEach((s) => {
      const key = s.class.name
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(s)
    })
    return map
  }, [structures])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <select className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}>
          <option value="">All Years</option>
          {years.map((y) => <option key={y.id} value={y.id}>{y.name} ({y.year})</option>)}
        </select>
        <select className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
          <option value="">All Classes</option>
          {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        {canEdit && (
          <Button size="sm" className="ml-auto" onClick={() => { setShowForm(true); setEditId(null) }}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Structure
          </Button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <Card className="border-primary/30">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">{editId ? 'Edit' : 'New'} Fee Structure</h3>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={resetForm}><X className="h-3.5 w-3.5" /></Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {!editId && (
                <>
                  <div>
                    <label className="text-xs font-medium">Academic Year</label>
                    <select className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                      value={form.academicYearId} onChange={(e) => setForm({ ...form, academicYearId: e.target.value })}>
                      <option value="">Select</option>
                      {years.map((y) => <option key={y.id} value={y.id}>{y.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium">Class</label>
                    <select className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                      value={form.classId} onChange={(e) => setForm({ ...form, classId: e.target.value })}>
                      <option value="">Select</option>
                      {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </>
              )}
              <div>
                <label className="text-xs font-medium">Fee Type</label>
                <select className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                  value={form.feeType} onChange={(e) => setForm({ ...form, feeType: e.target.value as FeeType })}>
                  {FEE_TYPES.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium">Name / Label</label>
                <Input className="mt-1 h-9" placeholder="e.g. Monthly Tuition" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-medium">Amount (BDT)</label>
                <Input className="mt-1 h-9" type="number" min="0" placeholder="500" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-medium">Due Day (1-28)</label>
                <Input className="mt-1 h-9" type="number" min="1" max="28" placeholder="10" value={form.dueDay} onChange={(e) => setForm({ ...form, dueDay: e.target.value })} />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.isRecurring} onChange={(e) => setForm({ ...form, isRecurring: e.target.checked })} />
              Recurring monthly fee
            </label>
            <div className="flex gap-2 pt-1">
              <Button size="sm" disabled={creating || updating || !form.name || !form.amount || (!editId && (!form.academicYearId || !form.classId))} onClick={handleSubmit}>
                {(creating || updating) ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Save className="h-3.5 w-3.5 mr-1" />}
                {editId ? 'Save Changes' : 'Create Structure'}
              </Button>
              <Button size="sm" variant="outline" onClick={resetForm}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading && <div className="flex items-center gap-2 text-sm text-muted-foreground py-8"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>}

      {!isLoading && structures.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">No fee structures found. Create one to get started.</div>
      )}

      {[...grouped.entries()].map(([className, items]) => (
        <Card key={className}>
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold mb-3">{className}</h3>
            <div className="divide-y">
              {items.map((s) => (
                <div key={s.id} className="flex items-center gap-3 py-2.5">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{s.name}</span>
                      <Badge variant="outline" className="text-[10px]">{feeTypeLabel(s.feeType)}</Badge>
                      {s.isRecurring && <Badge variant="secondary" className="text-[10px]">Monthly</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {s.academicYear.name}
                      {s.dueDay ? ` · Due: Day ${s.dueDay}` : ''}
                    </p>
                  </div>
                  <span className="font-semibold text-sm">{BDT(s.amount)}</span>
                  {canEdit && (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(s)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => del(s.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ── Collect Fee Tab ───────────────────────────────────────────────

function CollectFeeTab({ schoolId }: { schoolId: string }) {
  const { data: years = [] } = useAcademicYears(schoolId)
  const { mutate: createCollection, isPending: creating } = useCreateFeeCollection(schoolId)

  const [studentSearch, setStudentSearch] = useState('')
  const [studentResults, setStudentResults] = useState<StudentListItem[]>([])
  const [searching, setSearching] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<StudentListItem | null>(null)

  const [form, setForm] = useState({
    academicYearId: '', feeType: 'TUITION' as FeeType,
    billingMonth: String(now.getMonth() + 1), billingYear: String(now.getFullYear()),
    amount: '', discount: '', paidAmount: '', paymentMethod: 'CASH' as PaymentMethod,
    transactionId: '', waiverReason: '',
  })

  // Debounced student search
  useEffect(() => {
    if (studentSearch.length < 2) { setStudentResults([]); return }
    const t = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await studentsApi.list(schoolId, { search: studentSearch, limit: 10, isActive: true })
        setStudentResults(res.data.data ?? [])
      } catch { setStudentResults([]) }
      finally { setSearching(false) }
    }, 400)
    return () => clearTimeout(t)
  }, [studentSearch, schoolId])

  const handleSubmit = () => {
    if (!selectedStudent) return
    createCollection({
      studentId: selectedStudent.id,
      academicYearId: form.academicYearId,
      feeType: form.feeType,
      billingMonth: form.billingMonth ? parseInt(form.billingMonth) : undefined,
      billingYear: parseInt(form.billingYear),
      amount: parseFloat(form.amount),
      discount: form.discount ? parseFloat(form.discount) : undefined,
      paidAmount: form.paidAmount ? parseFloat(form.paidAmount) : undefined,
      paymentMethod: form.paidAmount ? form.paymentMethod : undefined,
      transactionId: form.transactionId.trim() || undefined,
      waiverReason: form.waiverReason.trim() || undefined,
    }, {
      onSuccess: () => {
        setSelectedStudent(null)
        setStudentSearch('')
        setForm({
          academicYearId: '', feeType: 'TUITION', billingMonth: String(now.getMonth() + 1),
          billingYear: String(now.getFullYear()), amount: '', discount: '', paidAmount: '',
          paymentMethod: 'CASH', transactionId: '', waiverReason: '',
        })
      },
    })
  }

  return (
    <div className="max-w-2xl space-y-5">
      {/* Student search */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="text-sm font-semibold">Select Student</h3>
          {!selectedStudent ? (
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9 h-9"
                placeholder="Search name or student ID…"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
              />
              {searching && <Loader2 className="absolute right-2.5 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />}
              {studentResults.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-background border rounded-md shadow-lg divide-y">
                  {studentResults.map((s) => (
                    <button
                      key={s.id}
                      className="w-full text-left px-3 py-2 hover:bg-muted text-sm"
                      onClick={() => { setSelectedStudent(s); setStudentSearch(''); setStudentResults([]) }}
                    >
                      <span className="font-medium">{s.name}</span>
                      <span className="text-muted-foreground ml-2 text-xs">{s.studentId}</span>
                      {s.section && <span className="text-muted-foreground ml-2 text-xs">· {s.section.class.name} {s.section.name}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3 p-2.5 rounded-lg border bg-muted/30">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
                {selectedStudent.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{selectedStudent.name}</p>
                <p className="text-xs text-muted-foreground">
                  {selectedStudent.studentId}
                  {selectedStudent.section && ` · ${selectedStudent.section.class.name} ${selectedStudent.section.name}`}
                </p>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedStudent(null)}>
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fee details */}
      {selectedStudent && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <h3 className="text-sm font-semibold">Fee Details</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium">Academic Year</label>
                <select className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                  value={form.academicYearId} onChange={(e) => setForm({ ...form, academicYearId: e.target.value })}>
                  <option value="">Select</option>
                  {years.map((y) => <option key={y.id} value={y.id}>{y.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium">Fee Type</label>
                <select className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                  value={form.feeType} onChange={(e) => setForm({ ...form, feeType: e.target.value as FeeType })}>
                  {FEE_TYPES.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium">Billing Month</label>
                <select className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                  value={form.billingMonth} onChange={(e) => setForm({ ...form, billingMonth: e.target.value })}>
                  <option value="">— (no month)</option>
                  {MONTH_NAMES.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium">Billing Year</label>
                <Input className="mt-1 h-9" type="number" value={form.billingYear} onChange={(e) => setForm({ ...form, billingYear: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-medium">Amount (BDT)</label>
                <Input className="mt-1 h-9" type="number" min="0" placeholder="500" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-medium">Discount (BDT)</label>
                <Input className="mt-1 h-9" type="number" min="0" placeholder="0" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-medium">Paid Amount (BDT)</label>
                <Input className="mt-1 h-9" type="number" min="0" placeholder="0" value={form.paidAmount} onChange={(e) => setForm({ ...form, paidAmount: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-medium">Payment Method</label>
                <select className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                  value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value as PaymentMethod })}>
                  {PAYMENT_METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium">Transaction ID (optional)</label>
                <Input className="mt-1 h-9" placeholder="bKash/bank ref" value={form.transactionId} onChange={(e) => setForm({ ...form, transactionId: e.target.value })} />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium">Waiver Reason (optional)</label>
                <Input className="mt-1 h-9" placeholder="Reason for waiver/discount" value={form.waiverReason} onChange={(e) => setForm({ ...form, waiverReason: e.target.value })} />
              </div>
            </div>
            <Button
              disabled={creating || !form.amount || !form.academicYearId || !form.billingYear}
              onClick={handleSubmit}
            >
              {creating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Receipt className="h-4 w-4 mr-2" />}
              Record Payment
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ── Due Report Tab ────────────────────────────────────────────────

function DueReportTab({ schoolId }: { schoolId: string }) {
  const { data: years = [] } = useAcademicYears(schoolId)
  const { data: classes = [] } = useClasses(schoolId)
  const [yearFilter, setYearFilter] = useState('')
  const [classFilter, setClassFilter] = useState('')
  const [sectionFilter, setSectionFilter] = useState('')
  const [sections, setSections] = useState<ClassSection[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    setSectionFilter('')
    setSections([])
    if (!classFilter) return
    classApi.listSections(schoolId, classFilter).then((res) => setSections(res.data.data ?? [])).catch(() => {})
  }, [classFilter, schoolId])

  const { data: report = [], isLoading } = useDueReport(schoolId, {
    academicYearId: yearFilter || undefined,
    classId: classFilter || undefined,
    sectionId: sectionFilter || undefined,
  })

  const totalOutstanding = report.reduce((s, r) => s + r.totalDue, 0)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <select className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}>
          <option value="">All Years</option>
          {years.map((y) => <option key={y.id} value={y.id}>{y.name}</option>)}
        </select>
        <select className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
          <option value="">All Classes</option>
          {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        {sections.length > 0 && (
          <select className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={sectionFilter} onChange={(e) => setSectionFilter(e.target.value)}>
            <option value="">All Sections</option>
            {sections.map((s) => <option key={s.id} value={s.id}>Section {s.name}</option>)}
          </select>
        )}
      </div>

      {report.length > 0 && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-100">
          <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
          <span className="text-sm font-medium text-red-700">
            {report.length} student{report.length !== 1 ? 's' : ''} with outstanding dues · Total: {BDT(totalOutstanding)}
          </span>
        </div>
      )}

      {isLoading && <div className="flex items-center gap-2 text-sm text-muted-foreground py-8"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>}
      {!isLoading && report.length === 0 && <div className="text-center py-12 text-muted-foreground text-sm">No outstanding dues. 🎉</div>}

      <div className="space-y-2">
        {report.map((entry) => {
          const expanded = expandedId === entry.studentId
          return (
            <Card key={entry.studentId} className="overflow-hidden">
              <CardContent className="p-0">
                <button
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors text-left"
                  onClick={() => setExpandedId(expanded ? null : entry.studentId)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{entry.studentName}</p>
                    <p className="text-xs text-muted-foreground">
                      {entry.studentRoll} · {entry.className} {entry.sectionName}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-red-600 shrink-0">{BDT(entry.totalDue)}</span>
                  {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
                </button>
                {expanded && (
                  <div className="border-t divide-y bg-muted/20">
                    {entry.collections.map((c) => (
                      <div key={c.id} className="flex items-center gap-3 px-4 py-2">
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-medium">{feeTypeLabel(c.feeType)}</span>
                          {c.billingMonth && <span className="text-xs text-muted-foreground ml-2">{MONTH_NAMES[c.billingMonth - 1]} {c.billingYear}</span>}
                        </div>
                        <StatusBadge status={c.status} />
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Due: {BDT(c.outstanding)}</p>
                          <p className="text-[10px] text-muted-foreground">of {BDT(c.amount)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

// ── Summary Tab ───────────────────────────────────────────────────

function SummaryTab({ schoolId }: { schoolId: string }) {
  const { data: years = [] } = useAcademicYears(schoolId)
  const [yearFilter, setYearFilter] = useState('')
  const [monthFilter, setMonthFilter] = useState('')
  const [yearNumFilter, setYearNumFilter] = useState(String(now.getFullYear()))

  const { data: summary, isLoading } = useFeeSummary(schoolId, {
    academicYearId: yearFilter || undefined,
    billingMonth: monthFilter ? parseInt(monthFilter) : undefined,
    billingYear: yearNumFilter ? parseInt(yearNumFilter) : undefined,
  })

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-3 items-center">
        <select className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}>
          <option value="">All Academic Years</option>
          {years.map((y) => <option key={y.id} value={y.id}>{y.name}</option>)}
        </select>
        <select className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)}>
          <option value="">All Months</option>
          {MONTH_NAMES.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
        </select>
        <Input className="h-9 w-24" type="number" value={yearNumFilter} onChange={(e) => setYearNumFilter(e.target.value)} />
      </div>

      {isLoading && <div className="flex items-center gap-2 text-sm text-muted-foreground py-8"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>}

      {summary && (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Total Billed', value: BDT(summary.totalBilled), color: 'text-foreground' },
              { label: 'Collected', value: BDT(summary.totalCollected), color: 'text-green-700' },
              { label: 'Outstanding', value: BDT(summary.totalOutstanding), color: 'text-red-600' },
              { label: 'Discount', value: BDT(summary.totalDiscount), color: 'text-amber-700' },
            ].map(({ label, value, color }) => (
              <Card key={label}>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className={cn('text-lg font-bold mt-1', color)}>{value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* By status */}
          <Card>
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold mb-3">By Status</h3>
              <div className="divide-y">
                {summary.byStatus.map((s) => (
                  <div key={s.status} className="flex items-center gap-3 py-2">
                    <StatusBadge status={s.status as PaymentStatus} />
                    <span className="text-xs text-muted-foreground flex-1">{s.count} records</span>
                    <span className="text-xs">{BDT(s.collected)} / {BDT(s.billed)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* By fee type */}
          <Card>
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold mb-3">By Fee Type</h3>
              <div className="divide-y">
                {summary.byFeeType.map((f) => {
                  const pct = f.billed > 0 ? Math.round((f.collected / f.billed) * 100) : 0
                  return (
                    <div key={f.feeType} className="flex items-center gap-3 py-2">
                      <span className="text-sm flex-1">{feeTypeLabel(f.feeType as FeeType)}</span>
                      <span className="text-xs text-muted-foreground">{f.count}</span>
                      <span className="text-xs w-20 text-right">{BDT(f.collected)}</span>
                      <div className="w-20">
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <p className="text-[10px] text-muted-foreground text-right mt-0.5">{pct}%</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

// ── My Fees Tab (student self-service) ───────────────────────────

const SESSION_STATUS_COLORS: Record<PaymentSessionStatus, string> = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  COMPLETED: 'bg-green-50 text-green-700 border-green-200',
  FAILED: 'bg-red-50 text-red-700 border-red-200',
  CANCELLED: 'bg-gray-50 text-gray-600 border-gray-200',
}

function MyFeesTab({ schoolId, studentId }: { schoolId: string; studentId: string }) {
  const [yearFilter, setYearFilter] = useState('')
  const { data: years = [] } = useAcademicYears(schoolId)
  const { data, isLoading } = useMyFees(schoolId, studentId, {
    billingYear: yearFilter ? parseInt(yearFilter) : undefined,
  })
  const { mutate: initiate, isPending: initiating, variables: initiatingVars } = useInitiatePayment(schoolId)

  const collections = data?.fees ?? []
  const summary = data?.summary

  const unpaidCount = collections.filter((c) => {
    const due = Number(c.amount) - Number(c.discount) - Number(c.paidAmount)
    return (c.status === 'UNPAID' || c.status === 'PARTIAL') && due > 0
  }).length

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center gap-3">
        <select
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
        >
          <option value="">All Years</option>
          {[...new Set(collections.map((c) => c.billingYear))].sort((a, b) => b - a).map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {summary && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total Billed', value: BDT(summary.totalBilled), color: 'text-foreground' },
            { label: 'Paid', value: BDT(summary.totalPaid), color: 'text-green-700' },
            { label: 'Outstanding', value: BDT(summary.totalDue), color: 'text-red-600' },
          ].map(({ label, value, color }) => (
            <Card key={label}>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className={cn('text-base font-bold mt-1', color)}>{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {unpaidCount > 0 && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 border border-amber-100">
          <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
          <span className="text-sm text-amber-700">
            {unpaidCount} fee{unpaidCount !== 1 ? 's' : ''} pending payment
          </span>
        </div>
      )}

      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-8">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading your fees…
        </div>
      )}

      {!isLoading && collections.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">No fee records found.</div>
      )}

      <div className="space-y-2">
        {collections.map((c) => {
          const outstanding = Number(c.amount) - Number(c.discount) - Number(c.paidAmount)
          const canPay = (c.status === 'UNPAID' || c.status === 'PARTIAL') && outstanding > 0
          const isThisPaying = initiating && (initiatingVars as any)?.feeCollectionId === c.id

          return (
            <Card key={c.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium">
                        {FEE_TYPES.find((f) => f.value === c.feeType)?.label ?? c.feeType}
                      </span>
                      {c.billingMonth && (
                        <span className="text-xs text-muted-foreground">
                          {MONTH_NAMES[c.billingMonth - 1]} {c.billingYear}
                        </span>
                      )}
                      <StatusBadge status={c.status} />
                    </div>
                    <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Fee: {BDT(Number(c.amount))}</span>
                      {Number(c.discount) > 0 && <span>Discount: −{BDT(Number(c.discount))}</span>}
                      {Number(c.paidAmount) > 0 && <span>Paid: {BDT(Number(c.paidAmount))}</span>}
                      {canPay && <span className="text-red-600 font-medium">Due: {BDT(outstanding)}</span>}
                    </div>
                    {c.receiptNo && (
                      <p className="text-[10px] text-muted-foreground mt-1">Receipt: {c.receiptNo}</p>
                    )}
                  </div>

                  {canPay ? (
                    <Button
                      size="sm"
                      className="shrink-0"
                      disabled={isThisPaying || initiating}
                      onClick={() => initiate({ feeCollectionId: c.id })}
                    >
                      {isThisPaying ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                      ) : (
                        <CreditCard className="h-3.5 w-3.5 mr-1" />
                      )}
                      Pay {BDT(outstanding)}
                    </Button>
                  ) : c.status === 'PAID' ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  ) : null}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {unpaidCount > 0 && (
        <p className="text-xs text-muted-foreground text-center">
          Payments are processed via SSLCommerz. You will be redirected to complete payment.
        </p>
      )}
    </div>
  )
}

// ── Online Payments Tab (admin view) ──────────────────────────────

function OnlinePaymentsTab({ schoolId }: { schoolId: string }) {
  const [statusFilter, setStatusFilter] = useState<PaymentSessionStatus | ''>('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = usePaymentSessions(schoolId, {
    status: statusFilter || undefined,
    page,
    limit: 20,
  })

  const sessions = data?.data ?? []
  const meta = data?.meta

  const statusColors: Record<PaymentSessionStatus, string> = SESSION_STATUS_COLORS

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <select
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value as PaymentSessionStatus | ''); setPage(1) }}
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="COMPLETED">Completed</option>
          <option value="FAILED">Failed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        {meta && (
          <span className="text-xs text-muted-foreground ml-auto">
            {meta.total} session{meta.total !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-8">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      )}

      {!isLoading && sessions.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">No payment sessions found.</div>
      )}

      <div className="space-y-2">
        {sessions.map((s) => (
          <Card key={s.id}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">{s.student?.name ?? '—'}</span>
                    <span className="text-xs text-muted-foreground">{s.student?.studentId}</span>
                    <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded border', statusColors[s.status])}>
                      {s.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                    <span>
                      {FEE_TYPES.find((f) => f.value === s.feeCollection?.feeType)?.label ?? s.feeCollection?.feeType}
                      {s.feeCollection?.billingMonth ? ` — ${MONTH_NAMES[s.feeCollection.billingMonth - 1]} ${s.feeCollection.billingYear}` : ''}
                    </span>
                    <span className="font-mono">{s.tranId}</span>
                    {s.bankTranId && <span>Bank: {s.bankTranId}</span>}
                    {s.cardBrand && <span>{s.cardBrand}</span>}
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    {format(new Date(s.createdAt), 'dd MMM yyyy, HH:mm')}
                    {s.completedAt && ` → ${format(new Date(s.completedAt), 'dd MMM yyyy, HH:mm')}`}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-semibold text-sm">{BDT(s.amount)}</p>
                  {s.ipnVerified && (
                    <p className="text-[10px] text-green-600">IPN verified</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</Button>
          <span className="text-xs text-muted-foreground">Page {page} of {meta.totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= meta.totalPages} onClick={() => setPage(page + 1)}>Next</Button>
        </div>
      )}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────

function FeesPage() {
  const { user } = useAuthStore()
  const schoolId = user?.schoolId ?? ''
  const role = user?.role ?? ''
  const isStudent = role === 'STUDENT'
  const isParent = role === 'PARENT'
  const canEdit = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'ACCOUNTANT'].includes(role)
  const canSeeAdmin = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'ACCOUNTANT', 'OFFICE_STAFF'].includes(role)

  const defaultTab: Tab = isStudent || isParent ? 'my-fees' : 'summary'
  const [tab, setTab] = useState<Tab>(defaultTab)

  const allTabs: { key: Tab; label: string; show: boolean }[] = [
    { key: 'my-fees', label: 'My Fees', show: isStudent || isParent },
    { key: 'summary', label: 'Summary', show: canSeeAdmin },
    { key: 'due', label: 'Due Report', show: canSeeAdmin },
    { key: 'collect', label: 'Collect Fee', show: canSeeAdmin },
    { key: 'structures', label: 'Fee Structures', show: canSeeAdmin },
    { key: 'payments', label: 'Online Payments', show: canEdit },
  ]

  const tabs = allTabs.filter((t) => t.show)

  if (!schoolId) return <div className="text-center py-16 text-muted-foreground text-sm">No school assigned.</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Fee Management</h1>
        <p className="text-sm text-muted-foreground">
          {isStudent ? 'View and pay your school fees online.' : 'Manage fee structures, collect payments, and view reports.'}
        </p>
      </div>

      <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit flex-wrap">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cn(
              'px-4 py-1.5 rounded-md text-sm font-medium transition-colors',
              tab === key ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'my-fees' && (isStudent || isParent) && (
        user?.studentId
          ? <MyFeesTab schoolId={schoolId} studentId={user.studentId} />
          : <div className="text-center py-12 text-muted-foreground text-sm">Student profile not found. Contact your school.</div>
      )}
      {tab === 'summary' && canSeeAdmin && <SummaryTab schoolId={schoolId} />}
      {tab === 'due' && canSeeAdmin && <DueReportTab schoolId={schoolId} />}
      {tab === 'collect' && canSeeAdmin && <CollectFeeTab schoolId={schoolId} />}
      {tab === 'structures' && canSeeAdmin && <FeeStructuresTab schoolId={schoolId} canEdit={canEdit} />}
      {tab === 'payments' && canEdit && <OnlinePaymentsTab schoolId={schoolId} />}
    </div>
  )
}
