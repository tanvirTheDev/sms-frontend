import type { StudentSubjectGroup, Religion, BloodGroup } from '@/types/student'
import type { Gender } from '@/types'

export const STUDENT_SUBJECT_GROUPS: { value: StudentSubjectGroup; label: string }[] = [
  { value: 'NONE', label: 'None / General' },
  { value: 'SCIENCE', label: 'Science' },
  { value: 'HUMANITIES', label: 'Humanities' },
  { value: 'COMMERCE', label: 'Commerce' },
  { value: 'GENERAL', label: 'General' },
  { value: 'DAKHIL_SCIENCE', label: 'Dakhil Science' },
  { value: 'DAKHIL_GENERAL', label: 'Dakhil General' },
  { value: 'ALIM_SCIENCE', label: 'Alim Science' },
  { value: 'ALIM_GENERAL', label: 'Alim General' },
]

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

export const GENDERS: { value: Gender; label: string }[] = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' },
]

export const GROUP_COLORS: Record<StudentSubjectGroup, string> = {
  NONE: 'bg-gray-100 text-gray-600',
  SCIENCE: 'bg-teal-100 text-teal-700',
  HUMANITIES: 'bg-pink-100 text-pink-700',
  COMMERCE: 'bg-yellow-100 text-yellow-700',
  GENERAL: 'bg-blue-100 text-blue-700',
  DAKHIL_SCIENCE: 'bg-emerald-100 text-emerald-700',
  DAKHIL_GENERAL: 'bg-cyan-100 text-cyan-700',
  ALIM_SCIENCE: 'bg-violet-100 text-violet-700',
  ALIM_GENERAL: 'bg-indigo-100 text-indigo-700',
}
