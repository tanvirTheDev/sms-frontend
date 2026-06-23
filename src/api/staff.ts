import { apiClient } from './client'
import type { ApiResponse } from '@/types'
import type { StaffListItem, StaffDetail, CreateStaffPayload, UpdateStaffPayload, ServiceBookEntryType } from '@/types/staff'

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

export interface CreateServiceBookEntryPayload {
  type: ServiceBookEntryType
  date: string
  description: string
  orderRef?: string
}

export interface ServiceBookEntry {
  id: string
  staffId: string
  type: ServiceBookEntryType
  date: string
  description: string
  orderRef: string | null
  attachment: string | null
  createdAt: string
}

export interface ServiceBookListResponse {
  success: boolean
  data: ServiceBookEntry[]
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

export const serviceBookApi = {
  list: (schoolId: string, staffId: string, params?: { page?: number; limit?: number }) =>
    apiClient.get<ServiceBookListResponse>(`/schools/${schoolId}/staff/${staffId}/service-book`, { params }),

  create: (schoolId: string, staffId: string, payload: CreateServiceBookEntryPayload, attachmentFile?: File) => {
    if (attachmentFile) {
      const fd = new FormData()
      Object.entries(payload).forEach(([k, v]) => { if (v !== undefined && v !== null) fd.append(k, String(v)) })
      fd.append('attachment', attachmentFile)
      return apiClient.post<ApiResponse<ServiceBookEntry>>(`/schools/${schoolId}/staff/${staffId}/service-book`, fd)
    }
    return apiClient.post<ApiResponse<ServiceBookEntry>>(`/schools/${schoolId}/staff/${staffId}/service-book`, payload)
  },

  update: (schoolId: string, staffId: string, id: string, payload: Partial<CreateServiceBookEntryPayload>, attachmentFile?: File) => {
    if (attachmentFile) {
      const fd = new FormData()
      Object.entries(payload).forEach(([k, v]) => { if (v !== undefined && v !== null) fd.append(k, String(v)) })
      fd.append('attachment', attachmentFile)
      return apiClient.patch<ApiResponse<ServiceBookEntry>>(`/schools/${schoolId}/staff/${staffId}/service-book/${id}`, fd)
    }
    return apiClient.patch<ApiResponse<ServiceBookEntry>>(`/schools/${schoolId}/staff/${staffId}/service-book/${id}`, payload)
  },

  delete: (schoolId: string, staffId: string, id: string) =>
    apiClient.delete<ApiResponse>(`/schools/${schoolId}/staff/${staffId}/service-book/${id}`),
}
