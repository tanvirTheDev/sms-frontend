export type ExamType = 'CLASS_TEST' | 'MONTHLY' | 'HALF_YEARLY' | 'ANNUAL' | 'TEST'

export interface ExamSchedule {
  id: string
  schoolId: string
  academicYearId: string
  classId: string
  examType: ExamType
  name: string
  startDate: string
  endDate: string
  resultPublishedAt: string | null
  isPublished: boolean
  createdAt: string
  class: { id: string; name: string }
  academicYear: { id: string; name: string; year: number }
  _count?: { results: number }
}

export interface ExamResult {
  id: string
  examScheduleId: string
  studentId: string
  sectionId: string
  subjectId: string
  theoryMarks: string | null
  practicalMarks: string | null
  marksObtained: string
  grade: string | null
  gpa: string | null
  isAbsent: boolean
  isPracticalAbsent: boolean
  teacherComment: string | null
  student: { id: string; name: string; studentId: string }
  subject: { id: string; name: string; code: string | null }
  section?: { id: string; name: string }
}

export interface StudentExamResult extends ExamResult {
  examSchedule: { id: string; name: string; examType: ExamType; startDate: string }
}

export interface UpsertResultEntry {
  studentId: string
  sectionId: string
  subjectId: string
  theoryMarks?: number
  practicalMarks?: number
  marksObtained: number
  isAbsent?: boolean
  teacherComment?: string
}

export interface CreateExamSchedulePayload {
  academicYearId: string
  classId: string
  examType: ExamType
  name: string
  startDate: string
  endDate: string
  resultPublishedAt?: string
  isPublished?: boolean
}

export type UpdateExamSchedulePayload = Partial<CreateExamSchedulePayload>
