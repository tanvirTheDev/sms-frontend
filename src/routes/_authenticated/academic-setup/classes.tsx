import { createFileRoute, Link, useRouterState } from '@tanstack/react-router'
import { useState } from 'react'
import { BookOpen, Plus, Trash2, Loader2, Users, ChevronDown, ChevronRight, CalendarDays, FlaskConical, AlertTriangle, Layers } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import {
  useAcademicYears, useWings, useCreateWing,
  useClasses, useCreateClass, useDeleteClass,
  useCreateSection, useDeleteSection,
  useClassSubjects, useAssignSubject, useRemoveClassSubject, useSubjects,
} from '@/features/academic-setup/hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { SchoolClass, WingType, ShiftType } from '@/types/academic'

export const Route = createFileRoute('/_authenticated/academic-setup/classes')({
  component: ClassesPage,
})

const WING_OPTIONS: { value: WingType; label: string }[] = [
  { value: 'PRIMARY', label: 'Primary' },
  { value: 'SECONDARY', label: 'Secondary' },
  { value: 'HIGHER_SECONDARY', label: 'Higher Secondary' },
]

const SHIFT_OPTIONS: { value: ShiftType; label: string }[] = [
  { value: 'MORNING', label: 'Morning' },
  { value: 'DAY', label: 'Day' },
]

const WING_COLORS: Record<WingType, string> = {
  PRIMARY: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  SECONDARY: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  HIGHER_SECONDARY: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
}

function SubNav() {
  const { location } = useRouterState()
  const items = [
    { to: '/academic-setup', label: 'Academic Years', icon: CalendarDays },
    { to: '/academic-setup/wings', label: 'Wings', icon: Layers },
    { to: '/academic-setup/classes', label: 'Classes & Sections', icon: BookOpen },
    { to: '/academic-setup/subjects', label: 'Subjects', icon: FlaskConical },
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
                active
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
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

function SectionRow({
  section, schoolId, classId,
}: {
  section: { id: string; name: string; capacity: number; _count: { students: number } }
  schoolId: string
  classId: string
}) {
  const { mutate: deleteSection, isPending } = useDeleteSection(schoolId, classId)
  const [confirming, setConfirming] = useState(false)

  return (
    <div className="flex items-center justify-between py-1.5 px-3 rounded-md bg-muted/40 text-sm">
      <div className="flex items-center gap-3">
        <span className="font-medium">Section {section.name}</span>
        <span className="text-xs text-muted-foreground">
          <Users className="h-3 w-3 inline mr-0.5" />
          {section._count.students}/{section.capacity}
        </span>
      </div>
      {confirming ? (
        <div className="flex items-center gap-1">
          <span className="text-xs text-destructive">Delete?</span>
          <Button
            variant="destructive" size="icon" className="h-6 w-6"
            disabled={isPending}
            onClick={() => deleteSection(section.id, { onSuccess: () => setConfirming(false) })}
          >
            {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : '✓'}
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setConfirming(false)}>
            ✕
          </Button>
        </div>
      ) : (
        <Button
          variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive"
          onClick={() => setConfirming(true)}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      )}
    </div>
  )
}

function AddSectionInline({ schoolId, classId }: { schoolId: string; classId: string }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [capacity, setCapacity] = useState('50')
  const { mutate, isPending } = useCreateSection(schoolId, classId)

  if (!open) {
    return (
      <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setOpen(true)}>
        <Plus className="h-3 w-3 mr-1" /> Add Section
      </Button>
    )
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Input
        placeholder="A"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="h-7 w-16 text-xs"
        autoFocus
      />
      <Input
        type="number"
        placeholder="Capacity"
        value={capacity}
        onChange={(e) => setCapacity(e.target.value)}
        className="h-7 w-24 text-xs"
      />
      <Button
        size="sm" className="h-7 text-xs" disabled={isPending || !name.trim()}
        onClick={() => {
          mutate({ name: name.trim(), capacity: parseInt(capacity) || 50 }, {
            onSuccess: () => { setName(''); setOpen(false) },
          })
        }}
      >
        {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Add'}
      </Button>
      <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setOpen(false)}>
        Cancel
      </Button>
    </div>
  )
}

