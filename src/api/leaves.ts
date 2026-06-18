import { apiClient } from './client'
import type { LeaveApplication, CreateLeavePayload, ReviewLeavePayload, CancelLeavePayload } from '@/types/leave'

type SR<T> = { success: boolean; data: T }

const staffBase = (schoolId: string, staffId: string) => `/schools/${schoolId}/staff/${staffId}/leaves`
const schoolBase = (schoolId: string) => `/schools/${schoolId}/leaves`

export const staffLeavesApi = {
  list: (schoolId: string, staffId: string, params: { status?: string; type?: string; year?: number } = {}) =>
    apiClient.get<SR<LeaveApplication[]>>(staffBase(schoolId, staffId), { params }),

  create: (schoolId: string, staffId: string, payload: CreateLeavePayload) =>
    apiClient.post<SR<LeaveApplication>>(staffBase(schoolId, staffId), payload),

  review: (schoolId: string, staffId: string, leaveId: string, payload: ReviewLeavePayload) =>
    apiClient.patch<SR<LeaveApplication>>(`${staffBase(schoolId, staffId)}/${leaveId}/review`, payload),

  cancel: (schoolId: string, staffId: string, leaveId: string, payload: CancelLeavePayload = {}) =>
    apiClient.patch<SR<LeaveApplication>>(`${staffBase(schoolId, staffId)}/${leaveId}/cancel`, payload),

  delete: (schoolId: string, staffId: string, leaveId: string) =>
    apiClient.delete<SR<null>>(`${staffBase(schoolId, staffId)}/${leaveId}`),
}

export const schoolLeavesApi = {
  list: (schoolId: string, params: { status?: string; type?: string; year?: number } = {}) =>
    apiClient.get<SR<LeaveApplication[]>>(schoolBase(schoolId), { params }),
}
