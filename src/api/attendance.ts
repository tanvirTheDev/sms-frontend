import { apiClient } from './client'
import type { ApiResponse, AttendanceRecord } from '@/types'

export const attendanceApi = {
  listStudentAttendance: (
    schoolId: string,
    params: { sectionId: string; date?: string; month?: number; year?: number },
  ) =>
    apiClient.get<ApiResponse<AttendanceRecord[]>>(
      `/schools/${schoolId}/student-attendance`,
      { params },
    ),
}
