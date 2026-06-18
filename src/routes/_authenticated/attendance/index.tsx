import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useMemo } from 'react'
import { format } from 'date-fns'
import { Loader2, Save, CheckCircle2, XCircle, Clock, FileText, ChevronDown, ChevronUp } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useClasses } from '@/features/academic-setup/hooks'
import { useStudents } from '@/features/students/hooks'
import { useStaffList } from '@/features/staff/hooks'
import {
  useStudentAttendance, useBulkStudentAttendance,
  useStaffAttendance, useBulkStaffAttendance,
  useMonthlyStudentReport,
} from '@/features/attendance/hooks'
import { classApi } from '@/api/academic'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { AttendanceStatus } from '@/types/attendance'
import type { ClassSection } from '@/types/academic'

export const Route = createFileRoute('/_authenticated/attendance/')({
  component: AttendancePage,
})

type Tab = 'student' | 'staff' | 'report'

const STATUS_CONFIG: Record<AttendanceStatus, { label: string; short: string; color: string; bg: string }> = {
  PRESENT: { label: 'Present', short: 'P', color: 'text-green-700', bg: 'bg-green-100 hover:bg-green-200 border-green-300' },
  ABSENT:  { label: 'Absent',  short: 'A', color: 'text-red-700',   bg: 'bg-red-100 hover:bg-red-200 border-red-300'   },
  LATE:    { label: 'Late',    short: 'L', color: 'text-amber-700', bg: 'bg-amber-100 hover:bg-amber-200 border-amber-300' },
  LEAVE:   { label: 'Leave',   short: 'LV', color: 'text-blue-700', bg: 'bg-blue-100 hover:bg-blue-200 border-blue-300' },
}
const STATUSES: AttendanceStatus[] = ['PRESENT', 'ABSENT', 'LATE', 'LEAVE']

function StatusToggle({
  status, onChange,
}: { status: AttendanceStatus; onChange: (s: AttendanceStatus) => void }) {
  return (
    <div className="flex gap-1">
      {STATUSES.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          className={cn(
            'h-7 w-8 rounded text-xs font-semibold border transition-colors',
            status === s
              ? STATUS_CONFIG[s].bg + ' ' + STATUS_CONFIG[s].color
              : 'bg-background border-input text-muted-foreground hover:bg-muted',
          )}
        >
          {STATUS_CONFIG[s].short}
        </button>
      ))}
    </div>
  )
}

// ── Student Attendance Tab ────────────────────────────────────────

