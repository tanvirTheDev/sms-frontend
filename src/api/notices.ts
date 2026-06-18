import { apiClient } from './client'
import type { ApiResponse } from '@/types'
import type { Notice, CreateNoticePayload, UpdateNoticePayload, NoticeTarget, WingType } from '@/types/communication'

export interface ListNoticesQuery {
  page?: number
  limit?: number
  search?: string
  target?: NoticeTarget
  wingTarget?: WingType
  classId?: string
  sectionId?: string
  isPublished?: boolean
}

export interface NoticeListResponse {
  success: boolean
  data: Notice[]
  meta: { total: number; page: number; limit: number; totalPages: number }
}

export const noticesApi = {
  list: (schoolId: string, query: ListNoticesQuery = {}) =>
    apiClient.get<NoticeListResponse>(`/schools/${schoolId}/notices`, { params: query }),

  getById: (schoolId: string, id: string) =>
    apiClient.get<ApiResponse<Notice>>(`/schools/${schoolId}/notices/${id}`),

  create: (schoolId: string, payload: CreateNoticePayload) =>
    apiClient.post<ApiResponse<Notice>>(`/schools/${schoolId}/notices`, payload),

  update: (schoolId: string, id: string, payload: UpdateNoticePayload) =>
    apiClient.patch<ApiResponse<Notice>>(`/schools/${schoolId}/notices/${id}`, payload),

  publish: (schoolId: string, id: string, isPublished: boolean) =>
    apiClient.patch<ApiResponse<Notice>>(`/schools/${schoolId}/notices/${id}/publish`, { isPublished }),

  delete: (schoolId: string, id: string) =>
    apiClient.delete<ApiResponse>(`/schools/${schoolId}/notices/${id}`),
}
