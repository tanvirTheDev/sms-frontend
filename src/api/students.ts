import { apiClient } from './client'
import type { ApiResponse, PaginatedResponse, StudentSummary } from '@/types'

export interface ListStudentsQuery {
  page?: number
  limit?: number
  search?: string
  classId?: string
  sectionId?: string
  isActive?: boolean
}

export const studentsApi = {
  list: (schoolId: string, query: ListStudentsQuery = {}) =>
    apiClient.get<ApiResponse<PaginatedResponse<StudentSummary>>>(
      `/schools/${schoolId}/students`,
      { params: query },
    ),

  getById: (schoolId: string, id: string) =>
    apiClient.get<ApiResponse<StudentSummary>>(`/schools/${schoolId}/students/${id}`),
}
