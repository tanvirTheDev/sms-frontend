import { apiClient } from './client'
import type { ApiResponse } from '@/types'
import type {
  ExamSchedule,
  ExamResult,
  StudentExamResult,
  CreateExamSchedulePayload,
  UpdateExamSchedulePayload,
  UpsertResultEntry,
} from '@/types/exam'

export interface ListSchedulesQuery {
  classId?: string
  academicYearId?: string
  examType?: string
  isPublished?: boolean
}

export interface ListResultsQuery {
  sectionId?: string
  subjectId?: string
  studentId?: string
}

export interface ListStudentResultsQuery {
  examScheduleId?: string
  academicYearId?: string
}

const base = (schoolId: string) => `/schools/${schoolId}`

export const examSchedulesApi = {
  list: (schoolId: string, query: ListSchedulesQuery = {}) =>
    apiClient.get<{ success: boolean; data: ExamSchedule[] }>(`${base(schoolId)}/exams`, { params: query }),

  get: (schoolId: string, id: string) =>
    apiClient.get<ApiResponse<ExamSchedule>>(`${base(schoolId)}/exams/${id}`),

  create: (schoolId: string, payload: CreateExamSchedulePayload) =>
    apiClient.post<ApiResponse<ExamSchedule>>(`${base(schoolId)}/exams`, payload),

  update: (schoolId: string, id: string, payload: UpdateExamSchedulePayload) =>
    apiClient.patch<ApiResponse<ExamSchedule>>(`${base(schoolId)}/exams/${id}`, payload),

  delete: (schoolId: string, id: string) =>
    apiClient.delete(`${base(schoolId)}/exams/${id}`),

  publish: (schoolId: string, id: string, isPublished: boolean) =>
    apiClient.patch<ApiResponse<ExamSchedule>>(`${base(schoolId)}/exams/${id}/publish`, { isPublished }),
}

export const examResultsApi = {
  list: (schoolId: string, examId: string, query: ListResultsQuery = {}) =>
    apiClient.get<{ success: boolean; data: ExamResult[] }>(
      `${base(schoolId)}/exams/${examId}/results`,
      { params: query }
    ),

  bulkUpsert: (schoolId: string, examId: string, results: UpsertResultEntry[]) =>
    apiClient.post<{ success: boolean; data: ExamResult[] }>(
      `${base(schoolId)}/exams/${examId}/results`,
      { results }
    ),

  publishResults: (schoolId: string, examId: string, isPublished = true) =>
    apiClient.patch<ApiResponse<ExamSchedule>>(
      `${base(schoolId)}/exams/${examId}/results/publish`,
      { isPublished }
    ),
}

export const studentResultsApi = {
  list: (schoolId: string, studentId: string, query: ListStudentResultsQuery = {}) =>
    apiClient.get<{ success: boolean; data: StudentExamResult[] }>(
      `${base(schoolId)}/students/${studentId}`,
      { params: query }
    ),
}
