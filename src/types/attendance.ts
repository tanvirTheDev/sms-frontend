export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE'

export interface StudentAttendanceRecord {
  studentId: string
  date: string
  status: AttendanceStatus
  note: string | null
}

export interface BulkStudentAttendancePayload {
  sectionId: string
  date: string
  records: { studentId: string; status: AttendanceStatus; note?: string }[]
}

export interface StaffAttendanceRecord {
  staffId: string
  date: string
  status: AttendanceStatus
  note: string | null
}

export interface BulkStaffAttendancePayload {
  date: string
  records: { staffId: string; status: AttendanceStatus; note?: string }[]
}

export interface MonthlyStudentReport {
  studentId: string
  studentName: string
  totalPresent: number
  totalAbsent: number
  totalLate: number
  attendancePercentage: number
}
