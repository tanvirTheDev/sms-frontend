import type { StaffRole, Religion, BloodGroup, MpoStatus } from '@/types/staff'

export const STAFF_ROLES: { value: StaffRole; label: string; group: string }[] = [
  { value: 'PRINCIPAL', label: 'Principal', group: 'Administration' },
  { value: 'HEADMASTER', label: 'Headmaster', group: 'Administration' },
  { value: 'VICE_PRINCIPAL', label: 'Vice Principal', group: 'Administration' },
  { value: 'ASSISTANT_HEADMASTER', label: 'Asst. Headmaster', group: 'Administration' },
  { value: 'SENIOR_TEACHER', label: 'Senior Teacher', group: 'Teaching' },
  { value: 'TEACHER', label: 'Teacher', group: 'Teaching' },
  { value: 'ASSISTANT_TEACHER', label: 'Asst. Teacher', group: 'Teaching' },
  { value: 'LECTURER', label: 'Lecturer', group: 'Teaching' },
  { value: 'DEMONSTRATOR', label: 'Demonstrator', group: 'Teaching' },
  { value: 'LIBRARIAN', label: 'Librarian', group: 'Support' },
  { value: 'LAB_ASSISTANT', label: 'Lab Assistant', group: 'Support' },
  { value: 'COMPUTER_OPERATOR', label: 'Computer Operator', group: 'Support' },
  { value: 'ACCOUNTANT', label: 'Accountant', group: 'Support' },
  { value: 'OFFICE_ASSISTANT', label: 'Office Assistant', group: 'Support' },
  { value: 'PEON', label: 'Peon', group: 'Support' },
  { value: 'GUARD', label: 'Guard', group: 'Support' },
]

export const STAFF_ROLE_OPTIONS = STAFF_ROLES.map(({ value, label }) => ({ value, label }))

export const RELIGIONS: { value: Religion; label: string }[] = [
  { value: 'ISLAM', label: 'Islam' },
  { value: 'HINDUISM', label: 'Hinduism' },
  { value: 'CHRISTIANITY', label: 'Christianity' },
  { value: 'BUDDHISM', label: 'Buddhism' },
  { value: 'OTHER', label: 'Other' },
]

export const BLOOD_GROUPS: { value: BloodGroup; label: string }[] = [
  { value: 'A_POSITIVE', label: 'A+' },
  { value: 'A_NEGATIVE', label: 'A-' },
  { value: 'B_POSITIVE', label: 'B+' },
  { value: 'B_NEGATIVE', label: 'B-' },
  { value: 'AB_POSITIVE', label: 'AB+' },
  { value: 'AB_NEGATIVE', label: 'AB-' },
  { value: 'O_POSITIVE', label: 'O+' },
  { value: 'O_NEGATIVE', label: 'O-' },
]

export const MPO_STATUSES: { value: MpoStatus; label: string }[] = [
  { value: 'MPO', label: 'MPO' },
  { value: 'NON_MPO', label: 'Non-MPO' },
  { value: 'GOVERNMENT', label: 'Government' },
  { value: 'SEMI_GOVERNMENT', label: 'Semi-Government' },
  { value: 'PRIVATE', label: 'Private' },
  { value: 'AUTONOMOUS', label: 'Autonomous' },
]

export const GENDERS = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' },
]

export const ROLE_GROUP_LABELS: Record<string, string> = {
  PRINCIPAL: 'Admin',
  HEADMASTER: 'Admin',
  VICE_PRINCIPAL: 'Admin',
  ASSISTANT_HEADMASTER: 'Admin',
  SENIOR_TEACHER: 'Teacher',
  TEACHER: 'Teacher',
  ASSISTANT_TEACHER: 'Teacher',
  LECTURER: 'Teacher',
  DEMONSTRATOR: 'Teacher',
  LIBRARIAN: 'Support',
  LAB_ASSISTANT: 'Support',
  COMPUTER_OPERATOR: 'Support',
  ACCOUNTANT: 'Support',
  OFFICE_ASSISTANT: 'Support',
  PEON: 'Support',
  GUARD: 'Support',
}
