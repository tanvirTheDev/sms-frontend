import { apiClient } from './client'
import type {
  StudentAttendanceRecord, BulkStudentAttendancePayload,
  StaffAttendanceRecord, BulkStaffAttendancePayload,
  MonthlyStudentReport,
} from '@/types/attendance'
import type { ApiResponse } from '@/types'

export const studentAttendanceApi = {
  list: (schoolId: string, params: { sectionId: string; date?: string; month?: number; year?: number }) =>
    apiClient.get<ApiResponse<StudentAttendanceRecord[]>>(`/schools/${schoolId}/student-attendance`, { params }),

  bulkSave: (schoolId: string, payload: BulkStudentAttendancePayload) =>
    apiClient.post<ApiResponse>(`/schools/${schoolId}/student-attendance`, payload),

  monthlyReport: (schoolId: string, params: { sectionId: string; month: number; year: number }) =>
    apiClient.get<ApiResponse<MonthlyStudentReport[]>>(`/schools/${schoolId}/student-attendance/monthly-report`, { params }),
}

export const staffAttendanceApi = {
  list: (schoolId: string, params: { date?: string; month?: number; year?: number; staffId?: string }) =>
    apiClient.get<ApiResponse<StaffAttendanceRecord[]>>(`/schools/${schoolId}/staff-attendance`, { params }),

  bulkSave: (schoolId: string, payload: BulkStaffAttendancePayload) =>
    apiClient.post<ApiResponse>(`/schools/${schoolId}/staff-attendance`, payload),
}
