import type { Gender } from './index'

export type StudentSubjectGroup =
  | 'SCIENCE' | 'HUMANITIES' | 'COMMERCE' | 'GENERAL'
  | 'DAKHIL_SCIENCE' | 'DAKHIL_GENERAL' | 'ALIM_SCIENCE' | 'ALIM_GENERAL' | 'NONE'

export type Religion = 'ISLAM' | 'HINDUISM' | 'CHRISTIANITY' | 'BUDDHISM' | 'OTHER'
export type BloodGroup =
  | 'A_POSITIVE' | 'A_NEGATIVE' | 'B_POSITIVE' | 'B_NEGATIVE'
  | 'AB_POSITIVE' | 'AB_NEGATIVE' | 'O_POSITIVE' | 'O_NEGATIVE'

export interface StudentListItem {
  id: string
  schoolId: string
  studentId: string
  name: string
  nameBn: string | null
  gender: Gender
  sectionId: string
  subjectGroup: StudentSubjectGroup
  isActive: boolean
  createdAt: string
  section: {
    name: string
    class: { name: string }
  } | null
}

export interface StudentGuardian {
  id: string
  studentId: string
  name: string
  nameBn: string | null
  phone: string
  relation: string
  isEmergency: boolean
}

export interface StudentDetail {
  id: string
  schoolId: string
  studentId: string
  name: string
  nameBn: string | null
  gender: Gender
  sectionId: string
  subjectGroup: StudentSubjectGroup
  isActive: boolean
  createdAt: string
  birthRegNo: string | null
  nid: string | null
  religion: Religion | null
  bloodGroup: BloodGroup | null
  dateOfBirth: string | null
  photo: string | null
  address: string | null
  previousSchool: string | null
  droppedAt: string | null
  dropReason: string | null
  section: {
    id: string
    name: string
    capacity: number
    class: {
      id: string
      name: string
      schoolWingId: string
      academicYearId: string
    }
  } | null
  guardians: StudentGuardian[]
  idCard: { cardUrl: string; issuedAt: string; expiresAt: string } | null
}

export interface CreateStudentPayload {
  name: string
  nameBn?: string
  gender: Gender
  sectionId: string
  password: string
  studentId?: string
  birthRegNo?: string
  nid?: string
  religion?: Religion
  bloodGroup?: BloodGroup
  dateOfBirth?: string
  photo?: string
  address?: string
  subjectGroup?: StudentSubjectGroup
  previousSchool?: string
}

export type UpdateStudentPayload = Partial<Omit<CreateStudentPayload, 'password' | 'sectionId'> & { sectionId?: string }>

export interface DropStudentPayload {
  dropReason: string
}
