import { createFileRoute, Link, useRouterState } from '@tanstack/react-router'
import { useState } from 'react'
import { CalendarDays, BookOpen, FlaskConical, Layers, Plus, Pencil, Check, X, Loader2, TrendingUp } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useWings, useCreateWing, useUpdateWing } from '@/features/academic-setup/hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { SchoolWing, WingType, ShiftType } from '@/types/academic'

export const Route = createFileRoute('/_authenticated/academic-setup/wings')({
  component: WingsPage,
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

function WingRow({ wing, schoolId }: { wing: SchoolWing; schoolId: string }) {
  const [editing, setEditing] = useState(false)
  const [shift, setShift] = useState<ShiftType | ''>(wing.shift ?? '')
  const { mutate: update, isPending } = useUpdateWing(schoolId)

  const wingLabel = wing.wing.replace(/_/g, ' ')

  if (editing) {
    return (
      <div className="flex items-center justify-between py-2.5 px-4 rounded-md bg-muted/40">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className={cn('text-xs', WING_COLORS[wing.wing])}>
            {wingLabel}
          </Badge>
          <select
            className="h-8 rounded-md border border-input bg-background px-2 py-1 text-sm"
            value={shift}
            onChange={(e) => setShift(e.target.value as ShiftType | '')}
            autoFocus
          >
            <option value="">No shift</option>
            {SHIFT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="icon" className="h-7 w-7" disabled={isPending}
            onClick={() =>
              update(
                { id: wing.id, payload: { shift: (shift as ShiftType) || undefined } },
                { onSuccess: () => setEditing(false) }
              )
            }
          >
            {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditing(false)}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between py-2.5 px-4 rounded-md bg-muted/40">
      <div className="flex items-center gap-3">
        <Badge variant="outline" className={cn('text-xs', WING_COLORS[wing.wing])}>
          {wingLabel}
        </Badge>
        {wing.shift ? (
          <Badge variant="secondary" className="text-xs">{wing.shift}</Badge>
        ) : (
          <span className="text-xs text-muted-foreground">No shift</span>
        )}
      </div>
      <Button
        variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground"
        onClick={() => setEditing(true)}
      >
        <Pencil className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}

function AddWingForm({ schoolId, onClose }: { schoolId: string; onClose: () => void }) {
  const [wing, setWing] = useState<WingType>('SECONDARY')
  const [shift, setShift] = useState<ShiftType | ''>('')
  const { mutate: create, isPending } = useCreateWing(schoolId)

  return (
    <div className="flex items-end gap-3 flex-wrap p-4 rounded-md border border-primary/30 bg-primary/5">
      <div className="space-y-1">
        <label className="text-xs font-medium">Wing</label>
        <select
          className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
          value={wing}
          onChange={(e) => setWing(e.target.value as WingType)}
        >
          {WING_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium">Shift (optional)</label>
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
        onClick={() =>
          create({ wing, shift: (shift as ShiftType) || undefined }, { onSuccess: onClose })
        }
      >
        {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Plus className="h-3.5 w-3.5 mr-1" />}
        Add Wing
      </Button>
      <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
    </div>
  )
}

function WingsPage() {
  const { user } = useAuthStore()
  const schoolId = user?.schoolId ?? null
  const [showAdd, setShowAdd] = useState(false)

  const { data: wings = [], isLoading } = useWings(schoolId)

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Academic Setup</h1>
        <p className="text-sm text-muted-foreground">Configure academic years, classes, sections, and subjects.</p>
      </div>

      <SubNav />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">School Wings</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Wings represent divisions of the school (Primary, Secondary, Higher Secondary). Each wing can have a shift.
          </p>
        </div>
        <Button size="sm" onClick={() => setShowAdd(!showAdd)}>
          <Plus className="h-4 w-4 mr-1.5" /> Add Wing
        </Button>
      </div>

      {showAdd && (
        <AddWingForm schoolId={schoolId ?? ''} onClose={() => setShowAdd(false)} />
      )}

      {isLoading && (
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading...
        </div>
      )}

      {!isLoading && wings.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Layers className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No wings configured</p>
            <p className="text-xs mt-1">Add at least one wing before creating classes.</p>
          </CardContent>
        </Card>
      )}

      {wings.length > 0 && (
        <Card>
          <CardContent className="p-3 space-y-2">
            {wings.map((wing) => (
              <WingRow key={wing.id} wing={wing} schoolId={schoolId ?? ''} />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
