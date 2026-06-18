import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import {
  Search, Plus, Pencil, Trash2, Save, X, Loader2,
  Phone, Shield, ShieldCheck, User, ChevronDown, ChevronUp,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { studentsApi } from '@/api/students'
import {
  useGuardians, useCreateGuardian, useUpdateGuardian, useDeleteGuardian,
} from '@/features/guardian/hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { StudentListItem } from '@/types/student'
import type { Guardian, GuardianRelation, CreateGuardianPayload } from '@/types/guardian'

export const Route = createFileRoute('/_authenticated/guardians/')({
  component: GuardiansPage,
})

const RELATIONS: { value: GuardianRelation; label: string }[] = [
  { value: 'FATHER', label: 'Father' },
  { value: 'MOTHER', label: 'Mother' },
  { value: 'GRANDFATHER', label: 'Grandfather' },
  { value: 'GRANDMOTHER', label: 'Grandmother' },
  { value: 'UNCLE', label: 'Uncle' },
  { value: 'AUNT', label: 'Aunt' },
  { value: 'ELDER_SIBLING', label: 'Elder Sibling' },
  { value: 'LOCAL_GUARDIAN', label: 'Local Guardian' },
  { value: 'OTHER', label: 'Other' },
]

const RELATION_COLORS: Record<GuardianRelation, string> = {
  FATHER: 'bg-blue-100 text-blue-700',
  MOTHER: 'bg-pink-100 text-pink-700',
  GRANDFATHER: 'bg-violet-100 text-violet-700',
  GRANDMOTHER: 'bg-purple-100 text-purple-700',
  UNCLE: 'bg-amber-100 text-amber-700',
  AUNT: 'bg-orange-100 text-orange-700',
  ELDER_SIBLING: 'bg-teal-100 text-teal-700',
  LOCAL_GUARDIAN: 'bg-cyan-100 text-cyan-700',
  OTHER: 'bg-gray-100 text-gray-600',
}

const emptyForm = (): CreateGuardianPayload => ({
  relation: 'FATHER', name: '', nameBn: '', nid: '',
  phone: '', occupation: '', education: '', monthlyIncome: undefined, isEmergency: false,
})

// ── Guardian Form ─────────────────────────────────────────────────

interface GuardianFormProps {
  schoolId: string
  studentId: string
  editing: Guardian | null
  onCancel: () => void
}

function GuardianForm({ schoolId, studentId, editing, onCancel }: GuardianFormProps) {
  const [form, setForm] = useState<CreateGuardianPayload>(emptyForm)

  useEffect(() => {
    if (editing) {
      setForm({
        relation: editing.relation,
        name: editing.name,
        nameBn: editing.nameBn ?? '',
        nid: editing.nid ?? '',
        phone: editing.phone,
        occupation: editing.occupation ?? '',
        education: editing.education ?? '',
        monthlyIncome: editing.monthlyIncome ?? undefined,
        isEmergency: editing.isEmergency,
      })
    } else {
      setForm(emptyForm())
    }
  }, [editing])

  const { mutate: create, isPending: creating } = useCreateGuardian(schoolId, studentId)
  const { mutate: update, isPending: updating } = useUpdateGuardian(schoolId, studentId, editing?.id ?? '')

  const f = (k: keyof CreateGuardianPayload) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [k]: e.target.value }))

  const handleSubmit = () => {
    const payload: CreateGuardianPayload = {
      relation: form.relation,
      name: form.name.trim(),
      nameBn: form.nameBn?.trim() || undefined,
      nid: form.nid?.trim() || undefined,
      phone: form.phone.trim(),
      occupation: form.occupation?.trim() || undefined,
      education: form.education?.trim() || undefined,
      monthlyIncome: form.monthlyIncome ? Number(form.monthlyIncome) : undefined,
      isEmergency: form.isEmergency,
    }
    if (editing) update(payload, { onSuccess: onCancel })
    else create(payload, { onSuccess: onCancel })
  }

  const isPending = creating || updating
  const valid = form.name.trim().length >= 2 && form.phone.trim().length >= 10

  return (
    <Card className="border-primary/30 bg-muted/20">
      <CardContent className="p-4 space-y-3">
        <h4 className="text-sm font-semibold">{editing ? 'Edit Guardian' : 'Add Guardian'}</h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-medium">Relation *</label>
            <select className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              value={form.relation} onChange={(e) => setForm((p) => ({ ...p, relation: e.target.value as GuardianRelation }))}>
              {RELATIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium">Name (English) *</label>
            <Input className="mt-1 h-9" placeholder="Full name" value={form.name} onChange={f('name')} />
          </div>
          <div>
            <label className="text-xs font-medium">Name (Bengali)</label>
            <Input className="mt-1 h-9" placeholder="বাংলা নাম" value={form.nameBn ?? ''} onChange={f('nameBn')} />
          </div>
          <div>
            <label className="text-xs font-medium">Phone *</label>
            <Input className="mt-1 h-9" placeholder="01XXXXXXXXX" value={form.phone} onChange={f('phone')} />
          </div>
          <div>
            <label className="text-xs font-medium">NID</label>
            <Input className="mt-1 h-9" placeholder="10/13/17 digits" value={form.nid ?? ''} onChange={f('nid')} />
          </div>
          <div>
            <label className="text-xs font-medium">Occupation</label>
            <Input className="mt-1 h-9" placeholder="e.g. Farmer, Teacher" value={form.occupation ?? ''} onChange={f('occupation')} />
          </div>
          <div>
            <label className="text-xs font-medium">Education</label>
            <Input className="mt-1 h-9" placeholder="e.g. HSC, Graduate" value={form.education ?? ''} onChange={f('education')} />
          </div>
          <div>
            <label className="text-xs font-medium">Monthly Income (BDT)</label>
            <Input className="mt-1 h-9" type="number" min={0} placeholder="0"
              value={form.monthlyIncome ?? ''}
              onChange={(e) => setForm((p) => ({ ...p, monthlyIncome: e.target.value ? Number(e.target.value) : undefined }))} />
          </div>
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.isEmergency}
                onChange={(e) => setForm((p) => ({ ...p, isEmergency: e.target.checked }))} />
              Emergency contact
            </label>
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <Button size="sm" disabled={isPending || !valid} onClick={handleSubmit}>
            {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Save className="h-3.5 w-3.5 mr-1" />}
            {editing ? 'Save' : 'Add Guardian'}
          </Button>
          <Button size="sm" variant="outline" onClick={onCancel}>Cancel</Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ── Guardian Card ─────────────────────────────────────────────────

interface GuardianCardProps {
  guardian: Guardian
  canWrite: boolean
  onEdit: (g: Guardian) => void
  onDelete: (id: string) => void
}

function GuardianCard({ guardian: g, canWrite, onEdit, onDelete }: GuardianCardProps) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded', RELATION_COLORS[g.relation])}>
            {RELATIONS.find((r) => r.value === g.relation)?.label ?? g.relation}
          </span>
          {g.isEmergency && (
            <span className="flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-red-100 text-red-700">
              <ShieldCheck className="h-2.5 w-2.5" /> Emergency
            </span>
          )}
          {g.parent && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-green-100 text-green-700">
              Portal access
            </span>
          )}
        </div>
        <p className="font-medium text-sm">{g.name}{g.nameBn && <span className="ml-1.5 text-muted-foreground font-normal">{g.nameBn}</span>}</p>
        <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{g.phone}</span>
          {g.occupation && <span>{g.occupation}</span>}
          {g.education && <span>{g.education}</span>}
          {g.monthlyIncome != null && <span>৳{g.monthlyIncome.toLocaleString()}/mo</span>}
          {g.nid && <span>NID: {g.nid}</span>}
        </div>
      </div>
      {canWrite && (
        <div className="flex gap-1 shrink-0">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(g)}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => onDelete(g.id)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  )
}

