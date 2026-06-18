import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import {
  Plus, Loader2, Search, Pencil, X, Save,
  CheckCircle, Clock, TrendingUp, User,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useAcademicYears } from '@/features/academic-setup/hooks'
import { staffApi } from '@/api/staff'
import { useSalaryRecords, useCreateSalaryRecord, useUpdateSalaryRecord } from '@/features/salary/hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { SalaryRecord, SalaryPaymentMethod, CreateSalaryPayload } from '@/types/salary'

export const Route = createFileRoute('/_authenticated/salary/')({
  component: SalaryPage,
})

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const PAYMENT_METHODS: { value: SalaryPaymentMethod; label: string }[] = [
  { value: 'CASH', label: 'Cash' },
  { value: 'BKASH', label: 'bKash' },
  { value: 'NAGAD', label: 'Nagad' },
  { value: 'ROCKET', label: 'Rocket' },
  { value: 'UPAY', label: 'Upay' },
  { value: 'BANK', label: 'Bank Transfer' },
  { value: 'CHEQUE', label: 'Cheque' },
  { value: 'MFS', label: 'MFS' },
]

function BDT(val: number) {
  return '৳' + val.toLocaleString('en-BD')
}

const emptyForm = (): CreateSalaryPayload => ({
  staffId: '', academicYearId: '', month: new Date().getMonth() + 1,
  year: new Date().getFullYear(), isMPOEligible: false,
  mpoAmount: 0, schoolAmount: 0, bonus: 0, deduction: 0,
  netAmount: 0, isPaid: false, paymentMethod: undefined, note: '',
})

// ── Salary Form ───────────────────────────────────────────────

interface FormProps {
  schoolId: string
  editing: SalaryRecord | null
  staffNameMap: Record<string, string>
  onClose: () => void
}

