import { createFileRoute, Link, useRouterState } from '@tanstack/react-router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod/v4'
import { FlaskConical, Plus, Pencil, Trash2, Loader2, CalendarDays, BookOpen, X, Layers, TrendingUp } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useSubjects, useCreateSubject, useUpdateSubject, useDeleteSubject } from '@/features/academic-setup/hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { Subject, WingType, AcademicSubjectGroup } from '@/types/academic'

export const Route = createFileRoute('/_authenticated/academic-setup/subjects')({
  component: SubjectsPage,
})

const WING_OPTIONS: { value: WingType; label: string }[] = [
  { value: 'PRIMARY', label: 'Primary' },
  { value: 'SECONDARY', label: 'Secondary' },
  { value: 'HIGHER_SECONDARY', label: 'Higher Secondary' },
]

const GROUP_OPTIONS: { value: AcademicSubjectGroup; label: string }[] = [
  { value: 'NONE', label: 'General (No Group)' },
  { value: 'SCIENCE', label: 'Science' },
  { value: 'HUMANITIES', label: 'Humanities' },
  { value: 'COMMERCE', label: 'Commerce' },
]

const WING_COLORS: Record<WingType, string> = {
  PRIMARY: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  SECONDARY: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  HIGHER_SECONDARY: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
}

const GROUP_COLORS: Record<AcademicSubjectGroup, string> = {
  NONE: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  SCIENCE: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  HUMANITIES: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  COMMERCE: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
}

const subjectSchema = z.object({
  name: z.string().min(1, 'Name required'),
  nameBn: z.string().optional().or(z.literal('')),
  code: z.string().optional().or(z.literal('')),
  wing: z.enum(['PRIMARY', 'SECONDARY', 'HIGHER_SECONDARY']),
  subjectGroup: z.enum(['NONE', 'SCIENCE', 'HUMANITIES', 'COMMERCE']).optional(),
  isOptional: z.boolean().optional(),
  isCompulsory: z.boolean().optional(),
  fullMarks: z.coerce.number().int().min(1).max(200),
  passMarks: z.coerce.number().int().min(1),
  theoryMarks: z.coerce.number().int().min(0).optional().or(z.literal('')),
  practicalMarks: z.coerce.number().int().min(0).optional().or(z.literal('')),
  practicalPassMarks: z.coerce.number().int().min(0).optional().or(z.literal('')),
})
type SubjectFormData = z.infer<typeof subjectSchema>

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

