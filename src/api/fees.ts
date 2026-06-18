import { apiClient } from './client'
import type { ApiResponse } from '@/types'
import type {
  FeeStructure, CreateFeeStructurePayload, UpdateFeeStructurePayload,
  FeeCollection, CreateFeeCollectionPayload, UpdateFeeCollectionPayload,
  StudentDueEntry, FeeSummary,
} from '@/types/fee'
import type { PaymentStatus, FeeType } from '@/types/fee'

export interface ListFeeStructuresQuery {
  academicYearId?: string
  classId?: string
  feeType?: FeeType
}

export interface ListFeeCollectionsQuery {
  page?: number
  limit?: number
  studentId?: string
  status?: PaymentStatus
  feeType?: FeeType
  billingMonth?: number
  billingYear?: number
  academicYearId?: string
}

export interface FeeCollectionListResponse {
  success: boolean
  data: FeeCollection[]
  meta: { total: number; page: number; limit: number; totalPages: number }
}

export const feeStructureApi = {
  list: (schoolId: string, query: ListFeeStructuresQuery = {}) =>
    apiClient.get<ApiResponse<FeeStructure[]>>(`/schools/${schoolId}/fee-structures`, { params: query }),

  getById: (schoolId: string, id: string) =>
    apiClient.get<ApiResponse<FeeStructure>>(`/schools/${schoolId}/fee-structures/${id}`),

  create: (schoolId: string, payload: CreateFeeStructurePayload) =>
    apiClient.post<ApiResponse<FeeStructure>>(`/schools/${schoolId}/fee-structures`, payload),

  update: (schoolId: string, id: string, payload: UpdateFeeStructurePayload) =>
    apiClient.patch<ApiResponse<FeeStructure>>(`/schools/${schoolId}/fee-structures/${id}`, payload),

  delete: (schoolId: string, id: string) =>
    apiClient.delete<ApiResponse>(`/schools/${schoolId}/fee-structures/${id}`),
}

export const feeCollectionApi = {
  list: (schoolId: string, query: ListFeeCollectionsQuery = {}) =>
    apiClient.get<FeeCollectionListResponse>(`/schools/${schoolId}/fee-collections`, { params: query }),

  getById: (schoolId: string, id: string) =>
    apiClient.get<ApiResponse<FeeCollection>>(`/schools/${schoolId}/fee-collections/${id}`),

  create: (schoolId: string, payload: CreateFeeCollectionPayload) =>
    apiClient.post<ApiResponse<FeeCollection>>(`/schools/${schoolId}/fee-collections`, payload),

  update: (schoolId: string, id: string, payload: UpdateFeeCollectionPayload) =>
    apiClient.patch<ApiResponse<FeeCollection>>(`/schools/${schoolId}/fee-collections/${id}`, payload),

  dueReport: (schoolId: string, query: { academicYearId?: string; classId?: string; sectionId?: string } = {}) =>
    apiClient.get<ApiResponse<StudentDueEntry[]>>(`/schools/${schoolId}/fee-collections/due-report`, { params: query }),

  summary: (schoolId: string, query: { academicYearId?: string; billingMonth?: number; billingYear?: number } = {}) =>
    apiClient.get<ApiResponse<FeeSummary>>(`/schools/${schoolId}/fee-collections/summary`, { params: query }),

  myFees: (schoolId: string, studentId: string, query: { academicYearId?: string; status?: PaymentStatus; billingYear?: number } = {}) =>
    apiClient.get<ApiResponse<{ fees: FeeCollection[]; summary: { totalBilled: number; totalPaid: number; totalDue: number } }>>(
      `/schools/${schoolId}/fee-collections/my-fees`,
      { params: { studentId, ...query } }
    ),
}
