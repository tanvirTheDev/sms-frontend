import type { Gender } from './index'

export type StaffRole =
  | 'PRINCIPAL' | 'HEADMASTER' | 'VICE_PRINCIPAL' | 'ASSISTANT_HEADMASTER'
  | 'SENIOR_TEACHER' | 'TEACHER' | 'ASSISTANT_TEACHER' | 'LECTURER'
  | 'DEMONSTRATOR' | 'LIBRARIAN' | 'LAB_ASSISTANT' | 'COMPUTER_OPERATOR'
  | 'ACCOUNTANT' | 'OFFICE_ASSISTANT' | 'PEON' | 'GUARD'

export type Religion = 'ISLAM' | 'HINDUISM' | 'CHRISTIANITY' | 'BUDDHISM' | 'OTHER'

export type BloodGroup =
  | 'A_POSITIVE' | 'A_NEGATIVE' | 'B_POSITIVE' | 'B_NEGATIVE'
  | 'AB_POSITIVE' | 'AB_NEGATIVE' | 'O_POSITIVE' | 'O_NEGATIVE'

export type MpoStatus =
  | 'GOVERNMENT' | 'SEMI_GOVERNMENT' | 'MPO' | 'NON_MPO' | 'PRIVATE' | 'AUTONOMOUS'

// Shape returned by list endpoint
export interface StaffListItem {
  id: string
  schoolId: string
  userId: string
  employeeId: string | null
  name: string
  nameBn: string | null
  phone: string
  email: string | null
  gender: Gender
  designation: string
  role: StaffRole
  mpoStatus: MpoStatus
  joiningDate: string
  isActive: boolean
  createdAt: string
}

// Full shape returned by getById
export interface StaffDetail extends StaffListItem {
  nid: string | null
  religion: Religion | null
  bloodGroup: BloodGroup | null
  dateOfBirth: string | null
  photo: string | null
  address: string | null
  mpoIndex: string | null
  indexNo: string | null
  tin: string | null
  subjectSpec: string | null
  classSubjects: {
    id: string
    subject: { id: string; name: string; nameBn: string | null }
    class: { id: string; name: string }
  }[]
  serviceBookEntries: {
    id: string
    date: string
    type: string
    description: string
  }[]
}

export interface CreateStaffPayload {
  name: string
  nameBn?: string
  nid?: string
  phone: string
  email?: string
  password: string
  gender: Gender
  religion?: Religion
  bloodGroup?: BloodGroup
  dateOfBirth?: string
  address?: string
  designation: string
  role: StaffRole
  mpoStatus?: MpoStatus
  mpoIndex?: string
  joiningDate: string
  employeeId?: string
  indexNo?: string
  tin?: string
  subjectSpec?: string
}

export type UpdateStaffPayload = Partial<Omit<CreateStaffPayload, 'password'>>