// ── Student Guardian Panel ────────────────────────────────────────

interface StudentPanelProps {
  schoolId: string
  student: StudentListItem
  canWrite: boolean
}

function StudentGuardianPanel({ schoolId, student, canWrite }: StudentPanelProps) {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Guardian | null>(null)

  const { data: guardians = [], isLoading } = useGuardians(schoolId, student.id)
  const { mutate: del } = useDeleteGuardian(schoolId, student.id)

  const openAdd = () => { setEditing(null); setShowForm(true) }
  const openEdit = (g: Guardian) => { setEditing(g); setShowForm(true) }
  const closeForm = () => { setShowForm(false); setEditing(null) }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-sm">{student.name}{student.nameBn && <span className="ml-1.5 text-muted-foreground font-normal text-sm">{student.nameBn}</span>}</p>
          <p className="text-xs text-muted-foreground">
            ID: {student.studentId}
            {student.section && ` · ${student.section.class.name} — Section ${student.section.name}`}
          </p>
        </div>
        {canWrite && !showForm && (
          <Button size="sm" onClick={openAdd}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Guardian
          </Button>
        )}
      </div>

      {showForm && (
        <GuardianForm schoolId={schoolId} studentId={student.id} editing={editing} onCancel={closeForm} />
      )}

      {isLoading && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>}

      {!isLoading && guardians.length === 0 && !showForm && (
        <p className="text-sm text-muted-foreground text-center py-4">No guardians on record.</p>
      )}

      <div className="space-y-2">
        {guardians.map((g) => (
          <GuardianCard key={g.id} guardian={g} canWrite={canWrite} onEdit={openEdit} onDelete={(id) => del(id)} />
        ))}
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────

function GuardiansPage() {
  const { user } = useAuthStore()
  const schoolId = user?.schoolId ?? ''
  const role = user?.role ?? ''
  const canWrite = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'OFFICE_STAFF'].includes(role)

  const [search, setSearch] = useState('')
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState<StudentListItem[]>([])
  const [selected, setSelected] = useState<StudentListItem | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!search.trim() || !schoolId) { setResults([]); setShowDropdown(false); return }
    const t = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await studentsApi.list(schoolId, { search: search.trim(), limit: 10 })
        setResults(res.data.data ?? [])
        setShowDropdown(true)
      } catch { setResults([]) } finally { setSearching(false) }
    }, 350)
    return () => clearTimeout(t)
  }, [search, schoolId])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowDropdown(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const pickStudent = (s: StudentListItem) => {
    setSelected(s)
    setSearch(s.name)
    setShowDropdown(false)
  }

  const clearStudent = () => {
    setSelected(null)
    setSearch('')
    setResults([])
  }

  if (!schoolId) return <div className="text-center py-16 text-muted-foreground text-sm">No school assigned.</div>

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Guardian Management</h1>
        <p className="text-sm text-muted-foreground">Search a student to view or manage their guardians.</p>
      </div>

      {/* Student Search */}
      <div ref={searchRef} className="relative max-w-md">
        <label className="text-sm font-medium block mb-1.5">Search Student</label>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          {searching && <Loader2 className="absolute right-2.5 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />}
          {selected && !searching && (
            <button className="absolute right-2.5 top-2 p-0.5 rounded hover:bg-muted" onClick={clearStudent}>
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
          <Input
            className="pl-9 h-10"
            placeholder="Type name or student ID…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); if (selected) setSelected(null) }}
            onFocus={() => results.length > 0 && setShowDropdown(true)}
          />
        </div>

        {showDropdown && results.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md max-h-60 overflow-y-auto">
            {results.map((s) => (
              <button key={s.id}
                className="w-full text-left px-3 py-2.5 hover:bg-muted text-sm flex items-start gap-2 border-b last:border-0"
                onClick={() => pickStudent(s)}
              >
                <User className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground" />
                <div>
                  <p className="font-medium">{s.name}{s.nameBn && <span className="ml-1.5 text-muted-foreground text-xs">{s.nameBn}</span>}</p>
                  <p className="text-xs text-muted-foreground">
                    {s.studentId}
                    {s.section && ` · ${s.section.class.name} — ${s.section.name}`}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}

        {showDropdown && !searching && results.length === 0 && search.length >= 2 && (
          <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md px-3 py-4 text-sm text-muted-foreground text-center">
            No students found.
          </div>
        )}
      </div>

      {/* Guardian Panel */}
      {selected && (
        <Card>
          <CardContent className="p-4">
            <StudentGuardianPanel schoolId={schoolId} student={selected} canWrite={canWrite} />
          </CardContent>
        </Card>
      )}

      {!selected && (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
          <Shield className="h-10 w-10 opacity-20" />
          <p className="text-sm">Search and select a student to manage guardians.</p>
        </div>
      )}
    </div>
  )
}
