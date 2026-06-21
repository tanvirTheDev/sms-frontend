import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import {
  Plus, Loader2, Pencil, Trash2, X, Save,
  BookOpen, ClipboardList, BarChart3, Globe, EyeOff,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { classApi } from '@/api/academic'
import { studentsApi } from '@/api/students'
import {
  useExamSchedules, useCreateExamSchedule, useUpdateExamSchedule,
  useDeleteExamSchedule, usePublishExamSchedule,
  useExamResults, useBulkUpsertResults,
  useStudentResults,
} from '@/features/exam/hooks'
import { useAcademicYears } from '@/features/academic-setup/hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type {
  ExamSchedule, ExamType, CreateExamSchedulePayload, UpdateExamSchedulePayload,
  ExamResult, UpsertResultEntry,
} from '@/types/exam'

export const Route = createFileRoute('/_authenticated/results/')({
  component: ResultsPage,
})

type Tab = 'schedules' | 'marks' | 'results'

const EXAM_TYPES: { value: ExamType; label: string }[] = [
  { value: 'CLASS_TEST', label: 'Class Test' },
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'HALF_YEARLY', label: 'Half-Yearly' },
  { value: 'ANNUAL', label: 'Annual' },
  { value: 'TEST', label: 'Test' },
]

const EXAM_TYPE_COLORS: Record<ExamType, string> = {
  CLASS_TEST: 'bg-purple-100 text-purple-700',
  MONTHLY: 'bg-blue-100 text-blue-700',
  HALF_YEARLY: 'bg-amber-100 text-amber-700',
  ANNUAL: 'bg-red-100 text-red-700',
  TEST: 'bg-teal-100 text-teal-700',
}

const GRADE_COLORS: Record<string, string> = {
  'A+': 'text-green-700 font-bold',
  'A': 'text-green-600 font-semibold',
  'A-': 'text-teal-600 font-semibold',
  'B': 'text-blue-600',
  'C': 'text-amber-600',
  'D': 'text-orange-600',
  'F': 'text-red-600 font-bold',
}

// ── Schedule Form ─────────────────────────────────────────────

interface ScheduleFormProps {
  schoolId: string
  editing: ExamSchedule | null
  onClose: () => void
}

