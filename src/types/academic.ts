export type GradingSystem = 'GPA_5' | 'PERCENTAGE' | 'LETTER_GRADE'
export type WingType = 'PRIMARY' | 'SECONDARY' | 'HIGHER_SECONDARY'
export type ShiftType = 'MORNING' | 'DAY'
export type AcademicSubjectGroup = 'SCIENCE' | 'HUMANITIES' | 'COMMERCE' | 'NONE'

export interface AcademicYear {
  id: string
  schoolId: string
  name: string
  year: number
  gradingSystem: GradingSystem
  startDate: string
  endDate: string
  isCurrent: boolean
  createdAt: string
}

export interface SchoolWing {
  id: string
  schoolId: string
  wing: WingType
  shift: ShiftType | null
  campusId: string | null
  campus: { id: string; name: string } | null
}

export interface ClassSection {
  id: string
  classId: string
  name: string
  capacity: number
  _count: { students: number }
}

export interface SchoolClass {
  id: string
  schoolWingId: string
  academicYearId: string
  name: string
  orderIndex: number
  sections: ClassSection[]
  schoolWing: { id: string; wing: WingType; shift: ShiftType | null }
  academicYear?: { id: string; name: string; year: number; isCurrent: boolean }
}

export interface Subject {
  id: string
  schoolId: string
  name: string
  nameBn: string | null
  code: string | null
  wing: WingType
  subjectGroup: AcademicSubjectGroup
  isOptional: boolean
  isCompulsory: boolean
  fullMarks: number
  passMarks: number
  theoryMarks: number | null
  practicalMarks: number | null
  practicalPassMarks: number | null
  createdAt: string
}

export interface ClassSubject {
  id: string
  classId: string
  teacherId: string | null
  subject: Omit<Subject, 'schoolId' | 'createdAt'>
  teacher: { id: string; name: string; nameBn: string | null; designation: string } | null
}

// ── Payloads ──────────────────────────────────────────────────────────────────

export interface CreateAcademicYearPayload {
  name: string
  year: number
  gradingSystem?: GradingSystem
  startDate: string
  endDate: string
  isCurrent?: boolean
}
export type UpdateAcademicYearPayload = Partial<CreateAcademicYearPayload>

export interface CreateWingPayload {
  wing: WingType
  shift?: ShiftType
  campusId?: string
}
export type UpdateWingPayload = Partial<CreateWingPayload>

export interface CreateClassPayload {
  schoolWingId: string
  academicYearId: string
  name: string
  orderIndex: number
}
export type UpdateClassPayload = Partial<CreateClassPayload>

export interface CreateSectionPayload {
  name: string
  capacity?: number
}
export type UpdateSectionPayload = Partial<CreateSectionPayload>

export interface CreateSubjectPayload {
  name: string
  nameBn?: string
  code?: string
  wing: WingType
  subjectGroup?: AcademicSubjectGroup
  isOptional?: boolean
  isCompulsory?: boolean
  fullMarks: number
  passMarks: number
  theoryMarks?: number
  practicalMarks?: number
  practicalPassMarks?: number
}
export type UpdateSubjectPayload = Partial<CreateSubjectPayload>

export interface AssignSubjectPayload {
  subjectId: string
  teacherId?: string | null
}
