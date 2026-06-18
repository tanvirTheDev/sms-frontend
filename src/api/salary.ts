import { apiClient } from './client'
import type { ApiResponse } from '@/types'
import type { SalaryRecord, SalarySlip, CreateSalaryPayload, UpdateSalaryPayload } from '@/types/salary'

export interface ListSalaryQuery {
  staffId?: string
  month?: number
  year?: number
  isPaid?: boolean
}

export interface SalaryListResponse {
  success: boolean
  data: SalaryRecord[]
}

export const salaryApi = {
  list: (schoolId: string, query: ListSalaryQuery = {}) =>
    apiClient.get<SalaryListResponse>(`/schools/${schoolId}/salary`, { params: query }),

  create: (schoolId: string, payload: CreateSalaryPayload) =>
    apiClient.post<ApiResponse<SalaryRecord>>(`/schools/${schoolId}/salary`, payload),

  update: (schoolId: string, id: string, payload: UpdateSalaryPayload) =>
    apiClient.patch<ApiResponse<SalaryRecord>>(`/schools/${schoolId}/salary/${id}`, payload),

  getSlip: (schoolId: string, id: string) =>
    apiClient.get<ApiResponse<SalarySlip>>(`/schools/${schoolId}/salary/${id}/slip`),
}