function SubjectPanel({ schoolId, classId, wingType }: {
  schoolId: string
  classId: string
  wingType: WingType
}) {
  const { data: assigned = [], isLoading } = useClassSubjects(schoolId, classId)
  const { data: allSubjects = [] } = useSubjects(schoolId, { wing: wingType })
  const { mutate: assign, isPending: assigning } = useAssignSubject(schoolId, classId)
  const { mutate: remove } = useRemoveClassSubject(schoolId, classId)
  const [selectedSubjectId, setSelectedSubjectId] = useState('')
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null)

  const assignedIds = new Set(assigned.map((a) => a.subject.id))
  const available = allSubjects.filter((s) => !assignedIds.has(s.id))

  return (
    <div className="space-y-2">
      {isLoading && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" /> Loading...
        </div>
      )}
      {!isLoading && assigned.length === 0 && (
        <p className="text-xs text-muted-foreground">No subjects assigned yet.</p>
      )}
      {assigned.map((cs) => (
        <div key={cs.id} className="flex items-center justify-between py-1.5 px-3 rounded-md bg-muted/40 text-sm">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <span className="font-medium">{cs.subject.name}</span>
            {cs.subject.nameBn && <span className="text-xs text-muted-foreground">{cs.subject.nameBn}</span>}
            {cs.subject.code && (
              <Badge variant="outline" className="text-[10px] h-4 px-1">{cs.subject.code}</Badge>
            )}
            {cs.subject.isOptional && (
              <Badge variant="secondary" className="text-[10px] h-4 px-1">Optional</Badge>
            )}
            <span className="text-xs text-muted-foreground">
              {cs.subject.theoryMarks != null && cs.subject.practicalMarks != null
                ? `T:${cs.subject.theoryMarks} P:${cs.subject.practicalMarks}`
                : `${cs.subject.fullMarks} marks`}
              {' · '}Pass: {cs.subject.passMarks}
            </span>
          </div>
          {confirmRemove === cs.id ? (
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-xs text-destructive">Remove?</span>
              <Button
                variant="destructive" size="icon" className="h-6 w-6"
                onClick={() => remove(cs.id, { onSuccess: () => setConfirmRemove(null) })}
              >✓</Button>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setConfirmRemove(null)}>✕</Button>
            </div>
          ) : (
            <Button
              variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive shrink-0"
              onClick={() => setConfirmRemove(cs.id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      ))}
      {available.length > 0 && (
        <div className="flex items-center gap-2 pt-1">
          <select
            className="h-7 rounded-md border border-input bg-background px-2 py-1 text-xs flex-1 max-w-xs"
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
          >
            <option value="">Select subject to assign...</option>
            {available.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}{s.code ? ` (${s.code})` : ''}
              </option>
            ))}
          </select>
          <Button
            size="sm" className="h-7 text-xs"
            disabled={!selectedSubjectId || assigning}
            onClick={() => assign({ subjectId: selectedSubjectId }, { onSuccess: () => setSelectedSubjectId('') })}
          >
            {assigning ? <Loader2 className="h-3 w-3 animate-spin" /> : <><Plus className="h-3 w-3 mr-1" />Assign</>}
          </Button>
        </div>
      )}
      {!isLoading && available.length === 0 && assigned.length > 0 && (
        <p className="text-xs text-muted-foreground">All available subjects assigned.</p>
      )}
    </div>
  )
}

