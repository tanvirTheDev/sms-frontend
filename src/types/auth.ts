export type UserRole =
  | 'SUPER_ADMIN'
  | 'SCHOOL_ADMIN'
  | 'PRINCIPAL'
  | 'TEACHER'
  | 'ACCOUNTANT'
  | 'OFFICE_STAFF'
  | 'LIBRARIAN'
  | 'PARENT'
  | 'GUARDIAN'
  | 'STUDENT'

export interface UserProfile {
  id: string
  phone: string
  email: string | null
  role: UserRole
  schoolId: string | null
  staffId: string | null
  studentId: string | null
  isActive: boolean
  isVerified: boolean
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: UserProfile
}

export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data?: T
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}