function SalaryForm({ schoolId, editing, staffNameMap, onClose }: FormProps) {
  const { data: academicYears = [] } = useAcademicYears(schoolId)
  const [form, setForm] = useState<CreateSalaryPayload>(emptyForm)
  const [staffSearch, setStaffSearch] = useState('')
  const [staffResults, setStaffResults] = useState<{ id: string; name: string; designation: string }[]>([])
  const [staffSearching, setStaffSearching] = useState(false)
  const [showStaffDrop, setShowStaffDrop] = useState(false)

  const { mutate: create, isPending: creating } = useCreateSalaryRecord(schoolId)
  const { mutate: update, isPending: updating } = useUpdateSalaryRecord(schoolId, editing?.id ?? '')

  useEffect(() => {
    if (editing) {
      setForm({
        staffId: editing.staffId, academicYearId: '',
        month: editing.month, year: editing.year,
        isMPOEligible: editing.isMPOEligible,
        mpoAmount: editing.mpoAmount, schoolAmount: editing.schoolAmount,
        bonus: editing.bonus, deduction: editing.deduction,
        netAmount: editing.netAmount, isPaid: editing.isPaid,
        paymentMethod: editing.paymentMethod ?? undefined, note: editing.note ?? '',
      })
      setStaffSearch(staffNameMap[editing.staffId] ?? editing.staffId)
    }
  }, [editing])

  // Auto-calc net
  useEffect(() => {
    const net = (form.mpoAmount ?? 0) + (form.schoolAmount ?? 0) + (form.bonus ?? 0) - (form.deduction ?? 0)
    setForm((f) => ({ ...f, netAmount: Math.max(0, net) }))
  }, [form.mpoAmount, form.schoolAmount, form.bonus, form.deduction])

  // Staff search
  useEffect(() => {
    if (!staffSearch.trim() || staffSearch.trim().length < 2) { setStaffResults([]); setShowStaffDrop(false); return }
    const t = setTimeout(async () => {
      setStaffSearching(true)
      try {
        const res = await staffApi.list(schoolId, { search: staffSearch.trim(), limit: 8, isActive: true })
        const items = (res.data.data ?? []).map((s: any) => ({ id: s.id, name: s.name, designation: s.designation }))
        setStaffResults(items); setShowStaffDrop(true)
      } catch { setStaffResults([]) } finally { setStaffSearching(false) }
    }, 350)
    return () => clearTimeout(t)
  }, [staffSearch, schoolId])

  const num = (k: keyof CreateSalaryPayload) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: parseFloat(e.target.value) || 0 }))

  const handleSubmit = () => {
    const payload = { ...form, note: form.note?.trim() || undefined, paymentMethod: form.paymentMethod || undefined }
    if (editing) update(payload, { onSuccess: onClose })
    else create(payload, { onSuccess: onClose })
  }

  const valid = form.staffId && (editing || form.academicYearId) && form.month && form.year

  return (
    <Card className="border-primary/30">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">{editing ? 'Edit' : 'New'} Salary Record</h3>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}><X className="h-3.5 w-3.5" /></Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {/* Staff search */}
          <div className="relative">
            <label className="text-xs font-medium">Staff *</label>
            <div className="relative mt-1">
              <Input className="h-9 pr-8" placeholder="Search staff…" value={staffSearch}
                onChange={(e) => { setStaffSearch(e.target.value); setForm((f) => ({ ...f, staffId: '' })) }}
                disabled={!!editing} />
              {staffSearching && <Loader2 className="absolute right-2 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />}
            </div>
            {showStaffDrop && staffResults.length > 0 && (
              <div className="absolute z-50 w-full mt-0.5 bg-popover border rounded-md shadow-md max-h-48 overflow-y-auto">
                {staffResults.map((s) => (
                  <button key={s.id} className="w-full text-left px-3 py-2 hover:bg-muted text-sm border-b last:border-0"
                    onClick={() => { setForm((f) => ({ ...f, staffId: s.id })); setStaffSearch(s.name); setShowStaffDrop(false) }}>
                    <p className="font-medium">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.designation}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {!editing && (
            <div>
              <label className="text-xs font-medium">Academic Year *</label>
              <select className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                value={form.academicYearId} onChange={(e) => setForm((f) => ({ ...f, academicYearId: e.target.value }))}>
                <option value="">Select</option>
                {academicYears.map((y: any) => <option key={y.id} value={y.id}>{y.name}</option>)}
              </select>
            </div>
          )}

          <div>
            <label className="text-xs font-medium">Month *</label>
            <select className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              value={form.month} onChange={(e) => setForm((f) => ({ ...f, month: Number(e.target.value) }))}>
              {MONTHS.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium">Year *</label>
            <Input className="mt-1 h-9" type="number" min={2020} max={2099}
              value={form.year} onChange={(e) => setForm((f) => ({ ...f, year: Number(e.target.value) }))} />
          </div>

          <div>
            <label className="text-xs font-medium">MPO Amount (৳)</label>
            <Input className="mt-1 h-9" type="number" min={0} value={form.mpoAmount ?? 0} onChange={num('mpoAmount')} />
          </div>

          <div>
            <label className="text-xs font-medium">School Amount (৳)</label>
            <Input className="mt-1 h-9" type="number" min={0} value={form.schoolAmount ?? 0} onChange={num('schoolAmount')} />
          </div>

          <div>
            <label className="text-xs font-medium">Bonus (৳)</label>
            <Input className="mt-1 h-9" type="number" min={0} value={form.bonus ?? 0} onChange={num('bonus')} />
          </div>

          <div>
            <label className="text-xs font-medium">Deduction (৳)</label>
            <Input className="mt-1 h-9" type="number" min={0} value={form.deduction ?? 0} onChange={num('deduction')} />
          </div>

          <div>
            <label className="text-xs font-medium">Net Amount (৳)</label>
            <Input className="mt-1 h-9 bg-muted font-semibold" readOnly value={form.netAmount} />
          </div>

          <div>
            <label className="text-xs font-medium">Payment Method</label>
            <select className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              value={form.paymentMethod ?? ''} onChange={(e) => setForm((f) => ({ ...f, paymentMethod: e.target.value as SalaryPaymentMethod || undefined }))}>
              <option value="">None</option>
              {PAYMENT_METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium">Note</label>
            <Input className="mt-1 h-9" placeholder="Optional note" value={form.note ?? ''} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} />
          </div>
        </div>

        <div className="flex items-center gap-4 pt-1">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={form.isMPOEligible} onChange={(e) => setForm((f) => ({ ...f, isMPOEligible: e.target.checked }))} />
            MPO Eligible
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={form.isPaid} onChange={(e) => setForm((f) => ({ ...f, isPaid: e.target.checked }))} />
            Mark as Paid
          </label>
        </div>

        <div className="flex gap-2 pt-1">
          <Button size="sm" disabled={!valid || creating || updating} onClick={handleSubmit}>
            {(creating || updating) ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Save className="h-3.5 w-3.5 mr-1" />}
            {editing ? 'Save' : 'Create'}
          </Button>
          <Button size="sm" variant="outline" onClick={onClose}>Cancel</Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ── Main Page ─────────────────────────────────────────────────

function SalaryPage() {
  const { user } = useAuthStore()
  const schoolId = user?.schoolId ?? ''
  const role = user?.role ?? ''
  const canWrite = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'ACCOUNTANT'].includes(role)

  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1

  const [filterMonth, setFilterMonth] = useState<number | ''>('')
  const [filterYear, setFilterYear] = useState<number>(currentYear)
  const [filterPaid, setFilterPaid] = useState<'' | 'true' | 'false'>('')
  const [staffSearch, setStaffSearch] = useState('')
  const [filterStaffId, setFilterStaffId] = useState('')
  const [staffSearching, setStaffSearching] = useState(false)
  const [staffSuggestions, setStaffSuggestions] = useState<{ id: string; name: string }[]>([])
  const [showSug, setShowSug] = useState(false)

  const [showForm, setShowForm] = useState(false)
  const [editRecord, setEditRecord] = useState<SalaryRecord | null>(null)

  const { data: records = [], isLoading } = useSalaryRecords(schoolId || null, {
    month: filterMonth || undefined,
    year: filterYear || undefined,
    isPaid: filterPaid === '' ? undefined : filterPaid === 'true',
    staffId: filterStaffId || undefined,
  })

  // staff name map for display
  const staffNameMap: Record<string, string> = {}

  // Staff filter search
  useEffect(() => {
    if (!staffSearch.trim() || staffSearch.trim().length < 2) { setStaffSuggestions([]); setShowSug(false); return }
    const t = setTimeout(async () => {
      setStaffSearching(true)
      try {
        const res = await staffApi.list(schoolId, { search: staffSearch.trim(), limit: 6 })
        setStaffSuggestions((res.data.data ?? []).map((s: any) => ({ id: s.id, name: s.name })))
        setShowSug(true)
      } catch { } finally { setStaffSearching(false) }
    }, 350)
    return () => clearTimeout(t)
  }, [staffSearch, schoolId])

  const totalPaid = records.filter((r) => r.isPaid).reduce((s, r) => s + r.netAmount, 0)
  const totalPending = records.filter((r) => !r.isPaid).reduce((s, r) => s + r.netAmount, 0)

  if (!schoolId) return <div className="text-center py-16 text-muted-foreground text-sm">No school assigned.</div>

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Salary Management</h1>
          <p className="text-sm text-muted-foreground">Create and track staff salary records.</p>
        </div>
        {canWrite && !showForm && (
          <Button size="sm" onClick={() => { setEditRecord(null); setShowForm(true) }}>
            <Plus className="h-3.5 w-3.5 mr-1" /> New Record
          </Button>
        )}
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="p-3">
          <p className="text-xs text-muted-foreground">Total Records</p>
          <p className="text-2xl font-bold">{records.length}</p>
        </CardContent></Card>
        <Card><CardContent className="p-3">
          <p className="text-xs text-muted-foreground flex items-center gap-1"><CheckCircle className="h-3 w-3 text-green-500" />Paid</p>
          <p className="text-xl font-bold text-green-600">{BDT(totalPaid)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-3">
          <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3 text-amber-500" />Pending</p>
          <p className="text-xl font-bold text-amber-600">{BDT(totalPending)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-3">
          <p className="text-xs text-muted-foreground">Unpaid Count</p>
          <p className="text-2xl font-bold text-red-500">{records.filter((r) => !r.isPaid).length}</p>
        </CardContent></Card>
      </div>

      {showForm && (
        <SalaryForm
          schoolId={schoolId}
          editing={editRecord}
          staffNameMap={staffNameMap}
          onClose={() => { setShowForm(false); setEditRecord(null) }}
        />
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          {staffSearching && <Loader2 className="absolute right-2 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />}
          <Input className="pl-9 h-9 w-44" placeholder="Filter by staff…" value={staffSearch}
            onChange={(e) => { setStaffSearch(e.target.value); if (!e.target.value) setFilterStaffId('') }} />
          {showSug && staffSuggestions.length > 0 && (
            <div className="absolute z-50 w-48 mt-0.5 bg-popover border rounded-md shadow-md max-h-40 overflow-y-auto">
              {staffSuggestions.map((s) => (
                <button key={s.id} className="w-full text-left px-3 py-2 hover:bg-muted text-sm border-b last:border-0"
                  onClick={() => { setFilterStaffId(s.id); setStaffSearch(s.name); setShowSug(false) }}>
                  {s.name}
                </button>
              ))}
            </div>
          )}
        </div>
        <select className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          value={filterMonth} onChange={(e) => setFilterMonth(e.target.value ? Number(e.target.value) : '')}>
          <option value="">All Months</option>
          {MONTHS.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
        </select>
        <Input className="h-9 w-24" type="number" min={2020} max={2099} value={filterYear}
          onChange={(e) => setFilterYear(Number(e.target.value))} />
        <select className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          value={filterPaid} onChange={(e) => setFilterPaid(e.target.value as any)}>
          <option value="">All Status</option>
          <option value="true">Paid</option>
          <option value="false">Unpaid</option>
        </select>
      </div>

      {isLoading && <div className="flex items-center gap-2 text-sm text-muted-foreground py-8"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>}
      {!isLoading && records.length === 0 && <div className="text-center py-12 text-muted-foreground text-sm">No salary records found.</div>}

      {records.length > 0 && (
        <div className="rounded-md border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                {['Staff', 'Month/Year', 'MPO', 'School', 'Bonus', 'Deduction', 'Net', 'Method', 'Status', ''].map((h) => (
                  <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id} className="border-t hover:bg-muted/30">
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="font-medium">{r.staffId.slice(0, 8)}…</span>
                      {r.isMPOEligible && <span className="text-[9px] bg-blue-100 text-blue-700 px-1 rounded">MPO</span>}
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">{MONTHS[r.month - 1]} {r.year}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{BDT(r.mpoAmount)}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{BDT(r.schoolAmount)}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{BDT(r.bonus)}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-red-600">{r.deduction > 0 ? `-${BDT(r.deduction)}` : '—'}</td>
                  <td className="px-3 py-2 whitespace-nowrap font-semibold">{BDT(r.netAmount)}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-muted-foreground">{r.paymentMethod ?? '—'}</td>
                  <td className="px-3 py-2">
                    {r.isPaid ? (
                      <span className="flex items-center gap-1 text-green-700 text-xs font-medium">
                        <CheckCircle className="h-3 w-3" /> Paid
                        {r.paidAt && <span className="text-muted-foreground ml-1">{format(new Date(r.paidAt), 'dd/MM')}</span>}
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-amber-600 flex items-center gap-1"><Clock className="h-3 w-3" /> Pending</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {canWrite && (
                      <Button variant="ghost" size="icon" className="h-7 w-7"
                        onClick={() => { setEditRecord(r); setShowForm(true) }}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