function StudentAttendanceTab({ schoolId }: { schoolId: string }) {
  const today = format(new Date(), 'yyyy-MM-dd')
  const [date, setDate] = useState(today)
  const [classId, setClassId] = useState('')
  const [sectionId, setSectionId] = useState('')
  const [sections, setSections] = useState<ClassSection[]>([])
  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>({})

  const { data: classes = [] } = useClasses(schoolId)
  const { data: studentsData } = useStudents(
    sectionId ? schoolId : null,
    { sectionId: sectionId || undefined, isActive: true, limit: 100 },
  )
  const students = studentsData?.data ?? []

  const { data: existingRecords = [], isLoading: loadingExisting } = useStudentAttendance(
    sectionId ? schoolId : null,
    sectionId ? { sectionId, date } : null,
  )
  const { mutate: save, isPending: saving } = useBulkStudentAttendance(schoolId)

  // Load sections on class change
  useEffect(() => {
    setSectionId('')
    setSections([])
    if (!classId) return
    classApi.listSections(schoolId, classId).then((res) => {
      setSections(res.data.data ?? [])
    }).catch(() => {})
  }, [classId, schoolId])

  // Seed statuses: existing records → PRESENT for all others
  useEffect(() => {
    if (!students.length) { setStatuses({}); return }
    const map: Record<string, AttendanceStatus> = {}
    students.forEach((s) => { map[s.id] = 'PRESENT' })
    existingRecords.forEach((r) => { map[r.studentId] = r.status })
    setStatuses(map)
  }, [students, existingRecords])

  const markAll = (s: AttendanceStatus) => {
    const map: Record<string, AttendanceStatus> = {}
    students.forEach((st) => { map[st.id] = s })
    setStatuses(map)
  }

  const handleSave = () => {
    if (!sectionId) return
    save({
      sectionId,
      date,
      records: students.map((s) => ({ studentId: s.id, status: statuses[s.id] ?? 'PRESENT' })),
    })
  }

  const counts = useMemo(() => {
    const c = { PRESENT: 0, ABSENT: 0, LATE: 0, LEAVE: 0 }
    Object.values(statuses).forEach((s) => { c[s]++ })
    return c
  }, [statuses])

  return (
    <div className="space-y-4">
      {/* Selectors */}
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Date</label>
          <Input type="date" className="h-9 mt-1 w-40" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Class</label>
          <select
            className="mt-1 h-9 rounded-md border border-input bg-background px-3 text-sm block"
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
          >
            <option value="">Select class</option>
            {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        {sections.length > 0 && (
          <div>
            <label className="text-xs font-medium text-muted-foreground">Section</label>
            <select
              className="mt-1 h-9 rounded-md border border-input bg-background px-3 text-sm block"
              value={sectionId}
              onChange={(e) => setSectionId(e.target.value)}
            >
              <option value="">Select section</option>
              {sections.map((s) => <option key={s.id} value={s.id}>Section {s.name}</option>)}
            </select>
          </div>
        )}
      </div>

      {!sectionId && (
        <div className="text-center py-12 text-muted-foreground text-sm">
          Select class and section to take attendance.
        </div>
      )}

      {sectionId && (
        <>
          {/* Summary + bulk actions */}
          {students.length > 0 && (
            <div className="flex flex-wrap items-center gap-3">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => markAll(s)}
                  className={cn('text-xs px-2.5 py-1 rounded-full border font-medium transition-colors', STATUS_CONFIG[s].bg, STATUS_CONFIG[s].color)}
                >
                  Mark All {STATUS_CONFIG[s].label}
                </button>
              ))}
              <div className="ml-auto flex gap-3 text-sm">
                <span className="text-green-600 font-medium">{counts.PRESENT}P</span>
                <span className="text-red-600 font-medium">{counts.ABSENT}A</span>
                <span className="text-amber-600 font-medium">{counts.LATE}L</span>
                <span className="text-blue-600 font-medium">{counts.LEAVE}LV</span>
              </div>
            </div>
          )}

          {loadingExisting && (
            <div className="flex items-center gap-2 text-muted-foreground text-sm py-4">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading…
            </div>
          )}

          {!loadingExisting && students.length === 0 && (
            <p className="text-muted-foreground text-sm py-8 text-center">No active students in this section.</p>
          )}

          {students.length > 0 && (
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {students.map((student, i) => (
                    <div key={student.id} className="flex items-center gap-3 px-4 py-2.5">
                      <span className="text-xs text-muted-foreground w-6 shrink-0">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-snug truncate">{student.name}</p>
                        {student.nameBn && <p className="text-xs text-muted-foreground">{student.nameBn}</p>}
                        <p className="text-xs text-muted-foreground font-mono">{student.studentId}</p>
                      </div>
                      <StatusToggle
                        status={statuses[student.id] ?? 'PRESENT'}
                        onChange={(s) => setStatuses((prev) => ({ ...prev, [student.id]: s }))}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {students.length > 0 && (
            <div className="flex gap-3 pt-2">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save Attendance
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ── Staff Attendance Tab ──────────────────────────────────────────

function StaffAttendanceTab({ schoolId }: { schoolId: string }) {
  const today = format(new Date(), 'yyyy-MM-dd')
  const [date, setDate] = useState(today)
  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>({})
  const [search, setSearch] = useState('')

  const { data: staffData } = useStaffList(schoolId, { isActive: true, limit: 200 })
  const staff = useMemo(() => {
    const list = staffData?.data ?? []
    if (!search) return list
    const q = search.toLowerCase()
    return list.filter((s) => s.name.toLowerCase().includes(q) || s.designation.toLowerCase().includes(q))
  }, [staffData, search])

  const { data: existingRecords = [], isLoading: loadingExisting } = useStaffAttendance(schoolId, date)
  const { mutate: save, isPending: saving } = useBulkStaffAttendance(schoolId)

  useEffect(() => {
    const allStaff = staffData?.data ?? []
    if (!allStaff.length) { setStatuses({}); return }
    const map: Record<string, AttendanceStatus> = {}
    allStaff.forEach((s) => { map[s.id] = 'PRESENT' })
    existingRecords.forEach((r) => { map[r.staffId] = r.status })
    setStatuses(map)
  }, [staffData, existingRecords])

  const markAll = (s: AttendanceStatus) => {
    const allStaff = staffData?.data ?? []
    const map: Record<string, AttendanceStatus> = {}
    allStaff.forEach((st) => { map[st.id] = s })
    setStatuses(map)
  }

  const handleSave = () => {
    const allStaff = staffData?.data ?? []
    save({
      date,
      records: allStaff.map((s) => ({ staffId: s.id, status: statuses[s.id] ?? 'PRESENT' })),
    })
  }

  const counts = useMemo(() => {
    const c = { PRESENT: 0, ABSENT: 0, LATE: 0, LEAVE: 0 }
    Object.values(statuses).forEach((s) => { c[s]++ })
    return c
  }, [statuses])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Date</label>
          <Input type="date" className="h-9 mt-1 w-40" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="flex-1 min-w-48 max-w-72">
          <label className="text-xs font-medium text-muted-foreground">Search</label>
          <Input className="mt-1 h-9" placeholder="Filter by name / designation" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {staff.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          {STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => markAll(s)}
              className={cn('text-xs px-2.5 py-1 rounded-full border font-medium transition-colors', STATUS_CONFIG[s].bg, STATUS_CONFIG[s].color)}
            >
              Mark All {STATUS_CONFIG[s].label}
            </button>
          ))}
          <div className="ml-auto flex gap-3 text-sm">
            <span className="text-green-600 font-medium">{counts.PRESENT}P</span>
            <span className="text-red-600 font-medium">{counts.ABSENT}A</span>
            <span className="text-amber-600 font-medium">{counts.LATE}L</span>
            <span className="text-blue-600 font-medium">{counts.LEAVE}LV</span>
          </div>
        </div>
      )}

      {loadingExisting && (
        <div className="flex items-center gap-2 text-muted-foreground text-sm py-4">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      )}

      {!loadingExisting && staff.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">No active staff found.</p>
      )}

      {staff.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {staff.map((s, i) => (
                <div key={s.id} className="flex items-center gap-3 px-4 py-2.5">
                  <span className="text-xs text-muted-foreground w-6 shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-snug truncate">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.designation}</p>
                  </div>
                  {s.mpoStatus === 'MPO' && (
                    <Badge className="text-[10px] h-4 px-1 shrink-0">MPO</Badge>
                  )}
                  <StatusToggle
                    status={statuses[s.id] ?? 'PRESENT'}
                    onChange={(v) => setStatuses((prev) => ({ ...prev, [s.id]: v }))}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {staff.length > 0 && (
        <div className="pt-2">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save Attendance
          </Button>
        </div>
      )}
    </div>
  )
}

// ── Monthly Report Tab ────────────────────────────────────────────

function MonthlyReportTab({ schoolId }: { schoolId: string }) {
  const now = new Date()
  const [classId, setClassId] = useState('')
  const [sectionId, setSectionId] = useState('')
  const [sections, setSections] = useState<ClassSection[]>([])
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [sortAsc, setSortAsc] = useState(true)

  const { data: classes = [] } = useClasses(schoolId)

  useEffect(() => {
    setSectionId('')
    setSections([])
    if (!classId) return
    classApi.listSections(schoolId, classId).then((res) => {
      setSections(res.data.data ?? [])
    }).catch(() => {})
  }, [classId, schoolId])

  const { data: report = [], isLoading } = useMonthlyStudentReport(
    sectionId ? schoolId : null,
    sectionId ? { sectionId, month, year } : null,
  )

  const sorted = useMemo(() => {
    return [...report].sort((a, b) =>
      sortAsc
        ? b.attendancePercentage - a.attendancePercentage
        : a.attendancePercentage - b.attendancePercentage,
    )
  }, [report, sortAsc])

  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Class</label>
          <select
            className="mt-1 h-9 rounded-md border border-input bg-background px-3 text-sm block"
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
          >
            <option value="">Select class</option>
            {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        {sections.length > 0 && (
          <div>
            <label className="text-xs font-medium text-muted-foreground">Section</label>
            <select
              className="mt-1 h-9 rounded-md border border-input bg-background px-3 text-sm block"
              value={sectionId}
              onChange={(e) => setSectionId(e.target.value)}
            >
              <option value="">Select section</option>
              {sections.map((s) => <option key={s.id} value={s.id}>Section {s.name}</option>)}
            </select>
          </div>
        )}
        <div>
          <label className="text-xs font-medium text-muted-foreground">Month</label>
          <select
            className="mt-1 h-9 rounded-md border border-input bg-background px-3 text-sm block"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          >
            {monthNames.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Year</label>
          <select
            className="mt-1 h-9 rounded-md border border-input bg-background px-3 text-sm block"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {!sectionId && (
        <div className="text-center py-12 text-muted-foreground text-sm">
          Select class and section to view report.
        </div>
      )}

      {sectionId && isLoading && (
        <div className="flex items-center gap-2 text-muted-foreground text-sm py-8">
          <Loader2 className="h-4 w-4 animate-spin" /> Generating report…
        </div>
      )}

      {sectionId && !isLoading && report.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">No data for selected period.</p>
      )}

      {sorted.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">#</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Student</th>
                    <th className="text-center px-3 py-2.5 text-xs font-semibold text-green-700">Present</th>
                    <th className="text-center px-3 py-2.5 text-xs font-semibold text-red-700">Absent</th>
                    <th className="text-center px-3 py-2.5 text-xs font-semibold text-amber-700">Late</th>
                    <th
                      className="text-center px-3 py-2.5 text-xs font-semibold text-muted-foreground cursor-pointer select-none"
                      onClick={() => setSortAsc(!sortAsc)}
                    >
                      <span className="flex items-center justify-center gap-1">
                        % {sortAsc ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {sorted.map((row, i) => {
                    const pct = row.attendancePercentage
                    const pctColor = pct >= 75 ? 'text-green-600' : pct >= 60 ? 'text-amber-600' : 'text-red-600'
                    return (
                      <tr key={row.studentId} className="hover:bg-muted/20">
                        <td className="px-4 py-2 text-muted-foreground">{i + 1}</td>
                        <td className="px-4 py-2 font-medium">{row.studentName}</td>
                        <td className="px-3 py-2 text-center text-green-700">{row.totalPresent}</td>
                        <td className="px-3 py-2 text-center text-red-700">{row.totalAbsent}</td>
                        <td className="px-3 py-2 text-center text-amber-700">{row.totalLate}</td>
                        <td className={cn('px-3 py-2 text-center font-semibold', pctColor)}>
                          {pct.toFixed(1)}%
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────

function AttendancePage() {
  const { user } = useAuthStore()
  const schoolId = user?.schoolId ?? ''
  const [tab, setTab] = useState<Tab>('student')

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'student', label: 'Student Attendance', icon: <CheckCircle2 className="h-4 w-4" /> },
    { key: 'staff', label: 'Staff Attendance', icon: <XCircle className="h-4 w-4" /> },
    { key: 'report', label: 'Monthly Report', icon: <FileText className="h-4 w-4" /> },
  ]

  if (!schoolId) {
    return <div className="text-center py-16 text-muted-foreground text-sm">No school assigned.</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Attendance</h1>
        <p className="text-sm text-muted-foreground">Mark daily attendance and view monthly reports.</p>
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit">
        {tabs.map(({ key, label, icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cn(
              'flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors',
              tab === key
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      {tab === 'student' && <StudentAttendanceTab schoolId={schoolId} />}
      {tab === 'staff' && <StaffAttendanceTab schoolId={schoolId} />}
      {tab === 'report' && <MonthlyReportTab schoolId={schoolId} />}
    </div>
  )
}