function ScheduleForm({ schoolId, editing, onClose }: ScheduleFormProps) {
  const { data: academicYears = [] } = useAcademicYears(schoolId)
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([])
  const [form, setForm] = useState<CreateExamSchedulePayload>({
    academicYearId: '', classId: '', examType: 'ANNUAL',
    name: '', startDate: '', endDate: '',
  })

  const { mutate: create, isPending: creating } = useCreateExamSchedule(schoolId)
  const { mutate: update, isPending: updating } = useUpdateExamSchedule(schoolId, editing?.id ?? '')

  useEffect(() => {
    classApi.list(schoolId).then((r) => setClasses(r.data.data ?? [])).catch(() => {})
  }, [schoolId])

  useEffect(() => {
    if (editing) {
      setForm({
        academicYearId: editing.academicYearId,
        classId: editing.classId,
        examType: editing.examType,
        name: editing.name,
        startDate: editing.startDate.split('T')[0],
        endDate: editing.endDate.split('T')[0],
      })
    }
  }, [editing])

  // Auto-fill name from examType + class
  useEffect(() => {
    if (!editing && form.examType && form.classId) {
      const cls = classes.find((c) => c.id === form.classId)
      const label = EXAM_TYPES.find((t) => t.value === form.examType)?.label ?? ''
      if (cls) setForm((f) => ({ ...f, name: `${label} - ${cls.name}` }))
    }
  }, [form.examType, form.classId, editing])

  const handleSubmit = () => {
    if (editing) update(form, { onSuccess: onClose })
    else create(form, { onSuccess: onClose })
  }

  const valid = form.academicYearId && form.classId && form.examType && form.name && form.startDate && form.endDate

  return (
    <Card className="border-primary/30">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">{editing ? 'Edit' : 'New'} Exam Schedule</h3>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-medium">Academic Year *</label>
            <select className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              value={form.academicYearId} onChange={(e) => setForm((f) => ({ ...f, academicYearId: e.target.value }))}
              disabled={!!editing}>
              <option value="">Select year</option>
              {(academicYears as any[]).map((y) => <option key={y.id} value={y.id}>{y.name}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium">Class *</label>
            <select className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              value={form.classId} onChange={(e) => setForm((f) => ({ ...f, classId: e.target.value }))}
              disabled={!!editing}>
              <option value="">Select class</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium">Exam Type *</label>
            <select className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              value={form.examType} onChange={(e) => setForm((f) => ({ ...f, examType: e.target.value as ExamType }))}
              disabled={!!editing}>
              {EXAM_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          <div className="sm:col-span-2 md:col-span-3">
            <label className="text-xs font-medium">Name *</label>
            <Input className="mt-1 h-9" placeholder="e.g. Annual Exam - Class 10"
              value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>

          <div>
            <label className="text-xs font-medium">Start Date *</label>
            <Input className="mt-1 h-9" type="date"
              value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} />
          </div>

          <div>
            <label className="text-xs font-medium">End Date *</label>
            <Input className="mt-1 h-9" type="date" min={form.startDate}
              value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} />
          </div>
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

// ── Schedules Tab ─────────────────────────────────────────────

interface SchedulesTabProps {
  schoolId: string
  canWrite: boolean
  onMarkEntry: (schedule: ExamSchedule) => void
  onViewResults: (schedule: ExamSchedule) => void
}

function SchedulesTab({ schoolId, canWrite, onMarkEntry, onViewResults }: SchedulesTabProps) {
  const [filterClassId, setFilterClassId] = useState('')
  const [filterAcademicYearId, setFilterAcademicYearId] = useState('')
  const [filterExamType, setFilterExamType] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<ExamSchedule | null>(null)
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([])

  const { data: academicYears = [] } = useAcademicYears(schoolId)
  const { data: schedules = [], isLoading } = useExamSchedules(schoolId || null, {
    classId: filterClassId || undefined,
    academicYearId: filterAcademicYearId || undefined,
    examType: filterExamType || undefined,
  })
  const { mutate: deleteSchedule } = useDeleteExamSchedule(schoolId)
  const { mutate: publishSchedule, isPending: publishing } = usePublishExamSchedule(schoolId)

  useEffect(() => {
    if (schoolId) classApi.list(schoolId).then((r) => setClasses(r.data.data ?? [])).catch(() => {})
  }, [schoolId])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex flex-wrap gap-2 items-center">
          <select className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            value={filterAcademicYearId} onChange={(e) => setFilterAcademicYearId(e.target.value)}>
            <option value="">All Years</option>
            {(academicYears as any[]).map((y) => <option key={y.id} value={y.id}>{y.name}</option>)}
          </select>
          <select className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            value={filterClassId} onChange={(e) => setFilterClassId(e.target.value)}>
            <option value="">All Classes</option>
            {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            value={filterExamType} onChange={(e) => setFilterExamType(e.target.value)}>
            <option value="">All Types</option>
            {EXAM_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        {canWrite && !showForm && (
          <Button size="sm" onClick={() => { setEditing(null); setShowForm(true) }}>
            <Plus className="h-3.5 w-3.5 mr-1" /> New Schedule
          </Button>
        )}
      </div>

      {showForm && (
        <ScheduleForm
          schoolId={schoolId}
          editing={editing}
          onClose={() => { setShowForm(false); setEditing(null) }}
        />
      )}

      {isLoading && <div className="flex items-center gap-2 text-sm text-muted-foreground py-8"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>}
      {!isLoading && schedules.length === 0 && (
        <div className="text-center py-16 text-muted-foreground text-sm">No exam schedules. Create one to get started.</div>
      )}

      {schedules.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {schedules.map((s) => (
            <Card key={s.id} className="group hover:shadow-sm transition-shadow">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{s.name}</p>
                    <div className="flex flex-wrap gap-1">
                      <span className={cn('text-[10px] px-1.5 py-0.5 rounded font-medium', EXAM_TYPE_COLORS[s.examType])}>
                        {EXAM_TYPES.find((t) => t.value === s.examType)?.label}
                      </span>
                      <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded">{s.class?.name}</span>
                      <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded">{s.academicYear?.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {s.isPublished ? (
                      <Badge variant="outline" className="text-[10px] text-green-600 border-green-300 bg-green-50">Published</Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] text-muted-foreground">Draft</Badge>
                    )}
                  </div>
                </div>

                <div className="text-xs text-muted-foreground space-y-0.5">
                  <p>{format(new Date(s.startDate), 'dd MMM')} – {format(new Date(s.endDate), 'dd MMM yyyy')}</p>
                  {s._count && <p>{s._count.results} result{s._count.results !== 1 ? 's' : ''} entered</p>}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <Button size="sm" variant="outline" className="h-7 text-xs"
                    onClick={() => onViewResults(s)}>
                    <BarChart3 className="h-3 w-3 mr-1" /> Results
                  </Button>
                  {canWrite && (
                    <>
                      <Button size="sm" variant="outline" className="h-7 text-xs"
                        onClick={() => onMarkEntry(s)}>
                        <ClipboardList className="h-3 w-3 mr-1" /> Enter Marks
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 text-xs"
                        disabled={publishing}
                        onClick={() => publishSchedule({ id: s.id, isPublished: !s.isPublished })}>
                        {s.isPublished ? <EyeOff className="h-3 w-3 mr-1" /> : <Globe className="h-3 w-3 mr-1" />}
                        {s.isPublished ? 'Unpublish' : 'Publish'}
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0"
                        onClick={() => { setEditing(s); setShowForm(true) }}>
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                        onClick={() => {
                          if (confirm('Delete this exam schedule? This removes all result data.')) {
                            deleteSchedule(s.id)
                          }
                        }}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Marks Entry Tab ────────────────────────────────────────────

interface MarksEntry {
  studentId: string
  studentName: string
  studentNo: string
  marksObtained: string
  isAbsent: boolean
  comment: string
}

interface MarksTabProps {
  schoolId: string
  initialSchedule?: ExamSchedule | null
}

function MarksTab({ schoolId, initialSchedule }: MarksTabProps) {
  const [selectedScheduleId, setSelectedScheduleId] = useState(initialSchedule?.id ?? '')
  const [selectedSectionId, setSelectedSectionId] = useState('')
  const [selectedSubjectId, setSelectedSubjectId] = useState('')
  const [sections, setSections] = useState<{ id: string; name: string }[]>([])
  const [subjects, setSubjects] = useState<{ id: string; name: string; code: string | null }[]>([])
  // All students in the exam's class (loaded at class level, not section level)
  const [allClassStudents, setAllClassStudents] = useState<{ id: string; name: string; studentId: string; sectionId: string }[]>([])
  const [rows, setRows] = useState<MarksEntry[]>([])

  const { data: schedules = [], isLoading: schedulesLoading } = useExamSchedules(schoolId || null)

  const selectedSchedule = schedules.find((s) => s.id === selectedScheduleId) ?? initialSchedule ?? null

  const { data: existingResults = [] } = useExamResults(
    schoolId || null,
    selectedScheduleId || null,
    { sectionId: selectedSectionId || undefined, subjectId: selectedSubjectId || undefined }
  )

  const { mutate: saveMarks, isPending: saving } = useBulkUpsertResults(schoolId, selectedScheduleId)

  // Load sections when schedule selected
  useEffect(() => {
    if (!selectedSchedule?.classId || !schoolId) { setSections([]); return }
    classApi.listSections(schoolId, selectedSchedule.classId)
      .then((r) => setSections(r.data.data ?? []))
      .catch(() => setSections([]))
  }, [selectedSchedule?.classId, schoolId])

  // Load subjects when schedule selected
  useEffect(() => {
    if (!selectedSchedule?.classId || !schoolId) { setSubjects([]); return }
    classApi.listSubjects(schoolId, selectedSchedule.classId)
      .then((r) => setSubjects((r.data.data ?? []).map((cs: any) => cs.subject ?? cs)))
      .catch(() => setSubjects([]))
  }, [selectedSchedule?.classId, schoolId])

  // Load ALL students in the exam's class when schedule selected.
  // Using classId (not sectionId) so students appear regardless of which section
  // they're assigned to — section filter happens client-side when building rows.
  useEffect(() => {
    if (!selectedSchedule?.classId || !schoolId) { setAllClassStudents([]); return }
    studentsApi.list(schoolId, { classId: selectedSchedule.classId, limit: 200, isActive: true })
      .then((r) => setAllClassStudents(r.data.data ?? []))
      .catch(() => setAllClassStudents([]))
  }, [selectedSchedule?.classId, schoolId])

  // Build rows: filter class students to selected section, then merge existing results
  useEffect(() => {
    const sectionStudents = selectedSectionId
      ? allClassStudents.filter((s) => s.sectionId === selectedSectionId)
      : []
    if (sectionStudents.length === 0) { setRows([]); return }
    const map: Record<string, ExamResult> = {}
    existingResults.forEach((r) => { map[r.studentId] = r })
    setRows(sectionStudents.map((s) => ({
      studentId: s.id,
      studentName: s.name,
      studentNo: s.studentId,
      marksObtained: map[s.id] ? String(parseFloat(String(map[s.id].marksObtained))) : '',
      isAbsent: map[s.id]?.isAbsent ?? false,
      comment: map[s.id]?.teacherComment ?? '',
    })))
  }, [allClassStudents, existingResults, selectedSectionId])

  const calcGradeDisplay = (marks: number): string => {
    if (marks >= 80) return 'A+'
    if (marks >= 70) return 'A'
    if (marks >= 60) return 'A-'
    if (marks >= 50) return 'B'
    if (marks >= 40) return 'C'
    if (marks >= 33) return 'D'
    return 'F'
  }

  const handleSave = () => {
    if (!selectedSectionId || !selectedSubjectId) return
    const results: UpsertResultEntry[] = rows
      .filter((r) => r.isAbsent || r.marksObtained !== '')
      .map((r) => ({
        studentId: r.studentId,
        sectionId: selectedSectionId,
        subjectId: selectedSubjectId,
        marksObtained: r.isAbsent ? 0 : parseFloat(r.marksObtained) || 0,
        isAbsent: r.isAbsent,
        teacherComment: r.comment.trim() || undefined,
      }))
    if (results.length === 0) return
    saveMarks(results)
  }

  const canSave = selectedScheduleId && selectedSectionId && selectedSubjectId && rows.length > 0

  return (
    <div className="space-y-4">
      {/* Selectors */}
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-xs font-medium block mb-1">Exam Schedule *</label>
          <select className="h-9 rounded-md border border-input bg-background px-3 text-sm min-w-52"
            value={selectedScheduleId} onChange={(e) => { setSelectedScheduleId(e.target.value); setSelectedSectionId(''); setSelectedSubjectId('') }}>
            <option value="">Select schedule</option>
            {schedules.map((s) => (
              <option key={s.id} value={s.id}>{s.name} ({s.class?.name})</option>
            ))}
          </select>
        </div>
        {selectedSchedule && (
          <>
            <div>
              <label className="text-xs font-medium block mb-1">Section *</label>
              <select className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                value={selectedSectionId} onChange={(e) => setSelectedSectionId(e.target.value)}>
                <option value="">Select section</option>
                {sections.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium block mb-1">Subject *</label>
              <select className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                value={selectedSubjectId} onChange={(e) => setSelectedSubjectId(e.target.value)}>
                <option value="">Select subject</option>
                {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}{s.code ? ` (${s.code})` : ''}</option>)}
              </select>
            </div>
          </>
        )}
        {canSave && (
          <Button size="sm" disabled={saving} onClick={handleSave}>
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Save className="h-3.5 w-3.5 mr-1" />}
            Save Marks
          </Button>
        )}
      </div>

      {schedulesLoading && <div className="flex items-center gap-2 text-sm text-muted-foreground py-4"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>}

      {rows.length > 0 && (
        <div className="rounded-md border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                {['#', 'Student', 'Student ID', 'Marks (0–100)', 'Absent', 'Grade', 'Comment'].map((h) => (
                  <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                const marks = parseFloat(row.marksObtained)
                const grade = row.isAbsent ? 'F' : (!isNaN(marks) && row.marksObtained !== '' ? calcGradeDisplay(marks) : '')
                return (
                  <tr key={row.studentId} className={cn('border-t', row.isAbsent && 'bg-red-50/50')}>
                    <td className="px-3 py-1.5 text-muted-foreground text-xs">{i + 1}</td>
                    <td className="px-3 py-1.5 font-medium whitespace-nowrap">{row.studentName}</td>
                    <td className="px-3 py-1.5 text-xs text-muted-foreground">{row.studentNo}</td>
                    <td className="px-3 py-1.5">
                      <Input
                        className="h-7 w-20 text-center text-sm"
                        type="number" min={0} max={100} step={0.5}
                        value={row.marksObtained}
                        disabled={row.isAbsent}
                        placeholder="—"
                        onChange={(e) => setRows((prev) =>
                          prev.map((r) => r.studentId === row.studentId ? { ...r, marksObtained: e.target.value } : r)
                        )}
                      />
                    </td>
                    <td className="px-3 py-1.5">
                      <input type="checkbox" checked={row.isAbsent}
                        onChange={(e) => setRows((prev) =>
                          prev.map((r) => r.studentId === row.studentId ? { ...r, isAbsent: e.target.checked, marksObtained: e.target.checked ? '' : r.marksObtained } : r)
                        )}
                      />
                    </td>
                    <td className="px-3 py-1.5">
                      <span className={cn('text-sm', grade ? GRADE_COLORS[grade] : '')}>{grade}</span>
                    </td>
                    <td className="px-3 py-1.5">
                      <Input
                        className="h-7 w-32 text-xs"
                        placeholder="Optional"
                        value={row.comment}
                        onChange={(e) => setRows((prev) =>
                          prev.map((r) => r.studentId === row.studentId ? { ...r, comment: e.target.value } : r)
                        )}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {selectedSchedule && selectedSectionId && rows.length === 0 && !schedulesLoading && (
        <div className="text-center py-10 text-muted-foreground text-sm space-y-1">
          <p>No students found in this section.</p>
          <p className="text-xs">Make sure students are enrolled in this section for this academic year.</p>
        </div>
      )}
    </div>
  )
}

// ── Results View Tab ───────────────────────────────────────────

interface ResultsViewTabProps {
  schoolId: string
  role: string
  initialSchedule?: ExamSchedule | null
}

function ResultsViewTab({ schoolId, role, initialSchedule }: ResultsViewTabProps) {
  const isStudentOrParent = ['STUDENT', 'PARENT', 'GUARDIAN'].includes(role)
  const [selectedScheduleId, setSelectedScheduleId] = useState(initialSchedule?.id ?? '')
  const [selectedSectionId, setSelectedSectionId] = useState('')
  const [sections, setSections] = useState<{ id: string; name: string }[]>([])
  const [lookupStudentId, setLookupStudentId] = useState('')
  const [studentSearch, setStudentSearch] = useState('')
  const [studentResults, setStudentResults] = useState<{ id: string; name: string; studentId: string }[]>([])
  const [showStudentDrop, setShowStudentDrop] = useState(false)
  const [studentSearching, setStudentSearching] = useState(false)

  const { data: schedules = [] } = useExamSchedules(schoolId || null)

  const selectedSchedule = schedules.find((s) => s.id === selectedScheduleId) ?? initialSchedule ?? null

  const activeStudentId = lookupStudentId

  // Browse by schedule + section (admin/teacher view)
  const { data: sectionResults = [], isLoading: sectionLoading } = useExamResults(
    !activeStudentId && selectedScheduleId && selectedSectionId ? schoolId : null,
    selectedScheduleId || null,
    { sectionId: selectedSectionId || undefined }
  )

  // For student result card
  const { data: ownResults = [], isLoading: ownLoading } = useStudentResults(
    schoolId || null,
    activeStudentId || null,
    { examScheduleId: selectedScheduleId || undefined }
  )

  useEffect(() => {
    if (!selectedSchedule?.classId || !schoolId) { setSections([]); return }
    classApi.listSections(schoolId, selectedSchedule.classId)
      .then((r) => setSections(r.data.data ?? []))
      .catch(() => setSections([]))
  }, [selectedSchedule?.classId, schoolId])

  // Student search
  useEffect(() => {
    if (!studentSearch.trim() || studentSearch.length < 2) {
      setStudentResults([]); setShowStudentDrop(false); return
    }
    const t = setTimeout(async () => {
      setStudentSearching(true)
      try {
        const r = await studentsApi.list(schoolId, { search: studentSearch.trim(), limit: 8 })
        setStudentResults(r.data.data ?? [])
        setShowStudentDrop(true)
      } catch { } finally { setStudentSearching(false) }
    }, 350)
    return () => clearTimeout(t)
  }, [studentSearch, schoolId])

  // Group section results by student
  const groupedByStudent = sectionResults.reduce<Record<string, ExamResult[]>>((acc, r) => {
    const key = r.studentId
    if (!acc[key]) acc[key] = []
    acc[key].push(r)
    return acc
  }, {})

  const avgGpa = (results: typeof ownResults): number | null => {
    const gpas = results.map((r: any) => r.gpa ? parseFloat(String(r.gpa)) : null).filter((g) => g !== null) as number[]
    return gpas.length ? gpas.reduce((a, b) => a + b, 0) / gpas.length : null
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-xs font-medium block mb-1">Exam Schedule</label>
          <select className="h-9 rounded-md border border-input bg-background px-3 text-sm min-w-52"
            value={selectedScheduleId} onChange={(e) => { setSelectedScheduleId(e.target.value); setSelectedSectionId('') }}>
            <option value="">All schedules</option>
            {schedules.map((s) => (
              <option key={s.id} value={s.id}>{s.name} ({s.class?.name})</option>
            ))}
          </select>
        </div>

        {selectedSchedule && !activeStudentId && (
          <div>
            <label className="text-xs font-medium block mb-1">Section</label>
            <select className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              value={selectedSectionId} onChange={(e) => setSelectedSectionId(e.target.value)}>
              <option value="">All sections</option>
              {sections.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        )}

        <div className="relative">
          <label className="text-xs font-medium block mb-1">
            {isStudentOrParent ? 'Student' : 'Student result card'}
          </label>
          <div className="relative">
            <Input className="h-9 w-48 pr-8" placeholder="Search student…"
              value={studentSearch}
              onChange={(e) => { setStudentSearch(e.target.value); if (!e.target.value) setLookupStudentId('') }} />
            {studentSearching && <Loader2 className="absolute right-2 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />}
          </div>
          {showStudentDrop && studentResults.length > 0 && (
            <div className="absolute z-50 w-56 mt-0.5 bg-popover border rounded-md shadow-md max-h-40 overflow-y-auto">
              {studentResults.map((s) => (
                <button key={s.id} className="w-full text-left px-3 py-2 hover:bg-muted text-sm border-b last:border-0"
                  onClick={() => { setLookupStudentId(s.id); setStudentSearch(s.name); setShowStudentDrop(false) }}>
                  <p className="font-medium">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.studentId}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Student result card */}
      {activeStudentId && (
        <div>
          {ownLoading && <div className="flex items-center gap-2 text-sm text-muted-foreground py-4"><Loader2 className="h-4 w-4 animate-spin" /> Loading results…</div>}
          {!ownLoading && ownResults.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">No results found.</div>
          )}
          {!ownLoading && ownResults.length > 0 && (
            <div className="space-y-4">
              {Object.entries(
                (ownResults as any[]).reduce<Record<string, typeof ownResults>>((acc, r) => {
                  const k = (r as any).examSchedule?.name ?? 'Results'
                  if (!acc[k]) acc[k] = []
                  acc[k].push(r)
                  return acc
                }, {})
              ).map(([scheduleName, results]) => {
                const gpa = avgGpa(results)
                return (
                  <Card key={scheduleName}>
                    <CardHeader className="pb-2 pt-4 px-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-semibold">{scheduleName}</CardTitle>
                        {gpa !== null && (
                          <span className={cn('text-sm font-bold', GRADE_COLORS[calcGradeFromGpa(gpa)] ?? 'text-foreground')}>
                            Avg GPA: {gpa.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                      <div className="rounded-md border overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-muted/50">
                            <tr>
                              {['Subject', 'Marks', 'Grade', 'GPA', 'Status', 'Comment'].map((h) => (
                                <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {(results as any[]).map((r) => (
                              <tr key={r.id} className={cn('border-t', r.isAbsent && 'bg-red-50/50')}>
                                <td className="px-3 py-2 font-medium whitespace-nowrap">{r.subject?.name}</td>
                                <td className="px-3 py-2">{r.isAbsent ? '—' : parseFloat(String(r.marksObtained))}</td>
                                <td className={cn('px-3 py-2', r.grade ? GRADE_COLORS[r.grade] ?? '' : '')}>
                                  {r.grade ?? '—'}
                                </td>
                                <td className="px-3 py-2">{r.gpa ? parseFloat(String(r.gpa)).toFixed(2) : '—'}</td>
                                <td className="px-3 py-2">
                                  {r.isAbsent ? (
                                    <span className="text-xs text-red-600 font-medium">Absent</span>
                                  ) : (
                                    <span className="text-xs text-muted-foreground">Present</span>
                                  )}
                                </td>
                                <td className="px-3 py-2 text-xs text-muted-foreground">{r.teacherComment ?? '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Section results (admin view) */}
      {!activeStudentId && selectedScheduleId && selectedSectionId && (
        <div>
          {sectionLoading && <div className="flex items-center gap-2 text-sm text-muted-foreground py-4"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>}
          {!sectionLoading && sectionResults.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">No results entered for this section yet.</div>
          )}
          {!sectionLoading && sectionResults.length > 0 && (
            <div className="space-y-4">
              {Object.entries(groupedByStudent).map(([studentId, results]) => {
                const first = results[0]
                const gpa = avgGpa(results as any)
                return (
                  <Card key={studentId}>
                    <CardHeader className="pb-2 pt-3 px-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold">{first.student?.name}</p>
                          <p className="text-xs text-muted-foreground">{first.student?.studentId}</p>
                        </div>
                        {gpa !== null && (
                          <span className={cn('text-sm font-bold', GRADE_COLORS[calcGradeFromGpa(gpa)] ?? '')}>
                            Avg GPA: {gpa.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="px-4 pb-3">
                      <div className="rounded-md border overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead className="bg-muted/50">
                            <tr>
                              {['Subject', 'Marks', 'Grade', 'GPA', 'Status'].map((h) => (
                                <th key={h} className="px-2 py-1.5 text-left font-semibold text-muted-foreground">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {results.map((r) => (
                              <tr key={r.id} className={cn('border-t', r.isAbsent && 'bg-red-50/50')}>
                                <td className="px-2 py-1.5 font-medium">{r.subject?.name}</td>
                                <td className="px-2 py-1.5">{r.isAbsent ? '—' : parseFloat(String(r.marksObtained))}</td>
                                <td className={cn('px-2 py-1.5', r.grade ? GRADE_COLORS[r.grade] ?? '' : '')}>
                                  {r.grade ?? '—'}
                                </td>
                                <td className="px-2 py-1.5">{r.gpa ? parseFloat(String(r.gpa)).toFixed(2) : '—'}</td>
                                <td className="px-2 py-1.5">
                                  {r.isAbsent ? <span className="text-red-600">Absent</span> : <span className="text-muted-foreground">Present</span>}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      )}

      {!activeStudentId && (!selectedScheduleId || !selectedSectionId) && (
        <div className="text-center py-16 text-muted-foreground text-sm">
          Select a schedule and section, or search for a student to view results.
        </div>
      )}
    </div>
  )
}

function calcGradeFromGpa(gpa: number): string {
  if (gpa >= 5.0) return 'A+'
  if (gpa >= 4.0) return 'A'
  if (gpa >= 3.5) return 'A-'
  if (gpa >= 3.0) return 'B'
  if (gpa >= 2.0) return 'C'
  if (gpa >= 1.0) return 'D'
  return 'F'
}

// ── Main Page ─────────────────────────────────────────────────

function ResultsPage() {
  const { user } = useAuthStore()
  const schoolId = user?.schoolId ?? ''
  const role = user?.role ?? ''
  const isStudentOrParent = ['STUDENT', 'PARENT', 'GUARDIAN'].includes(role)
  const canWrite = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER'].includes(role)
  const canManageSchedules = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL'].includes(role)

  const [tab, setTab] = useState<Tab>(isStudentOrParent ? 'results' : 'schedules')
  const [jumpSchedule, setJumpSchedule] = useState<ExamSchedule | null>(null)

  if (!schoolId) return <div className="text-center py-16 text-muted-foreground text-sm">No school assigned.</div>

  const tabs: { key: Tab; label: string; icon: React.ElementType; show: boolean }[] = [
    { key: 'schedules', label: 'Schedules', icon: BookOpen, show: !isStudentOrParent },
    { key: 'marks', label: 'Enter Marks', icon: ClipboardList, show: canWrite },
    { key: 'results', label: 'View Results', icon: BarChart3, show: true },
  ]

  const visibleTabs = tabs.filter((t) => t.show)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Results & Exams</h1>
        <p className="text-sm text-muted-foreground">
          {isStudentOrParent ? 'View your exam results.' : 'Manage exam schedules, enter marks, and view results.'}
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b">
        {visibleTabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors',
              tab === key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'schedules' && !isStudentOrParent && (
        <SchedulesTab
          schoolId={schoolId}
          canWrite={canManageSchedules}
          onMarkEntry={(s) => { setJumpSchedule(s); setTab('marks') }}
          onViewResults={(s) => { setJumpSchedule(s); setTab('results') }}
        />
      )}
      {tab === 'marks' && canWrite && (
        <MarksTab
          schoolId={schoolId}
          initialSchedule={jumpSchedule}
        />
      )}
      {tab === 'results' && (
        <ResultsViewTab
          schoolId={schoolId}
          role={role}
          initialSchedule={jumpSchedule}
        />
      )}
    </div>
  )
}