function ClassCard({ cls, schoolId }: { cls: SchoolClass; schoolId: string }) {
  const [expanded, setExpanded] = useState(true)
  const [activeTab, setActiveTab] = useState<'sections' | 'subjects'>('sections')
  const [confirming, setConfirming] = useState(false)
  const { mutate: deleteClass, isPending: deleting } = useDeleteClass(schoolId)

  const wingLabel = cls.schoolWing.wing.replace(/_/g, ' ')
  const shiftLabel = cls.schoolWing.shift ? ` · ${cls.schoolWing.shift}` : ''

  return (
    <Card>
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          {expanded
            ? <ChevronDown className="h-4 w-4 text-muted-foreground" />
            : <ChevronRight className="h-4 w-4 text-muted-foreground" />
          }
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm">{cls.name}</span>
              <Badge variant="outline" className={cn('text-[10px] h-4 px-1.5', WING_COLORS[cls.schoolWing.wing])}>
                {wingLabel}{shiftLabel}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {cls.sections.length} section{cls.sections.length !== 1 ? 's' : ''}
              {' · '}
              {cls.sections.reduce((sum, s) => sum + s._count.students, 0)} students
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {confirming ? (
            <div className="flex items-center gap-1">
              <span className="text-xs text-destructive">Delete class?</span>
              <Button
                variant="destructive" size="sm" className="h-7 text-xs" disabled={deleting}
                onClick={() => deleteClass(cls.id, { onSuccess: () => setConfirming(false) })}
              >
                {deleting ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Yes'}
              </Button>
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setConfirming(false)}>
                No
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={() => setConfirming(true)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {expanded && (
        <CardContent className="px-4 pb-4 pt-0">
          <div className="h-px bg-border mb-3" />
          <div className="flex gap-1 mb-3">
            {(['sections', 'subjects'] as const).map((tab) => (
              <button
                key={tab}
                className={cn(
                  'px-3 py-1 text-xs rounded-md font-medium transition-colors capitalize',
                  activeTab === tab
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            {activeTab === 'sections' && (
              <>
                {cls.sections.length === 0 && (
                  <p className="text-xs text-muted-foreground">No sections yet. Add at least one section.</p>
                )}
                {cls.sections.map((section) => (
                  <SectionRow key={section.id} section={section} schoolId={schoolId} classId={cls.id} />
                ))}
                <AddSectionInline schoolId={schoolId} classId={cls.id} />
              </>
            )}
            {activeTab === 'subjects' && (
              <SubjectPanel schoolId={schoolId} classId={cls.id} wingType={cls.schoolWing.wing} />
            )}
          </div>
        </CardContent>
      )}
    </Card>
  )
}

function AddClassForm({
  schoolId,
  onClose,
}: {
  schoolId: string
  onClose: () => void
}) {
  const { data: years = [] } = useAcademicYears(schoolId)
  const { data: wings = [] } = useWings(schoolId)
  const { mutate: create, isPending } = useCreateClass(schoolId)

  const [name, setName] = useState('')
  const [orderIndex, setOrderIndex] = useState('1')
  const [academicYearId, setAcademicYearId] = useState(years.find((y) => y.isCurrent)?.id ?? years[0]?.id ?? '')
  const [schoolWingId, setSchoolWingId] = useState(wings[0]?.id ?? '')

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardContent className="p-4 space-y-3">
        <p className="text-sm font-semibold">Add New Class</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Class Name</Label>
            <Input placeholder="Class 9" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Order</Label>
            <Input type="number" min="1" value={orderIndex} onChange={(e) => setOrderIndex(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Academic Year</Label>
            <select
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
              value={academicYearId}
              onChange={(e) => setAcademicYearId(e.target.value)}
            >
              {years.map((y) => (
                <option key={y.id} value={y.id}>{y.name} {y.isCurrent ? '(current)' : ''}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Wing</Label>
            <select
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
              value={schoolWingId}
              onChange={(e) => setSchoolWingId(e.target.value)}
            >
              {wings.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.wing.replace(/_/g, ' ')}{w.shift ? ` (${w.shift})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            disabled={isPending || !name.trim() || !academicYearId || !schoolWingId}
            onClick={() => {
              create({
                name: name.trim(),
                orderIndex: parseInt(orderIndex) || 1,
                academicYearId,
                schoolWingId,
              }, { onSuccess: onClose })
            }}
          >
            {isPending && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
            Create Class
          </Button>
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
        </div>
      </CardContent>
    </Card>
  )
}

function WingSetupCard({ schoolId }: { schoolId: string }) {
  const [wing, setWing] = useState<WingType>('SECONDARY')
  const [shift, setShift] = useState<ShiftType | ''>('')
  const { mutate: createWing, isPending } = useCreateWing(schoolId)

  return (
    <Card className="border-amber-300 bg-amber-50 dark:bg-amber-950/20">
      <CardContent className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">No wings configured</p>
            <p className="text-xs text-amber-700 dark:text-amber-400">Create at least one wing before adding classes.</p>
          </div>
        </div>
        <div className="flex items-end gap-3 flex-wrap">
          <div className="space-y-1">
            <Label className="text-xs">Wing</Label>
            <select
              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
              value={wing}
              onChange={(e) => setWing(e.target.value as WingType)}
            >
              {WING_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Shift (optional)</Label>
            <select
              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
              value={shift}
              onChange={(e) => setShift(e.target.value as ShiftType | '')}
            >
              <option value="">No shift</option>
              {SHIFT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <Button
            size="sm" disabled={isPending}
            onClick={() => createWing({ wing, shift: shift || undefined })}
          >
            {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5 mr-1" />}
            Add Wing
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function ClassesPage() {
  const { user } = useAuthStore()
  const schoolId = user?.schoolId ?? null
  const [showAddClass, setShowAddClass] = useState(false)
  const [filterYearId, setFilterYearId] = useState<string>('')
  const [filterWingId, setFilterWingId] = useState<string>('')

  const { data: years = [] } = useAcademicYears(schoolId)
  const { data: wings = [] } = useWings(schoolId)
  const { data: classes = [], isLoading } = useClasses(schoolId, {
    academicYearId: filterYearId || undefined,
    wingId: filterWingId || undefined,
  })

  const hasWings = wings.length > 0
  const hasYears = years.length > 0

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Academic Setup</h1>
        <p className="text-sm text-muted-foreground">Configure academic years, classes, sections, and subjects.</p>
      </div>

      <SubNav />

      {/* Wings quick-add if none */}
      {!hasWings && <WingSetupCard schoolId={schoolId ?? ''} />}

      {hasWings && (
        <>
          {/* Filters + Add Class */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Label className="text-xs whitespace-nowrap">Year:</Label>
              <select
                className="h-8 rounded-md border border-input bg-background px-2 py-1 text-xs"
                value={filterYearId}
                onChange={(e) => setFilterYearId(e.target.value)}
              >
                <option value="">All years</option>
                {years.map((y) => (
                  <option key={y.id} value={y.id}>{y.name}{y.isCurrent ? ' ★' : ''}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-xs whitespace-nowrap">Wing:</Label>
              <select
                className="h-8 rounded-md border border-input bg-background px-2 py-1 text-xs"
                value={filterWingId}
                onChange={(e) => setFilterWingId(e.target.value)}
              >
                <option value="">All wings</option>
                {wings.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.wing.replace(/_/g, ' ')}{w.shift ? ` (${w.shift})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div className="ml-auto">
              <Button
                size="sm"
                disabled={!hasYears}
                onClick={() => setShowAddClass(!showAddClass)}
              >
                <Plus className="h-4 w-4 mr-1.5" /> Add Class
              </Button>
            </div>
          </div>

          {!hasYears && (
            <p className="text-sm text-muted-foreground">
              <Link to="/academic-setup" className="text-primary underline">Create an academic year</Link> first.
            </p>
          )}

          {showAddClass && (
            <AddClassForm schoolId={schoolId ?? ''} onClose={() => setShowAddClass(false)} />
          )}

          {isLoading && (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading...
            </div>
          )}

          {!isLoading && classes.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No classes yet</p>
                <p className="text-xs mt-1">Add a class to start organizing students into sections.</p>
              </CardContent>
            </Card>
          )}

          <div className="space-y-3">
            {classes.map((cls) => (
              <ClassCard key={cls.id} cls={cls} schoolId={schoolId ?? ''} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
