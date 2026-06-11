export type ManagementType = 'GOVERNMENT' | 'SEMI_GOVERNMENT' | 'MPO' | 'NON_MPO' | 'PRIVATE' | 'AUTONOMOUS'
export type InstitutionType = 'SCHOOL' | 'MADRASA' | 'COLLEGE' | 'SCHOOL_AND_COLLEGE' | 'TECHNICAL'
export type InstitutionLevel = 'PRE_PRIMARY' | 'PRIMARY' | 'SECONDARY' | 'HIGHER_SECONDARY' | 'COMBINED'
export type MediumOfInstruction = 'BANGLA' | 'ENGLISH' | 'BOTH'
export type InstitutionGender = 'BOYS' | 'GIRLS' | 'CO_ED'
export type LocationType = 'CITY_CORPORATION' | 'PAURASHAVA' | 'UPAZILA_SADAR' | 'UNION' | 'RURAL'
export type BoardAffiliation =
  | 'DHAKA' | 'CHITTAGONG' | 'RAJSHAHI' | 'COMILLA'
  | 'JESSORE' | 'SYLHET' | 'BARISAL' | 'DINAJPUR'
  | 'MADRASA' | 'TECHNICAL' | 'PRIMARY'

export interface School {
  id: string
  name: string
  nameBn: string | null
  slug: string
  eiin: string | null
  banbisCode: string | null
  recognitionNo: string | null
  managementType: ManagementType
  institutionType: InstitutionType
  level: InstitutionLevel
  medium: MediumOfInstruction
  gender: InstitutionGender
  boardAffiliation: BoardAffiliation | null
  establishedYear: number | null
  phone: string
  email: string | null
  address: string
  division: string
  district: string
  upazila: string
  unionParishad: string | null
  ward: string | null
  postCode: string | null
  locationType: LocationType
  logoUrl: string | null
  isActive: boolean
  createdAt: string
}

export interface SchoolDashboardStats {
  totalStudents: number
  totalStaff: number
  todayStudentAttendance: {
    present: number
    absent: number
    late: number
    percentage: number
  }
  totalFeeDue: number
  upcomingExams: {
    id: string
    name: string
    startDate: string
    examType: string
  }[]
  activeNotices: number
}

export interface CreateSchoolPayload {
  name: string
  nameBn?: string
  slug: string
  eiin?: string
  banbisCode?: string
  recognitionNo?: string
  managementType: ManagementType
  institutionType: InstitutionType
  level: InstitutionLevel
  medium: MediumOfInstruction
  gender: InstitutionGender
  boardAffiliation?: BoardAffiliation
  establishedYear?: number
  phone: string
  email?: string
  address: string
  division: string
  district: string
  upazila: string
  unionParishad?: string
  ward?: string
  postCode?: string
  locationType: LocationType
  logoUrl?: string
}

export type UpdateSchoolPayload = Partial<CreateSchoolPayload>

export interface AdminCredentials {
  phone: string
  tempPassword: string
}

export interface CreateSchoolResult {
  school: School
  adminCredentials: AdminCredentials
}
