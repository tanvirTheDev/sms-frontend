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

export interface SchoolSearchResult {
  id: string
  name: string
  nameBn: string | null
  district: string | null
  upazila: string | null
  logoUrl: string | null
}

export const schoolsApi = {
  search: (q: string, district?: string) =>
    apiClient.get<{ success: boolean; data: SchoolSearchResult[]; meta: { total: number; page: number; limit: number; totalPages: number } }>(
      '/schools/search',
      { params: { q, district, limit: 10 } }
    ),

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
