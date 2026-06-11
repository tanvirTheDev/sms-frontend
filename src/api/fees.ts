import { apiClient } from './client'
import type { ApiResponse, FeeSummary, DueReportItem, PaginatedResponse } from '@/types'

export const feesApi = {
  getSummary: (schoolId: string, params: { year?: number; academicYearId?: string } = {}) =>
    apiClient.get<ApiResponse<FeeSummary>>(
      `/schools/${schoolId}/fee-collections/summary`,
      { params },
    ),

  getDueReport: (schoolId: string, params: { classId?: string; limit?: number } = {}) =>
    apiClient.get<ApiResponse<PaginatedResponse<DueReportItem>>>(
      `/schools/${schoolId}/fee-collections/due-report`,
      { params },
    ),
}
