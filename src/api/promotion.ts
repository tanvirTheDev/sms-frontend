import { apiClient } from './client'
import type { ApiResponse } from '@/types'

export type PromotionStatus = 'PROMOTED' | 'FAILED' | 'DROPPED' | 'TRANSFERRED' | 'DETAINED'
export type SubjectGroup = 'SCIENCE' | 'HUMANITIES' | 'COMMERCE' | 'GENERAL' | 'DAKHIL_SCIENCE' | 'DAKHIL_GENERAL' | 'ALIM_SCIENCE' | 'ALIM_GENERAL' | 'NONE'

export interface PromotionRecord {
  id: string
  academicYearId: string
  fromSectionId: string
  toSectionId: string | null
  status: PromotionStatus
  groupAssigned: SubjectGroup
  groupChangeLog: string | null
  promotedAt: string
  promotedBy: string
  student: {
    id: string
    studentId: string
    name: string
    nameBn: string | null
    gender: string
    subjectGroup: SubjectGroup
    sectionId: string
  }
  academicYear: { id: string; name: string; year: number }
  promotedByUser: { id: string; role: string }
}

export interface BulkPromotePayload {
  academicYearId: string
  fromSectionId: string
  records: {
    studentId: string
    status: PromotionStatus
    toSectionId?: string
    groupAssigned?: SubjectGroup
  }[]
}

export interface UpdateGroupPayload {
  groupAssigned: SubjectGroup
  groupChangeLog: string
}

export interface ListPromotionsQuery {
  academicYearId?: string
  fromSectionId?: string
  toSectionId?: string
  status?: PromotionStatus
  studentId?: string
}

const base = (schoolId: string) => `/schools/${schoolId}/promotions`

export const promotionApi = {
  list: (schoolId: string, query: ListPromotionsQuery = {}) =>
    apiClient.get<ApiResponse<PromotionRecord[]>>(base(schoolId), { params: query }),

  getById: (schoolId: string, id: string) =>
    apiClient.get<ApiResponse<PromotionRecord>>(`${base(schoolId)}/${id}`),

  bulkPromote: (schoolId: string, payload: BulkPromotePayload) =>
    apiClient.post<ApiResponse<{ processed: number; promotionRecordIds: string[] }>>(base(schoolId), payload),

  updateGroup: (schoolId: string, id: string, payload: UpdateGroupPayload) =>
    apiClient.patch<ApiResponse<PromotionRecord>>(`${base(schoolId)}/${id}/group`, payload),

  delete: (schoolId: string, id: string) =>
    apiClient.delete<ApiResponse>(`${base(schoolId)}/${id}`),
}
