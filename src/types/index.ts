export * from './auth'

// ── Shared ────────────────────────────────────────────────────

export type SubjectGroup = 'SCIENCE' | 'HUMANITIES' | 'COMMERCE' | 'NONE'
export type Wing = 'PRIMARY' | 'SECONDARY' | 'HIGHER_SECONDARY'
export type Gender = 'MALE' | 'FEMALE' | 'OTHER'
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE'
export type PaymentStatus = 'PAID' | 'UNPAID' | 'PARTIAL' | 'WAIVED'
export type FeeType = 'TUITION' | 'ADMISSION' | 'EXAM' | 'LIBRARY' | 'TRANSPORT' | 'OTHER'

// ── Student ───────────────────────────────────────────────────

export interface StudentSummary {
  id: string
  studentId: string
  name: string
  nameBn: string | null
  gender: Gender
  sectionId: string
  subjectGroup: SubjectGroup
  isActive: boolean
  createdAt: string
  section: {
    name: string
    class: { name: string }
  } | null
}

// ── Staff ─────────────────────────────────────────────────────

export interface StaffSummary {
  id: string
  employeeId: string | null
  name: string
  nameBn: string | null
  phone: string
  designation: string
  role: string
  mpoStatus: 'MPO' | 'NON_MPO'
  isActive: boolean
  joiningDate: string
}

// ── Fee ───────────────────────────────────────────────────────

export interface FeeSummary {
  totalBilled: string
  totalCollected: string
  totalDue: string
  totalWaived: string
  paidCount: number
  unpaidCount: number
  partialCount: number
}

export interface DueReportItem {
  studentId: string
  studentName: string
  studentIdNo: string
  className: string
  sectionName: string
  totalDue: string
  oldestDueDate: string
}

// ── Notice ────────────────────────────────────────────────────

export type NoticeTarget = 'ALL' | 'TEACHERS' | 'STUDENTS' | 'PARENTS' | 'STAFF'

export interface Notice {
  id: string
  title: string
  body: string
  target: NoticeTarget
  isPublished: boolean
  publishedAt: string | null
  createdAt: string
}

// ── Attendance ────────────────────────────────────────────────

export interface AttendanceRecord {
  studentId: string
  date: string
  status: AttendanceStatus
  note: string | null
}

export interface AttendanceSummary {
  date: string
  total: number
  present: number
  absent: number
  late: number
  leave: number
  percentage: number
}
