import { apiClient } from './client'
import type { ApiResponse } from '@/types'
import type { School, SchoolDashboardStats, CreateSchoolPayload, UpdateSchoolPayload, CreateSchoolResult } from '@/types/school'

export interface ListSchoolsQuery {
  page?: number
  limit?: number
  search?: string
  isActive?: boolean
}

export interface SchoolListResponse {
  success: boolean
  data: School[]
  meta: { total: number; page: number; limit: number; totalPages: number }
}

export const schoolsApi = {
  list: (query: ListSchoolsQuery = {}) =>
    apiClient.get<SchoolListResponse>('/schools', { params: query }),

  getById: (id: string) =>
    apiClient.get<ApiResponse<School>>(`/schools/${id}`),

  getDashboard: (schoolId: string) =>
    apiClient.get<ApiResponse<SchoolDashboardStats>>(`/schools/${schoolId}/dashboard`),

  create: (payload: CreateSchoolPayload) =>
    apiClient.post<ApiResponse<CreateSchoolResult>>('/schools', payload),

  update: (id: string, payload: UpdateSchoolPayload) =>
    apiClient.patch<ApiResponse<School>>(`/schools/${id}`, payload),

  deactivate: (id: string) =>
    apiClient.delete<ApiResponse>(`/schools/${id}`),
}
