import { createFileRoute, Link, useRouterState } from '@tanstack/react-router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod/v4'
import { format } from 'date-fns'
import { CalendarDays, Plus, Star, Pencil, Check, X, Loader2, BookOpen, FlaskConical, Layers, TrendingUp } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useAcademicYears, useCreateAcademicYear, useUpdateAcademicYear, useSetCurrentAcademicYear } from '@/features/academic-setup/hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { AcademicYear } from '@/types/academic'

export const Route = createFileRoute('/_authenticated/academic-setup/')({
  component: AcademicSetupPage,
})

const GRADING_OPTIONS = [
  { value: 'GPA_5', label: 'GPA-5 (BD Standard)' },
  { value: 'PERCENTAGE', label: 'Percentage' },
  { value: 'LETTER_GRADE', label: 'Letter Grade' },
]

const yearSchema = z.object({
  name: z.string().min(1, 'Name required'),
  year: z.coerce.number().int().min(2000).max(2100),
  startDate: z.string().min(1, 'Start date required'),
  endDate: z.string().min(1, 'End date required'),
  gradingSystem: z.enum(['GPA_5', 'PERCENTAGE', 'LETTER_GRADE']).optional(),
  isCurrent: z.boolean().optional(),
})
type YearForm = z.infer<typeof yearSchema>

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

function YearFormCard({
  defaultValues,
  onSubmit,
  onCancel,
  isPending,
  title,
}: {
  defaultValues?: Partial<YearForm>
  onSubmit: (data: YearForm) => void
  onCancel: () => void
  isPending: boolean
  title: string
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<YearForm>({
    resolver: zodResolver(yearSchema),
    defaultValues: {
      gradingSystem: 'GPA_5',
      isCurrent: false,
      ...defaultValues,
    },
  })

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardContent className="p-4">
        <p className="text-sm font-semibold mb-4">{title}</p>
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Name</Label>
            <Input placeholder="2025" {...register('name')} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Year (number)</Label>
            <Input type="number" placeholder="2025" {...register('year')} />
            {errors.year && <p className="text-xs text-destructive">{errors.year.message}</p>}
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Grading System</Label>
            <select
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
              {...register('gradingSystem')}
            >
              {GRADING_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Start Date</Label>
            <Input type="date" {...register('startDate')} />
            {errors.startDate && <p className="text-xs text-destructive">{errors.startDate.message}</p>}
          </div>
          <div className="space-y-1">
            <Label className="text-xs">End Date</Label>
            <Input type="date" {...register('endDate')} />
            {errors.endDate && <p className="text-xs text-destructive">{errors.endDate.message}</p>}
          </div>
          <div className="flex items-end gap-2">
            <label className="flex items-center gap-2 text-sm cursor-pointer mb-1">
              <input type="checkbox" {...register('isCurrent')} className="h-4 w-4" />
              Set as current
            </label>
          </div>
          <div className="col-span-2 md:col-span-3 flex gap-2 pt-1">
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
              Save
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

function YearRow({ year, schoolId }: { year: AcademicYear; schoolId: string }) {
  const [editing, setEditing] = useState(false)
  const { mutate: update, isPending: updating } = useUpdateAcademicYear(schoolId)
  const { mutate: setCurrent, isPending: settingCurrent } = useSetCurrentAcademicYear(schoolId)

  if (editing) {
    return (
      <YearFormCard
        title={`Edit: ${year.name}`}
        defaultValues={{
          name: year.name,
          year: year.year,
          startDate: year.startDate.slice(0, 10),
          endDate: year.endDate.slice(0, 10),
          gradingSystem: year.gradingSystem as any,
          isCurrent: year.isCurrent,
        }}
        isPending={updating}
        onCancel={() => setEditing(false)}
        onSubmit={(data) => {
          update({ id: year.id, payload: data }, { onSuccess: () => setEditing(false) })
        }}
      />
    )
  }

  return (
    <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/40 transition-colors gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <CalendarDays className="h-4 w-4 text-primary" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-sm">{year.name}</p>
            <span className="text-xs text-muted-foreground">({year.year})</span>
            {year.isCurrent && (
              <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-[10px] h-4">
                <Star className="h-2.5 w-2.5 mr-0.5" /> Current
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {format(new Date(year.startDate), 'dd MMM yyyy')} – {format(new Date(year.endDate), 'dd MMM yyyy')}
            {' · '}{year.gradingSystem.replace(/_/g, '-')}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {!year.isCurrent && (
          <Button
            variant="outline" size="sm"
            disabled={settingCurrent}
            onClick={() => setCurrent(year.id)}
            className="text-xs h-7"
          >
            {settingCurrent ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3 mr-1" />}
            Set Current
          </Button>
        )}
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditing(true)}>
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}

function AcademicSetupPage() {
  const { user } = useAuthStore()
  const schoolId = user?.schoolId ?? null
  const [showCreate, setShowCreate] = useState(false)

  const { data: years = [], isLoading } = useAcademicYears(schoolId)
  const { mutate: create, isPending: creating } = useCreateAcademicYear(schoolId ?? '')

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Academic Setup</h1>
        <p className="text-sm text-muted-foreground">Configure academic years, classes, sections, and subjects.</p>
      </div>

      <SubNav />

      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Academic Years</h2>
        <Button size="sm" onClick={() => setShowCreate(!showCreate)}>
          <Plus className="h-4 w-4 mr-1.5" />
          Add Year
        </Button>
      </div>

      {showCreate && (
        <YearFormCard
          title="New Academic Year"
          isPending={creating}
          onCancel={() => setShowCreate(false)}
          onSubmit={(data) => {
            create(data, { onSuccess: () => setShowCreate(false) })
          }}
        />
      )}

      {isLoading && (
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading...
        </div>
      )}

      {!isLoading && years.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <CalendarDays className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No academic years yet</p>
            <p className="text-xs mt-1">Create the first academic year to start setting up classes.</p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {years.map((year) => (
          <YearRow key={year.id} year={year} schoolId={schoolId ?? ''} />
        ))}
      </div>
    </div>
  )
}
