import { apiClient } from './client'
import type { StudentListItem, StudentDetail, CreateStudentPayload, UpdateStudentPayload, DropStudentPayload } from '@/types/student'

export interface ListStudentsQuery {
  page?: number
  limit?: number
  search?: string
  classId?: string
  sectionId?: string
  subjectGroup?: string
  isActive?: boolean
}

export interface StudentListResponse {
  success: boolean
  data: StudentListItem[]
  meta: { total: number; page: number; limit: number; totalPages: number }
}

type SimpleResponse<T> = { success: boolean; data: T; message?: string }

export const studentsApi = {
  list: (schoolId: string, query: ListStudentsQuery = {}) =>
    apiClient.get<StudentListResponse>(`/schools/${schoolId}/students`, { params: query }),

  getById: (schoolId: string, id: string) =>
    apiClient.get<SimpleResponse<StudentDetail>>(`/schools/${schoolId}/students/${id}`),

  create: (schoolId: string, payload: CreateStudentPayload, photoFile?: File) => {
    if (photoFile) {
      const fd = new FormData()
      Object.entries(payload).forEach(([k, v]) => { if (v !== undefined && v !== null) fd.append(k, String(v)) })
      fd.append('photo', photoFile)
      return apiClient.post<SimpleResponse<StudentListItem>>(`/schools/${schoolId}/students`, fd)
    }
    return apiClient.post<SimpleResponse<StudentListItem>>(`/schools/${schoolId}/students`, payload)
  },

  update: (schoolId: string, id: string, payload: UpdateStudentPayload, photoFile?: File) => {
    if (photoFile) {
      const fd = new FormData()
      Object.entries(payload).forEach(([k, v]) => { if (v !== undefined && v !== null) fd.append(k, String(v)) })
      fd.append('photo', photoFile)
      return apiClient.patch<SimpleResponse<StudentListItem>>(`/schools/${schoolId}/students/${id}`, fd)
    }
    return apiClient.patch<SimpleResponse<StudentListItem>>(`/schools/${schoolId}/students/${id}`, payload)
  },

  drop: (schoolId: string, id: string, payload: DropStudentPayload) =>
    apiClient.delete<SimpleResponse<null>>(`/schools/${schoolId}/students/${id}`, { data: payload }),
}
