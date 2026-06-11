import { apiClient } from './client'
import type { ApiResponse } from '@/types'
import type { StaffListItem, StaffDetail, CreateStaffPayload, UpdateStaffPayload } from '@/types/staff'

export interface ListStaffQuery {
  page?: number
  limit?: number
  search?: string
  role?: string
  isActive?: boolean
}

export interface StaffListResponse {
  success: boolean
  data: StaffListItem[]
  meta: { total: number; page: number; limit: number; totalPages: number }
}

export const staffApi = {
  list: (schoolId: string, query: ListStaffQuery = {}) =>
    apiClient.get<StaffListResponse>(`/schools/${schoolId}/staff`, { params: query }),

  getById: (schoolId: string, id: string) =>
    apiClient.get<ApiResponse<StaffDetail>>(`/schools/${schoolId}/staff/${id}`),

  create: (schoolId: string, payload: CreateStaffPayload) =>
    apiClient.post<ApiResponse<StaffListItem>>(`/schools/${schoolId}/staff`, payload),

  update: (schoolId: string, id: string, payload: UpdateStaffPayload) =>
    apiClient.patch<ApiResponse<StaffListItem>>(`/schools/${schoolId}/staff/${id}`, payload),

  deactivate: (schoolId: string, id: string) =>
    apiClient.delete<ApiResponse>(`/schools/${schoolId}/staff/${id}`),
}
