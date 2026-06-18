import { apiClient } from './client'
import type { ApiResponse } from '@/types'
import type { Guardian, CreateGuardianPayload, UpdateGuardianPayload } from '@/types/guardian'

const base = (schoolId: string, studentId: string) =>
  `/schools/${schoolId}/students/${studentId}/guardians`

export const guardiansApi = {
  list: (schoolId: string, studentId: string) =>
    apiClient.get<ApiResponse<Guardian[]>>(`${base(schoolId, studentId)}`),

  getById: (schoolId: string, studentId: string, id: string) =>
    apiClient.get<ApiResponse<Guardian>>(`${base(schoolId, studentId)}/${id}`),

  create: (schoolId: string, studentId: string, payload: CreateGuardianPayload) =>
    apiClient.post<ApiResponse<Guardian>>(`${base(schoolId, studentId)}`, payload),

  update: (schoolId: string, studentId: string, id: string, payload: UpdateGuardianPayload) =>
    apiClient.patch<ApiResponse<Guardian>>(`${base(schoolId, studentId)}/${id}`, payload),

  delete: (schoolId: string, studentId: string, id: string) =>
    apiClient.delete<ApiResponse>(`${base(schoolId, studentId)}/${id}`),
}