function SubjectForm({
  defaultValues,
  onSubmit,
  onCancel,
  isPending,
  title,
}: {
  defaultValues?: Partial<SubjectFormData>
  onSubmit: (data: SubjectFormData) => void
  onCancel: () => void
  isPending: boolean
  title: string
}) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<SubjectFormData>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      wing: 'SECONDARY',
      subjectGroup: 'NONE',
      isOptional: false,
      isCompulsory: false,
      fullMarks: 100,
      passMarks: 33,
      ...defaultValues,
    },
  })

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">{title}</p>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="space-y-1 md:col-span-2">
              <Label className="text-xs">Subject Name (English) *</Label>
              <Input placeholder="Mathematics" {...register('name')} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label className="text-xs">Subject Name (Bengali)</Label>
              <Input placeholder="গণিত" {...register('nameBn')} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Code</Label>
              <Input placeholder="MATH" {...register('code')} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Wing *</Label>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                {...register('wing')}
              >
                {WING_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Subject Group</Label>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                {...register('subjectGroup')}
              >
                {GROUP_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Full Marks *</Label>
              <Input type="number" {...register('fullMarks')} />
              {errors.fullMarks && <p className="text-xs text-destructive">{errors.fullMarks.message}</p>}
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Pass Marks *</Label>
              <Input type="number" {...register('passMarks')} />
              {errors.passMarks && <p className="text-xs text-destructive">{errors.passMarks.message}</p>}
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Theory Marks</Label>
              <Input type="number" placeholder="0" {...register('theoryMarks')} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Practical Marks</Label>
              <Input type="number" placeholder="0" {...register('practicalMarks')} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Practical Pass</Label>
              <Input type="number" placeholder="0" {...register('practicalPassMarks')} />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" {...register('isCompulsory')} className="h-4 w-4" />
              Compulsory
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" {...register('isOptional')} className="h-4 w-4" />
              Optional
            </label>
          </div>

          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
              Save Subject
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

function SubjectCard({ subject, schoolId }: { subject: Subject; schoolId: string }) {
  const [editing, setEditing] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const { mutate: update, isPending: updating } = useUpdateSubject(schoolId)
  const { mutate: deleteSubject, isPending: deleting } = useDeleteSubject(schoolId)

  if (editing) {
    return (
      <SubjectForm
        title={`Edit: ${subject.name}`}
        defaultValues={{
          name: subject.name,
          nameBn: subject.nameBn ?? '',
          code: subject.code ?? '',
          wing: subject.wing,
          subjectGroup: subject.subjectGroup,
          isOptional: subject.isOptional,
          isCompulsory: subject.isCompulsory,
          fullMarks: subject.fullMarks,
          passMarks: subject.passMarks,
          theoryMarks: subject.theoryMarks ?? '',
          practicalMarks: subject.practicalMarks ?? '',
          practicalPassMarks: subject.practicalPassMarks ?? '',
        }}
        isPending={updating}
        onCancel={() => setEditing(false)}
        onSubmit={(data) => {
          const payload = {
            ...data,
            nameBn: data.nameBn || undefined,
            code: data.code || undefined,
            theoryMarks: data.theoryMarks ? Number(data.theoryMarks) : undefined,
            practicalMarks: data.practicalMarks ? Number(data.practicalMarks) : undefined,
            practicalPassMarks: data.practicalPassMarks ? Number(data.practicalPassMarks) : undefined,
          }
          update({ id: subject.id, payload }, { onSuccess: () => setEditing(false) })
        }}
      />
    )
  }

  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <p className="font-semibold text-sm">{subject.name}</p>
              {subject.nameBn && (
                <span className="text-xs text-muted-foreground">({subject.nameBn})</span>
              )}
              {subject.code && (
                <Badge variant="outline" className="text-[10px] h-4 px-1.5 font-mono">
                  {subject.code}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <Badge className={cn('text-[10px] h-4 px-1.5', WING_COLORS[subject.wing])}>
                {subject.wing.replace(/_/g, ' ')}
              </Badge>
              {subject.subjectGroup !== 'NONE' && (
                <Badge className={cn('text-[10px] h-4 px-1.5', GROUP_COLORS[subject.subjectGroup])}>
                  {subject.subjectGroup}
                </Badge>
              )}
              {subject.isCompulsory && (
                <Badge variant="outline" className="text-[10px] h-4 px-1.5 border-green-400 text-green-600">
                  Compulsory
                </Badge>
              )}
              {subject.isOptional && (
                <Badge variant="outline" className="text-[10px] h-4 px-1.5 border-amber-400 text-amber-600">
                  Optional
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">
              Full: {subject.fullMarks} · Pass: {subject.passMarks}
              {subject.theoryMarks != null && ` · Theory: ${subject.theoryMarks}`}
              {subject.practicalMarks != null && ` · Practical: ${subject.practicalMarks}`}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditing(true)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            {confirming ? (
              <div className="flex items-center gap-1">
                <Button
                  variant="destructive" size="icon" className="h-7 w-7" disabled={deleting}
                  onClick={() => deleteSubject(subject.id)}
                >
                  {deleting ? <Loader2 className="h-3 w-3 animate-spin" /> : '✓'}
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setConfirming(false)}>
                  <X className="h-3 w-3" />
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
      </CardContent>
    </Card>
  )
}

function SubjectsPage() {
  const { user } = useAuthStore()
  const schoolId = user?.schoolId ?? null
  const [showCreate, setShowCreate] = useState(false)
  const [filterWing, setFilterWing] = useState<WingType | ''>('')
  const [filterGroup, setFilterGroup] = useState<AcademicSubjectGroup | ''>('')

  const { data: subjects = [], isLoading } = useSubjects(schoolId, {
    wing: filterWing || undefined,
    subjectGroup: filterGroup || undefined,
  })
  const { mutate: create, isPending: creating } = useCreateSubject(schoolId ?? '')

  const grouped = subjects.reduce<Record<WingType, Subject[]>>((acc, s) => {
    if (!acc[s.wing]) acc[s.wing] = []
    acc[s.wing].push(s)
    return acc
  }, {} as Record<WingType, Subject[]>)

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Academic Setup</h1>
        <p className="text-sm text-muted-foreground">Configure academic years, classes, sections, and subjects.</p>
      </div>

      <SubNav />

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Label className="text-xs whitespace-nowrap">Wing:</Label>
          <select
            className="h-8 rounded-md border border-input bg-background px-2 py-1 text-xs"
            value={filterWing}
            onChange={(e) => setFilterWing(e.target.value as WingType | '')}
          >
            <option value="">All wings</option>
            {WING_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-xs whitespace-nowrap">Group:</Label>
          <select
            className="h-8 rounded-md border border-input bg-background px-2 py-1 text-xs"
            value={filterGroup}
            onChange={(e) => setFilterGroup(e.target.value as AcademicSubjectGroup | '')}
          >
            <option value="">All groups</option>
            {GROUP_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div className="ml-auto">
          <Button size="sm" onClick={() => setShowCreate(!showCreate)}>
            <Plus className="h-4 w-4 mr-1.5" /> Add Subject
          </Button>
        </div>
      </div>

      {showCreate && (
        <SubjectForm
          title="New Subject"
          isPending={creating}
          onCancel={() => setShowCreate(false)}
          onSubmit={(data) => {
            const payload = {
              ...data,
              nameBn: data.nameBn || undefined,
              code: data.code || undefined,
              theoryMarks: data.theoryMarks ? Number(data.theoryMarks) : undefined,
              practicalMarks: data.practicalMarks ? Number(data.practicalMarks) : undefined,
              practicalPassMarks: data.practicalPassMarks ? Number(data.practicalPassMarks) : undefined,
            }
            create(payload as any, { onSuccess: () => setShowCreate(false) })
          }}
        />
      )}

      {isLoading && (
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading...
        </div>
      )}

      {!isLoading && subjects.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <FlaskConical className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No subjects yet</p>
            <p className="text-xs mt-1">Add subjects to assign them to classes and build your curriculum.</p>
          </CardContent>
        </Card>
      )}

      {/* Grouped by wing */}
      {!filterWing && Object.keys(grouped).length > 0 && (
        <div className="space-y-6">
          {(Object.keys(grouped) as WingType[]).map((wing) => (
            <div key={wing}>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                {wing.replace(/_/g, ' ')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {grouped[wing].map((s) => (
                  <SubjectCard key={s.id} subject={s} schoolId={schoolId ?? ''} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Flat list when filtered */}
      {filterWing && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {subjects.map((s) => (
            <SubjectCard key={s.id} subject={s} schoolId={schoolId ?? ''} />
          ))}
        </div>
      )}
    </div>
  )
}
