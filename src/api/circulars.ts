import { apiClient } from './client'
import type { ApiResponse } from '@/types'
import type { Circular, CreateCircularPayload, UpdateCircularPayload } from '@/types/communication'

export interface ListCircularsQuery {
  page?: number
  limit?: number
  search?: string
  isPublished?: boolean
}

export interface CircularListResponse {
  success: boolean
  data: Circular[]
  meta: { total: number; page: number; limit: number; totalPages: number }
}

export const circularsApi = {
  list: (schoolId: string, query: ListCircularsQuery = {}) =>
    apiClient.get<CircularListResponse>(`/schools/${schoolId}/circulars`, { params: query }),

  getById: (schoolId: string, id: string) =>
    apiClient.get<ApiResponse<Circular>>(`/schools/${schoolId}/circulars/${id}`),

  create: (schoolId: string, payload: CreateCircularPayload) =>
    apiClient.post<ApiResponse<Circular>>(`/schools/${schoolId}/circulars`, payload),

  update: (schoolId: string, id: string, payload: UpdateCircularPayload) =>
    apiClient.patch<ApiResponse<Circular>>(`/schools/${schoolId}/circulars/${id}`, payload),

  publish: (schoolId: string, id: string, isPublished: boolean) =>
    apiClient.patch<ApiResponse<Circular>>(`/schools/${schoolId}/circulars/${id}/publish`, { isPublished }),

  delete: (schoolId: string, id: string) =>
    apiClient.delete<ApiResponse>(`/schools/${schoolId}/circulars/${id}`),
}
